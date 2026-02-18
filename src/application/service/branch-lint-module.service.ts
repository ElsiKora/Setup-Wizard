import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { TPackageJsonScripts } from "../../domain/type/package-json-scripts.type";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IBranchlint } from "../interface/config/branch-lint.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { BRANCH_LINT_CONFIG_COMMANDS } from "../constant/branch-lint/commands.constant";
import { BRANCH_LINT_CONFIG } from "../constant/branch-lint/config.constant";
import { BRANCH_LINT_CONFIG_CORE_DEPENDENCIES } from "../constant/branch-lint/core-dependencies.constant";
import { BRANCH_LINT_CONFIG_FILE_NAME } from "../constant/branch-lint/file-name.constant";
import { BRANCH_LINT_CONFIG_FILE_NAMES } from "../constant/branch-lint/file-names.constant";
import { BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH } from "../constant/branch-lint/husky-pre-push-file-path.constant";
import { BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT } from "../constant/branch-lint/husky-pre-push-script.constant";
import { BRANCH_LINT_CONFIG_MESSAGES } from "../constant/branch-lint/messages.constant";
import { BRANCH_LINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES } from "../constant/branch-lint/package-json-script-names.constant";
import { BRANCH_LINT_CONFIG_SCRIPTS } from "../constant/branch-lint/scripts.constant";
import { BRANCH_LINT_CONFIG_SUMMARY } from "../constant/branch-lint/summary.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing branch-lint configuration.
 * Provides functionality to enforce consistent branch naming conventions
 * and simplify branch creation using an interactive interface.
 */
export class BranchLintModuleService implements IModuleService {
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

	/** Cached branch-lint module configuration */
	private config: IBranchlint | null = null;

	/**
	 * Initializes a new instance of the BranchLintModuleService.
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
	 * Handles existing branch-lint setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

		// Check if package.json has branch-lint related configuration
		const hasBranchScript: boolean = BRANCH_LINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES.some((scriptName: string) => packageJson.scripts?.[scriptName]);

		if (hasBranchScript) {
			existingFiles.push(BRANCH_LINT_CONFIG_MESSAGES.packageJsonBranchScript);
		}

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [BRANCH_LINT_CONFIG_SUMMARY.existingFilesMessage];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", BRANCH_LINT_CONFIG_SUMMARY.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.filter((file: string) => !file.startsWith("package.json")).map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));

				// Remove branch-lint scripts from package.json if needed
				if (hasBranchScript && packageJson.scripts) {
					const newScripts: TPackageJsonScripts = { ...packageJson.scripts };

					for (const scriptName of BRANCH_LINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES) {
						if (scriptName in newScripts) {
							// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
							delete newScripts[scriptName];
						}
					}
					packageJson.scripts = newScripts;
					await this.PACKAGE_JSON_SERVICE.set(packageJson);
				}
			} else {
				this.CLI_INTERFACE_SERVICE.warn(BRANCH_LINT_CONFIG_SUMMARY.existingConfigWarning);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures branch-lint.
	 * Sets up configuration files, git hooks, and package.json scripts.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IBranchlint>(EModule.BRANCH_LINT);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const isTicketIdEnabled: boolean = await this.shouldEnableTicketId();
			await this.setupBranchLint(isTicketIdEnabled);

			return {
				customProperties: {
					isTicketIdEnabled,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(BRANCH_LINT_CONFIG_SUMMARY.installErrorMessage, error);

			throw error;
		}
	}

	/**
	 * Determines whether optional ticket-id placeholder should be enabled.
	 * Uses saved module configuration as default value.
	 * @returns Promise resolving to true when ticket-id placeholder should be enabled
	 */
	async shouldEnableTicketId(): Promise<boolean> {
		const isTicketIdEnabledByDefault: boolean = this.config?.isTicketIdEnabled ?? true;

		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(BRANCH_LINT_CONFIG_SUMMARY.ticketIdConfirmationQuestion, isTicketIdEnabledByDefault);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(BRANCH_LINT_CONFIG_SUMMARY.ticketIdConfirmationErrorMessage, error);

			return isTicketIdEnabledByDefault;
		}
	}

	/**
	 * Determines if branch-lint should be installed.
	 * Asks the user if they want to set up these tools for their project.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(BRANCH_LINT_CONFIG_SUMMARY.confirmationQuestion, await this.CONFIG_SERVICE.isModuleEnabled(EModule.BRANCH_LINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(BRANCH_LINT_CONFIG_SUMMARY.confirmationErrorMessage, error);

			return false;
		}
	}

	/**
	 * Creates the branch-lint configuration file.
	 * @param isTicketIdEnabled - Whether optional ticket-id placeholder should be enabled
	 */
	private async createConfigs(isTicketIdEnabled: boolean): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(BRANCH_LINT_CONFIG_FILE_NAME, BRANCH_LINT_CONFIG.template(isTicketIdEnabled), "utf8");
	}

	/**
	 * Displays a summary of the setup results.
	 * @param isTicketIdEnabled - Whether optional ticket-id placeholder is enabled
	 */
	private displaySetupSummary(isTicketIdEnabled: boolean): void {
		const branchPattern: string = isTicketIdEnabled ? BRANCH_LINT_CONFIG_MESSAGES.branchPatternEnabledValue : BRANCH_LINT_CONFIG_MESSAGES.branchPatternDisabledValue;

		const summary: Array<string> = [
			BRANCH_LINT_CONFIG_MESSAGES.branchLintDescription,
			"",
			BRANCH_LINT_CONFIG_MESSAGES.generatedScriptsLabel,
			`- npm run ${BRANCH_LINT_CONFIG_SCRIPTS.branch.name} ${BRANCH_LINT_CONFIG_MESSAGES.branchScriptDescription}`,
			"",
			BRANCH_LINT_CONFIG_MESSAGES.configurationFilesLabel,
			`- ${BRANCH_LINT_CONFIG_FILE_NAME}`,
			`- ${BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH}`,
			"",
			`${BRANCH_LINT_CONFIG_MESSAGES.branchPatternLabel} ${branchPattern}`,
			"",
			BRANCH_LINT_CONFIG_MESSAGES.huskyHookSetupNote,
			BRANCH_LINT_CONFIG_MESSAGES.branchCreationNote.replace("{script}", BRANCH_LINT_CONFIG_SCRIPTS.branch.name),
		];

		this.CLI_INTERFACE_SERVICE.note(BRANCH_LINT_CONFIG_SUMMARY.title, summary.join("\n"));
	}

	/**
	 * Finds existing branch-lint configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of BRANCH_LINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH)) {
			existingFiles.push(BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH);
		}

		return existingFiles;
	}

	/**
	 * Sets up branch-lint.
	 * Installs dependencies, creates configuration files, and configures git hooks.
	 * @param isTicketIdEnabled - Whether optional ticket-id placeholder should be enabled
	 */
	private async setupBranchLint(isTicketIdEnabled: boolean): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner(BRANCH_LINT_CONFIG_SUMMARY.setupStartMessage);

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(BRANCH_LINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(isTicketIdEnabled);
			await this.setupHusky();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner(BRANCH_LINT_CONFIG_SUMMARY.setupCompleteMessage);
			this.displaySetupSummary(isTicketIdEnabled);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(BRANCH_LINT_CONFIG_SUMMARY.setupFailedMessage);

			throw error;
		}
	}

	/**
	 * Sets up Husky git hooks.
	 * Initializes Husky, adds prepare script, and creates pre-push hook.
	 */
	private async setupHusky(): Promise<void> {
		// Initialize husky
		await this.COMMAND_SERVICE.execute(BRANCH_LINT_CONFIG_COMMANDS.initHusky);

		// Add prepare script if it doesn't exist
		await this.PACKAGE_JSON_SERVICE.addScript(BRANCH_LINT_CONFIG_SCRIPTS.prepare.name, BRANCH_LINT_CONFIG_SCRIPTS.prepare.command);

		await this.COMMAND_SERVICE.execute(BRANCH_LINT_CONFIG_COMMANDS.createHuskyDirectory);

		// Create pre-push hook
		await this.FILE_SYSTEM_SERVICE.writeFile(BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH, BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute(BRANCH_LINT_CONFIG_COMMANDS.makePrePushExecutable(BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_FILE_PATH));
	}

	/**
	 * Sets up npm scripts for Branch-lint.
	 * Adds 'branch' script for using an interactive interface CLI.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript(BRANCH_LINT_CONFIG_SCRIPTS.branch.name, BRANCH_LINT_CONFIG_SCRIPTS.branch.command);
	}
}
