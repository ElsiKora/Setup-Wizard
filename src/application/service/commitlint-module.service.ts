import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigCommitlintTicket } from "../interface/config/commitlint-ticket.interface";
import type { IConfigCommitlint } from "../interface/config/commitlint.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { ECommitlintMode } from "../../domain/enum/commitlint-mode.enum";
import { ECommitlintProvider } from "../../domain/enum/commitlint-provider.enum";
import { ECommitlintTicketMissingBranchLintBehavior } from "../../domain/enum/commitlint-ticket-missing-branch-lint-behavior.enum";
import { ECommitlintTicketNormalization } from "../../domain/enum/commitlint-ticket-normalization.enum";
import { ECommitlintTicketSource } from "../../domain/enum/commitlint-ticket-source.enum";
import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { COMMITLINT_AI_CONFIG, COMMITLINT_AI_DEFAULTS } from "../constant/commitlint/ai-config.constant";
import { COMMITLINT_CONFIG } from "../constant/commitlint/config.constant";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/commitlint/core-dependencies.constant";
import { COMMITLINT_CONFIG_FILE_NAMES } from "../constant/commitlint/file-names.constant";
import { COMMITLINT_CONFIG_FILE_PATHS } from "../constant/commitlint/file-paths.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../constant/commitlint/husky-commit-msg-script.constant";
import { COMMITLINT_CONFIG_HUSKY } from "../constant/commitlint/husky-config.constant";
import { COMMITLINT_CONFIG_MESSAGES } from "../constant/commitlint/messages.constant";
import { COMMITLINT_CONFIG_SCRIPTS } from "../constant/commitlint/scripts.constant";
import { COMMITLINT_CONFIG_SUMMARY } from "../constant/commitlint/summary.constant";

import { PackageJsonService } from "./package-json.service";

const MAX_RETRY_COUNT: number = 10;
const MIN_RETRY_COUNT: number = 1;

/**
 * Service for setting up and managing Commitlint and Commitizen configuration.
 * Provides functionality to enforce consistent commit message formats using Commitlint
 * and simplify commit creation using Commitizen.
 */
export class CommitlintModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Command service for executing shell commands */
	readonly COMMAND_SERVICE: ICommandService;

	/** Configuration service for managing app configuration */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Cached commitlint module configuration */
	private config: IConfigCommitlint | null = null;

	/**
	 * Initializes a new instance of the CommitlintModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 * @param configService - Service for managing app configuration
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService(cliInterfaceService);
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Handles existing Commitlint/Commitizen setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [COMMITLINT_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			if (existingFiles.length > 0) {
				for (const file of existingFiles) {
					messageLines.push(`- ${file}`);
				}
			}

			messageLines.push("", COMMITLINT_CONFIG_MESSAGES.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn(COMMITLINT_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures Commitlint and Commitizen.
	 * Sets up configuration files, git hooks, and package.json scripts.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigCommitlint>(EModule.COMMITLINT);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const isCommitCommandEnabled: boolean = await this.shouldEnableCommitCommand();
			const commitlintAiConfig: IConfigCommitlint = await this.resolveCommitlintAiConfig();
			await this.setupCommitlint(commitlintAiConfig, isCommitCommandEnabled);

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	/**
	 * Reads generation model.
	 * @param defaultModel - Default model value
	 * @returns Promise resolving to configured model
	 */
	async readGenerationModel(defaultModel: string): Promise<string> {
		try {
			const model: string = await this.CLI_INTERFACE_SERVICE.text(COMMITLINT_CONFIG_MESSAGES.modelPrompt, "", defaultModel, (value: string) => (value.trim().length === 0 ? "Model is required" : undefined));

			return model.trim().length > 0 ? model.trim() : defaultModel;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.modelPromptError, error);

			return defaultModel;
		}
	}

	/**
	 * Reads retry count with range validation.
	 * @param prompt - Prompt message
	 * @param errorPrompt - Error message
	 * @param defaultValue - Default retry value
	 * @returns Promise resolving to retry count
	 */
	async readRetryCount(prompt: string, errorPrompt: string, defaultValue: number): Promise<number> {
		try {
			const value: string = await this.CLI_INTERFACE_SERVICE.text(prompt, "", String(defaultValue), (retryCount: string) => {
				const parsedValue: number = Number.parseInt(retryCount, 10);

				return Number.isNaN(parsedValue) || parsedValue < MIN_RETRY_COUNT || parsedValue > MAX_RETRY_COUNT ? `Please enter a number between ${MIN_RETRY_COUNT} and ${MAX_RETRY_COUNT}` : undefined;
			});
			const parsedValue: number = Number.parseInt(value, 10);

			return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(errorPrompt, error);

			return defaultValue;
		}
	}

	/**
	 * Reads regex pattern for ticket extraction.
	 * @param defaultPattern - Default regex pattern
	 * @returns Promise resolving to configured regex pattern
	 */
	async readTicketPattern(defaultPattern: string): Promise<string> {
		try {
			const pattern: string = await this.CLI_INTERFACE_SERVICE.text(COMMITLINT_CONFIG_MESSAGES.ticketPatternPrompt, "", defaultPattern);

			return pattern.trim().length > 0 ? pattern.trim() : defaultPattern;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.ticketPatternPromptError, error);

			return defaultPattern;
		}
	}

	/**
	 * Reads regex flags for ticket pattern.
	 * @param defaultPatternFlags - Default regex flags
	 * @returns Promise resolving to configured regex flags
	 */
	async readTicketPatternFlags(defaultPatternFlags: string): Promise<string> {
		try {
			const patternFlags: string = await this.CLI_INTERFACE_SERVICE.text(COMMITLINT_CONFIG_MESSAGES.ticketPatternFlagsPrompt, "", defaultPatternFlags);

			return patternFlags.trim().length > 0 ? patternFlags.trim() : defaultPatternFlags;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.ticketPatternFlagsPromptError, error);

			return defaultPatternFlags;
		}
	}

	/**
	 * Resolves commitlint-ai settings using config defaults and setup prompts.
	 * @returns Promise resolving to effective commitlint-ai settings
	 */
	async resolveCommitlintAiConfig(): Promise<IConfigCommitlint> {
		const defaultCommitlintAiConfig: IConfigCommitlint = this.getDefaultCommitlintAiConfig();
		const mode: ECommitlintMode = await this.selectGenerationMode(defaultCommitlintAiConfig.mode ?? COMMITLINT_AI_DEFAULTS.mode);
		const provider: ECommitlintProvider = await this.selectGenerationProvider(defaultCommitlintAiConfig.provider ?? COMMITLINT_AI_DEFAULTS.provider);
		const model: string = await this.readGenerationModel(this.config?.model ?? this.getDefaultModelByProvider(provider));
		const maxRetries: number = await this.readRetryCount(COMMITLINT_CONFIG_MESSAGES.maxRetriesPrompt, COMMITLINT_CONFIG_MESSAGES.maxRetriesPromptError, defaultCommitlintAiConfig.maxRetries ?? COMMITLINT_AI_DEFAULTS.maxRetries);

		const validationMaxRetries: number = await this.readRetryCount(COMMITLINT_CONFIG_MESSAGES.validationMaxRetriesPrompt, COMMITLINT_CONFIG_MESSAGES.validationMaxRetriesPromptError, defaultCommitlintAiConfig.validationMaxRetries ?? COMMITLINT_AI_DEFAULTS.validationMaxRetries);

		const ticketDefaults: Required<IConfigCommitlintTicket> = {
			missingBranchLintBehavior: defaultCommitlintAiConfig.ticket?.missingBranchLintBehavior ?? COMMITLINT_AI_DEFAULTS.ticket.missingBranchLintBehavior,
			normalization: defaultCommitlintAiConfig.ticket?.normalization ?? COMMITLINT_AI_DEFAULTS.ticket.normalization,
			pattern: defaultCommitlintAiConfig.ticket?.pattern ?? COMMITLINT_AI_DEFAULTS.ticket.pattern,
			patternFlags: defaultCommitlintAiConfig.ticket?.patternFlags ?? COMMITLINT_AI_DEFAULTS.ticket.patternFlags,
			source: defaultCommitlintAiConfig.ticket?.source ?? COMMITLINT_AI_DEFAULTS.ticket.source,
		};

		const isTicketEnabled: boolean = await this.shouldEnableTicketIntegration(ticketDefaults.source);

		if (!isTicketEnabled) {
			return {
				maxRetries,
				mode,
				model,
				provider,
				ticket: {
					...ticketDefaults,
					source: ECommitlintTicketSource.NONE,
				},
				validationMaxRetries,
			};
		}

		const ticketSource: ECommitlintTicketSource = await this.selectTicketSource(ticketDefaults.source);
		const ticketNormalization: ECommitlintTicketNormalization = await this.selectTicketNormalization(ticketDefaults.normalization);
		let ticketPattern: string = ticketDefaults.pattern;
		let ticketPatternFlags: string = ticketDefaults.patternFlags;
		let ticketMissingBranchLintBehavior: ECommitlintTicketMissingBranchLintBehavior = ticketDefaults.missingBranchLintBehavior;

		if (ticketSource === ECommitlintTicketSource.AUTO || ticketSource === ECommitlintTicketSource.PATTERN) {
			ticketPattern = await this.readTicketPattern(ticketDefaults.pattern);
			ticketPatternFlags = await this.readTicketPatternFlags(ticketDefaults.patternFlags);
		}

		if (ticketSource === ECommitlintTicketSource.BRANCH_LINT) {
			ticketMissingBranchLintBehavior = await this.selectMissingBranchLintBehavior(ticketDefaults.missingBranchLintBehavior);
		}

		return {
			maxRetries,
			mode,
			model,
			provider,
			ticket: {
				missingBranchLintBehavior: ticketMissingBranchLintBehavior,
				normalization: ticketNormalization,
				pattern: ticketPattern,
				patternFlags: ticketPatternFlags,
				source: ticketSource,
			},
			validationMaxRetries,
		};
	}

	/**
	 * Selects generation mode.
	 * @param defaultMode - Default mode value
	 * @returns Promise resolving to selected mode
	 */
	async selectGenerationMode(defaultMode: ECommitlintMode): Promise<ECommitlintMode> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "auto - AI-powered generation", value: ECommitlintMode.AUTO },
			{ label: "manual - guided commit composition", value: ECommitlintMode.MANUAL },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<ECommitlintMode>(COMMITLINT_CONFIG_MESSAGES.modePrompt, options, defaultMode);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.modePromptError, error);

			return defaultMode;
		}
	}

	/**
	 * Selects generation provider.
	 * @param defaultProvider - Default provider value
	 * @returns Promise resolving to selected provider
	 */
	async selectGenerationProvider(defaultProvider: ECommitlintProvider): Promise<ECommitlintProvider> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "anthropic", value: ECommitlintProvider.ANTHROPIC },
			{ label: "aws-bedrock", value: ECommitlintProvider.AWS_BEDROCK },
			{ label: "azure-openai", value: ECommitlintProvider.AZURE_OPENAI },
			{ label: "google", value: ECommitlintProvider.GOOGLE },
			{ label: "ollama", value: ECommitlintProvider.OLLAMA },
			{ label: "openai", value: ECommitlintProvider.OPENAI },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<ECommitlintProvider>(COMMITLINT_CONFIG_MESSAGES.providerPrompt, options, defaultProvider);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.providerPromptError, error);

			return defaultProvider;
		}
	}

	/**
	 * Selects missing branch-lint behavior.
	 * @param defaultBehavior - Default behavior
	 * @returns Promise resolving to selected behavior
	 */
	async selectMissingBranchLintBehavior(defaultBehavior: ECommitlintTicketMissingBranchLintBehavior): Promise<ECommitlintTicketMissingBranchLintBehavior> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "fallback - use local regex pattern as fallback", value: ECommitlintTicketMissingBranchLintBehavior.FALLBACK },
			{ label: "error - stop setup when branch-lint config is unavailable", value: ECommitlintTicketMissingBranchLintBehavior.ERROR },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<ECommitlintTicketMissingBranchLintBehavior>(COMMITLINT_CONFIG_MESSAGES.branchLintMissingBehaviorPrompt, options, defaultBehavior);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.branchLintMissingBehaviorPromptError, error);

			return defaultBehavior;
		}
	}

	/**
	 * Selects ticket normalization mode.
	 * @param defaultNormalization - Default normalization mode
	 * @returns Promise resolving to selected normalization mode
	 */
	async selectTicketNormalization(defaultNormalization: ECommitlintTicketNormalization): Promise<ECommitlintTicketNormalization> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "preserve - keep ticket case as detected", value: ECommitlintTicketNormalization.PRESERVE },
			{ label: "upper - convert ticket to upper case", value: ECommitlintTicketNormalization.UPPER },
			{ label: "lower - convert ticket to lower case", value: ECommitlintTicketNormalization.LOWER },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<ECommitlintTicketNormalization>(COMMITLINT_CONFIG_MESSAGES.ticketNormalizationPrompt, options, defaultNormalization);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.ticketNormalizationPromptError, error);

			return defaultNormalization;
		}
	}

	/**
	 * Selects ticket source strategy.
	 * @param defaultSource - Default source strategy
	 * @returns Promise resolving to selected source strategy
	 */
	async selectTicketSource(defaultSource: ECommitlintTicketSource): Promise<ECommitlintTicketSource> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "branch-lint - parse ticket by git-branch-lint pattern", value: ECommitlintTicketSource.BRANCH_LINT },
			{ label: "auto - branch-lint first, then local regex fallback", value: ECommitlintTicketSource.AUTO },
			{ label: "pattern - parse ticket only by local regex pattern", value: ECommitlintTicketSource.PATTERN },
		];

		const normalizedDefaultSource: ECommitlintTicketSource = defaultSource === ECommitlintTicketSource.NONE ? ECommitlintTicketSource.BRANCH_LINT : defaultSource;

		try {
			return await this.CLI_INTERFACE_SERVICE.select<ECommitlintTicketSource>(COMMITLINT_CONFIG_MESSAGES.ticketSourcePrompt, options, normalizedDefaultSource);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.ticketSourcePromptError, error);

			return normalizedDefaultSource;
		}
	}

	/**
	 * Determines whether commit command script should be added.
	 * @returns Promise resolving to true when commit command should be added
	 */
	async shouldEnableCommitCommand(): Promise<boolean> {
		const isCommitCommandEnabledByDefault: boolean = this.config?.isCommitCommandEnabled ?? true;

		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(COMMITLINT_CONFIG_MESSAGES.commitCommandPrompt, isCommitCommandEnabledByDefault);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.commitCommandPromptError, error);

			return isCommitCommandEnabledByDefault;
		}
	}

	/**
	 * Determines whether ticket extraction should be enabled.
	 * @param defaultSource - Default ticket source
	 * @returns Promise resolving to true when ticket extraction should be enabled
	 */
	async shouldEnableTicketIntegration(defaultSource: ECommitlintTicketSource): Promise<boolean> {
		const isTicketEnabledByDefault: boolean = defaultSource !== ECommitlintTicketSource.NONE;

		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(COMMITLINT_CONFIG_MESSAGES.ticketEnabledPrompt, isTicketEnabledByDefault);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.ticketEnabledPromptError, error);

			return isTicketEnabledByDefault;
		}
	}

	/**
	 * Determines if Commitlint/Commitizen should be installed.
	 * Asks the user if they want to set up these tools for their project.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(COMMITLINT_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.COMMITLINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Creates the Commitlint configuration file.
	 * @param commitlintAiConfig - Commitlint AI configuration
	 */
	private async createConfigs(commitlintAiConfig: IConfigCommitlint = this.getDefaultCommitlintAiConfig()): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(COMMITLINT_CONFIG_FILE_PATHS.configFile, COMMITLINT_CONFIG, "utf8");
		await this.FILE_SYSTEM_SERVICE.writeFile(COMMITLINT_CONFIG_FILE_PATHS.aiConfigFile, COMMITLINT_AI_CONFIG.template(commitlintAiConfig), "utf8");
	}

	/**
	 * Displays a summary of the setup results.
	 * @param commitlintAiConfig - Commitlint AI configuration
	 * @param isCommitCommandEnabled - Whether commit command was enabled
	 */
	private displaySetupSummary(commitlintAiConfig: IConfigCommitlint = this.getDefaultCommitlintAiConfig(), isCommitCommandEnabled: boolean = true): void {
		const commitScriptDescription: string = isCommitCommandEnabled ? COMMITLINT_CONFIG_SUMMARY.commitDescription : COMMITLINT_CONFIG_SUMMARY.commitCommandDisabledDescription;
		const generationMode: ECommitlintMode = commitlintAiConfig.mode ?? COMMITLINT_AI_DEFAULTS.mode;
		const generationProvider: ECommitlintProvider = commitlintAiConfig.provider ?? COMMITLINT_AI_DEFAULTS.provider;
		const generationModel: string = commitlintAiConfig.model ?? COMMITLINT_AI_DEFAULTS.model;
		const generationMaxRetries: number = commitlintAiConfig.maxRetries ?? COMMITLINT_AI_DEFAULTS.maxRetries;
		const generationValidationMaxRetries: number = commitlintAiConfig.validationMaxRetries ?? COMMITLINT_AI_DEFAULTS.validationMaxRetries;
		const ticketSource: ECommitlintTicketSource = commitlintAiConfig.ticket?.source ?? COMMITLINT_AI_DEFAULTS.ticket.source;
		const ticketNormalization: ECommitlintTicketNormalization = commitlintAiConfig.ticket?.normalization ?? COMMITLINT_AI_DEFAULTS.ticket.normalization;

		const ticketMissingBranchLintBehavior: ECommitlintTicketMissingBranchLintBehavior = commitlintAiConfig.ticket?.missingBranchLintBehavior ?? COMMITLINT_AI_DEFAULTS.ticket.missingBranchLintBehavior;

		const generationDescription: string = COMMITLINT_CONFIG_SUMMARY.generationConfigurationDescription.replace("{mode}", generationMode).replace("{provider}", generationProvider).replace("{model}", generationModel).replace("{maxRetries}", String(generationMaxRetries)).replace("{validationMaxRetries}", String(generationValidationMaxRetries));

		const ticketDescription: string = COMMITLINT_CONFIG_SUMMARY.ticketConfigurationDescription.replace("{source}", ticketSource).replace("{normalization}", ticketNormalization).replace("{missingBranchLintBehavior}", ticketMissingBranchLintBehavior);

		const summary: Array<string> = [COMMITLINT_CONFIG_MESSAGES.configurationCreated, "", generationDescription, ticketDescription, "", COMMITLINT_CONFIG_MESSAGES.generatedScriptsLabel, commitScriptDescription, "", COMMITLINT_CONFIG_MESSAGES.configurationFilesLabel, COMMITLINT_CONFIG_SUMMARY.configFileDescription, COMMITLINT_CONFIG_SUMMARY.aiConfigFileDescription, COMMITLINT_CONFIG_SUMMARY.huskyCommitMsgDescription, "", COMMITLINT_CONFIG_MESSAGES.huskyGitHooksInfo];

		if (isCommitCommandEnabled) {
			summary.push(COMMITLINT_CONFIG_MESSAGES.commitizenDescription);
		}

		this.CLI_INTERFACE_SERVICE.note(COMMITLINT_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	/**
	 * Finds existing Commitlint/Commitizen configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of COMMITLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(COMMITLINT_CONFIG_FILE_PATHS.huskyCommitMsgHook)) {
			existingFiles.push(COMMITLINT_CONFIG_FILE_PATHS.huskyCommitMsgHook);
		}

		return existingFiles;
	}

	/**
	 * Builds commitlint-ai config with defaults merged from setup-wizard config.
	 * @returns Defaulted commitlint-ai config
	 */
	private getDefaultCommitlintAiConfig(): IConfigCommitlint {
		return {
			maxRetries: this.config?.maxRetries ?? COMMITLINT_AI_DEFAULTS.maxRetries,
			mode: this.config?.mode ?? COMMITLINT_AI_DEFAULTS.mode,
			model: this.config?.model ?? COMMITLINT_AI_DEFAULTS.model,
			provider: this.config?.provider ?? COMMITLINT_AI_DEFAULTS.provider,
			ticket: {
				missingBranchLintBehavior: this.config?.ticket?.missingBranchLintBehavior ?? COMMITLINT_AI_DEFAULTS.ticket.missingBranchLintBehavior,
				normalization: this.config?.ticket?.normalization ?? COMMITLINT_AI_DEFAULTS.ticket.normalization,
				pattern: this.config?.ticket?.pattern ?? COMMITLINT_AI_DEFAULTS.ticket.pattern,
				patternFlags: this.config?.ticket?.patternFlags ?? COMMITLINT_AI_DEFAULTS.ticket.patternFlags,
				source: this.config?.ticket?.source ?? COMMITLINT_AI_DEFAULTS.ticket.source,
			},
			validationMaxRetries: this.config?.validationMaxRetries ?? COMMITLINT_AI_DEFAULTS.validationMaxRetries,
		};
	}

	/**
	 * Returns default model for selected provider.
	 * @param provider - Selected provider
	 * @returns Default model name
	 */
	private getDefaultModelByProvider(provider: ECommitlintProvider): string {
		switch (provider) {
			case ECommitlintProvider.ANTHROPIC: {
				return "claude-opus-4-5";
			}

			case ECommitlintProvider.AWS_BEDROCK: {
				return "claude-sonnet-4-5";
			}

			case ECommitlintProvider.AZURE_OPENAI: {
				return "gpt-4o";
			}

			case ECommitlintProvider.GOOGLE: {
				return "gemini-2.5-pro-preview-05-06";
			}

			case ECommitlintProvider.OLLAMA: {
				return "llama3";
			}

			case ECommitlintProvider.OPENAI: {
				return "gpt-4o-mini";
			}

			default: {
				return COMMITLINT_AI_DEFAULTS.model;
			}
		}
	}

	/**
	 * Sets up Commitlint and Commitizen.
	 * Installs dependencies, creates configuration files, and configures git hooks.
	 * @param commitlintAiConfig - Commitlint AI configuration
	 * @param isCommitCommandEnabled - Whether commit command should be configured
	 */
	private async setupCommitlint(commitlintAiConfig: IConfigCommitlint = this.getDefaultCommitlintAiConfig(), isCommitCommandEnabled: boolean = true): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner(COMMITLINT_CONFIG_MESSAGES.settingUpSpinner);

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(commitlintAiConfig);
			await this.setupHusky();

			if (isCommitCommandEnabled) {
				await this.setupPackageJsonConfigs();
				await this.setupScripts();
			}

			this.CLI_INTERFACE_SERVICE.stopSpinner(COMMITLINT_CONFIG_MESSAGES.configurationCompleted);
			this.displaySetupSummary(commitlintAiConfig, isCommitCommandEnabled);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(COMMITLINT_CONFIG_MESSAGES.failedSetupConfiguration);

			throw error;
		}
	}

	/**
	 * Sets up Husky git hooks.
	 * Initializes Husky, adds prepare script, and creates commit-msg and pre-push hooks.
	 */
	private async setupHusky(): Promise<void> {
		// Initialize husky
		await this.COMMAND_SERVICE.execute(COMMITLINT_CONFIG_HUSKY.initCommand);

		// Add prepare script if it doesn't exist
		await this.PACKAGE_JSON_SERVICE.addScript(COMMITLINT_CONFIG_SCRIPTS.prepare.name, COMMITLINT_CONFIG_SCRIPTS.prepare.command);

		await this.COMMAND_SERVICE.execute(COMMITLINT_CONFIG_HUSKY.mkdirCommand);

		// Create commit-msg hook
		await this.FILE_SYSTEM_SERVICE.writeFile(COMMITLINT_CONFIG_FILE_PATHS.huskyCommitMsgHook, COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute(COMMITLINT_CONFIG_HUSKY.chmodCommand);
	}

	/**
	 * Sets up Commitizen configuration in package.json.
	 */
	private async setupPackageJsonConfigs(): Promise<void> {
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

		packageJson.config ??= {};
		packageJson.config.commitizen = {
			path: COMMITLINT_CONFIG_MESSAGES.commitizenPath,
		};

		await this.PACKAGE_JSON_SERVICE.set(packageJson);
	}

	/**
	 * Sets up npm scripts for Commitizen.
	 * Adds 'commit' script for starting the Commitizen CLI.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript(COMMITLINT_CONFIG_SCRIPTS.commit.name, COMMITLINT_CONFIG_SCRIPTS.commit.command);
	}
}
