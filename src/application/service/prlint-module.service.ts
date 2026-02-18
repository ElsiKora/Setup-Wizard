import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { TPackageJsonScripts } from "../../domain/type/package-json-scripts.type";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigPrlintGeneration } from "../interface/config/prlint-generation.interface";
import type { IConfigPrlintGithub } from "../interface/config/prlint-github.interface";
import type { IConfigPrlintLint } from "../interface/config/prlint-lint.interface";
import type { IConfigPrlintTicket } from "../interface/config/prlint-ticket.interface";
import type { IConfigPrlint } from "../interface/config/prlint.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { EPrlintGenerationProvider } from "../../domain/enum/prlint-generation-provider.enum";
import { EPrlintTicketMissingBranchLintBehavior } from "../../domain/enum/prlint-ticket-missing-branch-lint-behavior.enum";
import { EPrlintTicketNormalization } from "../../domain/enum/prlint-ticket-normalization.enum";
import { EPrlintTicketSource } from "../../domain/enum/prlint-ticket-source.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { PRLINT_CONFIG, PRLINT_CONFIG_DEFAULTS } from "../constant/prlint/config.constant";
import { PRLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/prlint/core-dependencies.constant";
import { PRLINT_CONFIG_FILE_NAMES } from "../constant/prlint/file-names.constant";
import { PRLINT_CONFIG_FILE_PATHS } from "../constant/prlint/file-paths.constant";
import { PRLINT_CONFIG_MESSAGES } from "../constant/prlint/messages.constant";
import { PRLINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES } from "../constant/prlint/package-json-script-names.constant";
import { PRLINT_CONFIG_SCRIPTS } from "../constant/prlint/scripts.constant";
import { PRLINT_CONFIG_SUMMARY } from "../constant/prlint/summary.constant";

import { PackageJsonService } from "./package-json.service";

const MAX_RETRY_COUNT: number = 10;
const MIN_RETRY_COUNT: number = 1;

export class PrlintModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly COMMAND_SERVICE: ICommandService;

	readonly CONFIG_SERVICE: IConfigService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	private config: IConfigPrlint | null = null;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService(cliInterfaceService);
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = configService;
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();
		const hasPrlintScripts: boolean = PRLINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES.some((scriptName: string) => packageJson.scripts?.[scriptName]);

		if (hasPrlintScripts) {
			existingFiles.push("package.json scripts");
		}

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [PRLINT_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", PRLINT_CONFIG_MESSAGES.deleteFilesQuestion);
			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.filter((file: string) => file !== "package.json scripts").map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));

				if (hasPrlintScripts && packageJson.scripts) {
					const scripts: TPackageJsonScripts = { ...packageJson.scripts };

					for (const scriptName of PRLINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES) {
						if (scriptName in scripts) {
							// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
							delete scripts[scriptName];
						}
					}

					packageJson.scripts = scripts;
					await this.PACKAGE_JSON_SERVICE.set(packageJson);
				}
			} else {
				this.CLI_INTERFACE_SERVICE.warn(PRLINT_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigPrlint>(EModule.PRLINT);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const isScriptsEnabled: boolean = await this.shouldEnableScripts();
			const config: IConfigPrlint = await this.resolvePrlintConfig();
			await this.setupPrlint(config, isScriptsEnabled);

			return {
				customProperties: {
					...config,
					isScriptsEnabled,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	async readCommaSeparatedList(prompt: string, errorPrompt: string, defaultValue: Array<string>): Promise<Array<string>> {
		try {
			const value: string = await this.CLI_INTERFACE_SERVICE.text(prompt, "", defaultValue.join(", "));

			return this.parseCommaSeparatedList(value, defaultValue);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(errorPrompt, error);

			return defaultValue;
		}
	}

	async readGenerationModel(defaultValue: string): Promise<string> {
		try {
			const value: string = await this.CLI_INTERFACE_SERVICE.text(PRLINT_CONFIG_MESSAGES.modelPrompt, "", defaultValue, (model: string) => (model.trim().length === 0 ? "Model is required" : undefined));

			return value.trim().length > 0 ? value.trim() : defaultValue;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.modelPromptError, error);

			return defaultValue;
		}
	}

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

	async readText(prompt: string, errorPrompt: string, defaultValue: string): Promise<string> {
		try {
			const value: string = await this.CLI_INTERFACE_SERVICE.text(prompt, "", defaultValue);

			return value.trim().length > 0 ? value.trim() : defaultValue;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(errorPrompt, error);

			return defaultValue;
		}
	}

	async resolvePrlintConfig(): Promise<IConfigPrlint> {
		const defaultConfig: {
			generation: Required<IConfigPrlintGeneration>;
			github: Required<IConfigPrlintGithub>;
			lint: Required<IConfigPrlintLint>;
			ticket: Required<IConfigPrlintTicket>;
		} = this.getDefaultConfig();

		const provider: EPrlintGenerationProvider = await this.selectGenerationProvider(defaultConfig.generation.provider);
		const providerDefaultModel: string = this.getDefaultModelByProvider(provider);
		const generationModel: string = await this.readGenerationModel(this.config?.generation?.model ?? providerDefaultModel);
		const retries: number = await this.readRetryCount(PRLINT_CONFIG_MESSAGES.retriesPrompt, PRLINT_CONFIG_MESSAGES.retriesPromptError, defaultConfig.generation.retries);

		const validationRetries: number = await this.readRetryCount(PRLINT_CONFIG_MESSAGES.validationRetriesPrompt, PRLINT_CONFIG_MESSAGES.validationRetriesPromptError, defaultConfig.generation.validationRetries);

		const baseBranch: string = await this.readText(PRLINT_CONFIG_MESSAGES.githubBaseBranchPrompt, PRLINT_CONFIG_MESSAGES.githubBaseBranchPromptError, defaultConfig.github.base);
		const isDraft: boolean = await this.confirm(PRLINT_CONFIG_MESSAGES.githubDraftPrompt, PRLINT_CONFIG_MESSAGES.githubDraftPromptError, defaultConfig.github.isDraft);

		const prohibitedBranches: Array<string> = await this.readCommaSeparatedList(PRLINT_CONFIG_MESSAGES.githubProhibitedBranchesPrompt, PRLINT_CONFIG_MESSAGES.githubProhibitedBranchesPromptError, defaultConfig.github.prohibitedBranches);

		const titlePattern: string = await this.readText(PRLINT_CONFIG_MESSAGES.lintTitlePatternPrompt, PRLINT_CONFIG_MESSAGES.lintTitlePatternPromptError, defaultConfig.lint.titlePattern);

		const requiredSections: Array<string> = await this.readCommaSeparatedList(PRLINT_CONFIG_MESSAGES.lintRequiredSectionsPrompt, PRLINT_CONFIG_MESSAGES.lintRequiredSectionsPromptError, defaultConfig.lint.requiredSections);

		const forbiddenPlaceholders: Array<string> = await this.readCommaSeparatedList(PRLINT_CONFIG_MESSAGES.forbiddenPlaceholdersPrompt, PRLINT_CONFIG_MESSAGES.forbiddenPlaceholdersPromptError, defaultConfig.lint.forbiddenPlaceholders);

		const isTicketEnabled: boolean = await this.shouldEnableTicketIntegration(defaultConfig.ticket.source);
		const ticketSourceDefault: EPrlintTicketSource = defaultConfig.ticket.source === EPrlintTicketSource.NONE ? EPrlintTicketSource.BRANCH_LINT : defaultConfig.ticket.source;
		const source: EPrlintTicketSource = isTicketEnabled ? await this.selectTicketSource(ticketSourceDefault) : EPrlintTicketSource.NONE;
		const normalization: EPrlintTicketNormalization = isTicketEnabled ? await this.selectTicketNormalization(defaultConfig.ticket.normalization) : defaultConfig.ticket.normalization;
		let pattern: string = defaultConfig.ticket.pattern;
		let patternFlags: string = defaultConfig.ticket.patternFlags;
		let missingBranchLintBehavior: EPrlintTicketMissingBranchLintBehavior = defaultConfig.ticket.missingBranchLintBehavior;

		if (source === EPrlintTicketSource.AUTO || source === EPrlintTicketSource.PATTERN) {
			pattern = await this.readText(PRLINT_CONFIG_MESSAGES.ticketPatternPrompt, PRLINT_CONFIG_MESSAGES.ticketPatternPromptError, defaultConfig.ticket.pattern);
			patternFlags = await this.readText(PRLINT_CONFIG_MESSAGES.ticketPatternFlagsPrompt, PRLINT_CONFIG_MESSAGES.ticketPatternFlagsPromptError, defaultConfig.ticket.patternFlags);
		}

		if (source === EPrlintTicketSource.BRANCH_LINT) {
			missingBranchLintBehavior = await this.selectMissingBranchLintBehavior(defaultConfig.ticket.missingBranchLintBehavior);
		}

		return {
			generation: {
				model: generationModel,
				provider,
				retries,
				validationRetries,
			},
			github: {
				base: baseBranch,
				isDraft,
				prohibitedBranches,
			},
			lint: {
				forbiddenPlaceholders,
				requiredSections,
				titlePattern,
			},
			ticket: {
				missingBranchLintBehavior,
				normalization,
				pattern,
				patternFlags,
				source,
			},
		};
	}

	async selectGenerationProvider(defaultValue: EPrlintGenerationProvider): Promise<EPrlintGenerationProvider> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "anthropic", value: EPrlintGenerationProvider.ANTHROPIC },
			{ label: "google", value: EPrlintGenerationProvider.GOOGLE },
			{ label: "ollama", value: EPrlintGenerationProvider.OLLAMA },
			{ label: "openai", value: EPrlintGenerationProvider.OPENAI },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<EPrlintGenerationProvider>(PRLINT_CONFIG_MESSAGES.providerPrompt, options, defaultValue);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.providerPromptError, error);

			return defaultValue;
		}
	}

	async selectMissingBranchLintBehavior(defaultValue: EPrlintTicketMissingBranchLintBehavior): Promise<EPrlintTicketMissingBranchLintBehavior> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "error - stop setup when branch-lint config is unavailable", value: EPrlintTicketMissingBranchLintBehavior.ERROR },
			{ label: "fallback - use local regex pattern as fallback", value: EPrlintTicketMissingBranchLintBehavior.FALLBACK },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<EPrlintTicketMissingBranchLintBehavior>(PRLINT_CONFIG_MESSAGES.branchLintMissingBehaviorPrompt, options, defaultValue);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.branchLintMissingBehaviorPromptError, error);

			return defaultValue;
		}
	}

	async selectTicketNormalization(defaultValue: EPrlintTicketNormalization): Promise<EPrlintTicketNormalization> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "upper - convert ticket to upper case", value: EPrlintTicketNormalization.UPPER },
			{ label: "preserve - keep ticket case as detected", value: EPrlintTicketNormalization.PRESERVE },
			{ label: "lower - convert ticket to lower case", value: EPrlintTicketNormalization.LOWER },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<EPrlintTicketNormalization>(PRLINT_CONFIG_MESSAGES.ticketNormalizationPrompt, options, defaultValue);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.ticketNormalizationPromptError, error);

			return defaultValue;
		}
	}

	async selectTicketSource(defaultValue: EPrlintTicketSource): Promise<EPrlintTicketSource> {
		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "branch-lint - parse ticket by git-branch-lint pattern", value: EPrlintTicketSource.BRANCH_LINT },
			{ label: "auto - branch-lint first, then local regex fallback", value: EPrlintTicketSource.AUTO },
			{ label: "pattern - parse ticket only by local regex pattern", value: EPrlintTicketSource.PATTERN },
		];

		try {
			return await this.CLI_INTERFACE_SERVICE.select<EPrlintTicketSource>(PRLINT_CONFIG_MESSAGES.ticketSourcePrompt, options, defaultValue);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.ticketSourcePromptError, error);

			return defaultValue;
		}
	}

	async shouldEnableScripts(): Promise<boolean> {
		const isScriptsEnabledByDefault: boolean = this.config?.isScriptsEnabled ?? true;

		return await this.confirm(PRLINT_CONFIG_MESSAGES.addScriptsPrompt, PRLINT_CONFIG_MESSAGES.addScriptsPromptError, isScriptsEnabledByDefault);
	}

	async shouldEnableTicketIntegration(defaultSource: EPrlintTicketSource): Promise<boolean> {
		const isTicketEnabledByDefault: boolean = defaultSource !== EPrlintTicketSource.NONE;

		return await this.confirm(PRLINT_CONFIG_MESSAGES.ticketEnabledPrompt, PRLINT_CONFIG_MESSAGES.ticketEnabledPromptError, isTicketEnabledByDefault);
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(PRLINT_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.PRLINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(PRLINT_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	private async confirm(prompt: string, errorPrompt: string, isEnabledByDefault: boolean): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(prompt, isEnabledByDefault);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(errorPrompt, error);

			return isEnabledByDefault;
		}
	}

	private async createConfigs(config: IConfigPrlint): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(PRLINT_CONFIG_FILE_PATHS.configFile, PRLINT_CONFIG.template(config), "utf8");
	}

	private displaySetupSummary(config: IConfigPrlint, isScriptsEnabled: boolean): void {
		const generationConfig: IConfigPrlintGeneration = config.generation ?? PRLINT_CONFIG_DEFAULTS.generation;
		const githubConfig: IConfigPrlintGithub = config.github ?? PRLINT_CONFIG_DEFAULTS.github;
		const lintConfig: IConfigPrlintLint = config.lint ?? PRLINT_CONFIG_DEFAULTS.lint;
		const ticketConfig: IConfigPrlintTicket = config.ticket ?? PRLINT_CONFIG_DEFAULTS.ticket;

		const generationDescription: string = PRLINT_CONFIG_SUMMARY.generationConfigurationDescription
			.replace("{provider}", generationConfig.provider ?? PRLINT_CONFIG_DEFAULTS.generation.provider)
			.replace("{model}", generationConfig.model ?? PRLINT_CONFIG_DEFAULTS.generation.model)
			.replace("{retries}", String(generationConfig.retries ?? PRLINT_CONFIG_DEFAULTS.generation.retries))
			.replace("{validationRetries}", String(generationConfig.validationRetries ?? PRLINT_CONFIG_DEFAULTS.generation.validationRetries));

		const githubDescription: string = PRLINT_CONFIG_SUMMARY.githubConfigurationDescription
			.replace("{base}", githubConfig.base ?? PRLINT_CONFIG_DEFAULTS.github.base)
			.replace("{draft}", String(githubConfig.isDraft ?? PRLINT_CONFIG_DEFAULTS.github.isDraft))
			.replace("{prohibitedBranches}", (githubConfig.prohibitedBranches ?? PRLINT_CONFIG_DEFAULTS.github.prohibitedBranches).join(", "));

		const lintDescription: string = PRLINT_CONFIG_SUMMARY.lintConfigurationDescription.replace("{titlePattern}", lintConfig.titlePattern ?? PRLINT_CONFIG_DEFAULTS.lint.titlePattern);

		const ticketDescription: string = PRLINT_CONFIG_SUMMARY.ticketConfigurationDescription
			.replace("{source}", ticketConfig.source ?? PRLINT_CONFIG_DEFAULTS.ticket.source)
			.replace("{normalization}", ticketConfig.normalization ?? PRLINT_CONFIG_DEFAULTS.ticket.normalization)
			.replace("{missingBranchLintBehavior}", ticketConfig.missingBranchLintBehavior ?? PRLINT_CONFIG_DEFAULTS.ticket.missingBranchLintBehavior);

		const summary: Array<string> = [PRLINT_CONFIG_MESSAGES.configurationCreated, "", generationDescription, githubDescription, lintDescription, ticketDescription, "", PRLINT_CONFIG_MESSAGES.configurationFilesLabel, PRLINT_CONFIG_SUMMARY.configFileDescription];

		if (isScriptsEnabled) {
			summary.push("", PRLINT_CONFIG_MESSAGES.generatedScriptsLabel);

			for (const script of this.getPrlintScripts()) {
				summary.push(`- npm run ${script.name}`);
			}
		}

		this.CLI_INTERFACE_SERVICE.note(PRLINT_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of PRLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private getDefaultConfig(): {
		generation: Required<IConfigPrlintGeneration>;
		github: Required<IConfigPrlintGithub>;
		lint: Required<IConfigPrlintLint>;
		ticket: Required<IConfigPrlintTicket>;
	} {
		return {
			generation: {
				model: this.config?.generation?.model ?? PRLINT_CONFIG_DEFAULTS.generation.model,
				provider: this.config?.generation?.provider ?? PRLINT_CONFIG_DEFAULTS.generation.provider,
				retries: this.config?.generation?.retries ?? PRLINT_CONFIG_DEFAULTS.generation.retries,
				validationRetries: this.config?.generation?.validationRetries ?? PRLINT_CONFIG_DEFAULTS.generation.validationRetries,
			},
			github: {
				base: this.config?.github?.base ?? PRLINT_CONFIG_DEFAULTS.github.base,
				isDraft: this.config?.github?.isDraft ?? PRLINT_CONFIG_DEFAULTS.github.isDraft,
				prohibitedBranches: this.config?.github?.prohibitedBranches ?? PRLINT_CONFIG_DEFAULTS.github.prohibitedBranches,
			},
			lint: {
				forbiddenPlaceholders: this.config?.lint?.forbiddenPlaceholders ?? PRLINT_CONFIG_DEFAULTS.lint.forbiddenPlaceholders,
				requiredSections: this.config?.lint?.requiredSections ?? PRLINT_CONFIG_DEFAULTS.lint.requiredSections,
				titlePattern: this.config?.lint?.titlePattern ?? PRLINT_CONFIG_DEFAULTS.lint.titlePattern,
			},
			ticket: {
				missingBranchLintBehavior: this.config?.ticket?.missingBranchLintBehavior ?? PRLINT_CONFIG_DEFAULTS.ticket.missingBranchLintBehavior,
				normalization: this.config?.ticket?.normalization ?? PRLINT_CONFIG_DEFAULTS.ticket.normalization,
				pattern: this.config?.ticket?.pattern ?? PRLINT_CONFIG_DEFAULTS.ticket.pattern,
				patternFlags: this.config?.ticket?.patternFlags ?? PRLINT_CONFIG_DEFAULTS.ticket.patternFlags,
				source: this.config?.ticket?.source ?? PRLINT_CONFIG_DEFAULTS.ticket.source,
			},
		};
	}

	private getDefaultModelByProvider(provider: EPrlintGenerationProvider): string {
		switch (provider) {
			case EPrlintGenerationProvider.ANTHROPIC: {
				return "claude-opus-4-5";
			}

			case EPrlintGenerationProvider.GOOGLE: {
				return "gemini-2.5-pro-preview-05-06";
			}

			case EPrlintGenerationProvider.OLLAMA: {
				return "llama3";
			}

			case EPrlintGenerationProvider.OPENAI: {
				return "gpt-4o-mini";
			}

			default: {
				return PRLINT_CONFIG_DEFAULTS.generation.model;
			}
		}
	}

	private getPrlintScripts(): Array<{ command: string; name: string }> {
		return [PRLINT_CONFIG_SCRIPTS.context, PRLINT_CONFIG_SCRIPTS.create, PRLINT_CONFIG_SCRIPTS.fix, PRLINT_CONFIG_SCRIPTS.generate, PRLINT_CONFIG_SCRIPTS.lint];
	}

	private parseCommaSeparatedList(value: string, fallback: Array<string>): Array<string> {
		const parsedValue: Array<string> = value
			.split(",")
			.map((item: string) => item.trim())
			.filter((item: string) => item.length > 0);

		return parsedValue.length > 0 ? parsedValue : fallback;
	}

	private async setupPrlint(config: IConfigPrlint, isScriptsEnabled: boolean): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner(PRLINT_CONFIG_MESSAGES.settingUpSpinner);

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(PRLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(config);

			if (isScriptsEnabled) {
				await this.setupScripts();
			}

			this.CLI_INTERFACE_SERVICE.stopSpinner(PRLINT_CONFIG_MESSAGES.configurationCompleted);
			this.displaySetupSummary(config, isScriptsEnabled);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(PRLINT_CONFIG_MESSAGES.failedSetupConfiguration);

			throw error;
		}
	}

	private async setupScripts(): Promise<void> {
		for (const script of this.getPrlintScripts()) {
			await this.PACKAGE_JSON_SERVICE.addScript(script.name, script.command);
		}
	}
}
