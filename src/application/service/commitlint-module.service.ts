import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/commitlint-config-core-dependencies.constant";
import { COMMITLINT_CONFIG_FILE_NAMES } from "../constant/commitlint-config-file-names.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../constant/commitlint-config-husky-commit-msg-script.constant";
import { COMMITLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT } from "../constant/commitlint-config-husky-pre-push-script.constant";
import { COMMITLINT_CONFIG } from "../constant/commitlint-config.constant";

import { ConfigService } from "./config.service";
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

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Configuration service for managing app configuration */
	private readonly CONFIG_SERVICE: ConfigService;

	/**
	 * Initializes a new instance of the CommitlintModuleService.
	 *
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	/**
	 * Handles existing Commitlint/Commitizen setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 *
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing Commitlint/Commitizen configuration files detected:"];
			messageLines.push("");

			if (existingFiles.length > 0) {
				for (const file of existingFiles) {
					messageLines.push(`- ${file}`);
				}
			}

			messageLines.push("", "Do you want to delete them?");

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn("Existing Commitlint/Commitizen configuration files detected. Setup aborted.");

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures Commitlint and Commitizen.
	 * Sets up configuration files, git hooks, and package.json scripts.
	 *
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
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Commitlint setup", error);

			throw error;
		}
	}

	/**
	 * Determines if Commitlint/Commitizen should be installed.
	 * Asks the user if they want to set up these tools for their project.
	 * Uses the saved config value as default if it exists.
	 *
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Commitlint and Commitizen for your project?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.COMMITLINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates the Commitlint configuration file.
	 */
	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile("commitlint.config.js", COMMITLINT_CONFIG, "utf8");
	}

	/**
	 * Displays a summary of the setup results.
	 */
	private displaySetupSummary(): void {
		const summary: Array<string> = ["Commitlint and Commitizen configuration has been created.", "", "Generated scripts:", "- npm run commit (for commitizen)", "", "Configuration files:", "- commitlint.config.js", "- .husky/commit-msg", "- .husky/pre-push", "", "Husky git hooks have been set up to validate your commits and branch names.", "Use 'npm run commit' to create commits using the interactive commitizen interface."];

		this.CLI_INTERFACE_SERVICE.note("Commitlint Setup", summary.join("\n"));
	}

	/**
	 * Finds existing Commitlint/Commitizen configuration files.
	 *
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of COMMITLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(".husky/commit-msg")) {
			existingFiles.push(".husky/commit-msg");
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(".husky/pre-push")) {
			existingFiles.push(".husky/pre-push");
		}

		return existingFiles;
	}

	/**
	 * Sets up Commitlint and Commitizen.
	 * Installs dependencies, creates configuration files, and configures git hooks.
	 */
	private async setupCommitlint(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Commitlint and Commitizen configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupHusky();
			await this.setupPackageJsonConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Commitlint and Commitizen configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Commitlint and Commitizen configuration");

			throw error;
		}
	}

	/**
	 * Sets up Husky git hooks.
	 * Initializes Husky, adds prepare script, and creates commit-msg and pre-push hooks.
	 */
	private async setupHusky(): Promise<void> {
		// Initialize husky
		await this.COMMAND_SERVICE.execute("npx husky");

		// Add prepare script if it doesn't exist
		await this.PACKAGE_JSON_SERVICE.addScript("prepare", "husky");

		await this.COMMAND_SERVICE.execute("mkdir -p .husky");

		// Create commit-msg hook
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/commit-msg");

		// Create pre-push hook
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/pre-push", COMMITLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/pre-push");
	}

	/**
	 * Sets up Commitizen configuration in package.json.
	 */
	private async setupPackageJsonConfigs(): Promise<void> {
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

		if (!packageJson.config) {
			packageJson.config = {};
		}
		packageJson.config.commitizen = {
			path: "@commitlint/cz-commitlint",
		};

		await this.PACKAGE_JSON_SERVICE.set(packageJson);
	}

	/**
	 * Sets up npm scripts for Commitizen.
	 * Adds 'commit' script for starting the Commitizen CLI.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("commit", "cz");
	}
}
