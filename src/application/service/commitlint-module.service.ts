import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
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
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			await this.setupCommitlint();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(COMMITLINT_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
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
	 */
	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(COMMITLINT_CONFIG_FILE_PATHS.configFile, COMMITLINT_CONFIG, "utf8");
	}

	/**
	 * Displays a summary of the setup results.
	 */
	private displaySetupSummary(): void {
		const summary: Array<string> = [COMMITLINT_CONFIG_MESSAGES.configurationCreated, "", COMMITLINT_CONFIG_MESSAGES.generatedScriptsLabel, COMMITLINT_CONFIG_SUMMARY.commitDescription, "", COMMITLINT_CONFIG_MESSAGES.configurationFilesLabel, COMMITLINT_CONFIG_SUMMARY.configFileDescription, COMMITLINT_CONFIG_SUMMARY.huskyCommitMsgDescription, "", COMMITLINT_CONFIG_MESSAGES.huskyGitHooksInfo, COMMITLINT_CONFIG_MESSAGES.commitizenDescription];

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
	 * Sets up Commitlint and Commitizen.
	 * Installs dependencies, creates configuration files, and configures git hooks.
	 */
	private async setupCommitlint(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner(COMMITLINT_CONFIG_MESSAGES.settingUpSpinner);

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupHusky();
			await this.setupPackageJsonConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner(COMMITLINT_CONFIG_MESSAGES.configurationCompleted);
			this.displaySetupSummary();
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
