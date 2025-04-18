import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { BRANCHLINT_CONFIG, BRANCHLINT_CONFIG_CORE_DEPENDENCIES, BRANCHLINT_CONFIG_FILE_NAMES, BRANCHLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT } from "../constant/branch-lint.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing Commitlint and Commitizen configuration.
 * Provides functionality to enforce consistent commit message formats using Commitlint
 * and simplify commit creation using Commitizen.
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
	 * Handles existing branch-lint setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing branch-lint configuration files detected:"];
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
				this.CLI_INTERFACE_SERVICE.warn("Existing branch-lint configuration files detected. Setup aborted.");

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
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			await this.setupBranchLint();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete branch-lint setup", error);

			throw error;
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
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Branch name linter for your project?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.BRANCH_LINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates the branch-lint configuration file.
	 */
	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(".elsikora/git-branch-lint.config.js", BRANCHLINT_CONFIG, "utf8");
	}

	/**
	 * Displays a summary of the setup results.
	 */
	private displaySetupSummary(): void {
		const summary: Array<string> = ["Branch Lint configuration has been created.", "", "Generated scripts:", "- npm run branch (for create new branch)", "", "Configuration files:", "- .elsikora/git-branch-lint.config.js", "- .husky/pre-push", "", "Husky git hooks have been set up to validate your branch names.", "Use 'npm run branch' to create and switch to new branches using an interactive interface."];

		this.CLI_INTERFACE_SERVICE.note("Branch Lint Setup", summary.join("\n"));
	}

	/**
	 * Finds existing branch-lint configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of BRANCHLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(".husky/pre-push")) {
			existingFiles.push(".husky/pre-push");
		}

		return existingFiles;
	}

	/**
	 * Sets up branch-lint.
	 * Installs dependencies, creates configuration files, and configures git hooks.
	 */
	private async setupBranchLint(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up branch-lint configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(BRANCHLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupHusky();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Branch Lint configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Branch Lint configuration");

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

		// Create pre-push hook
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/pre-push", BRANCHLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/pre-push");
	}

	/**
	 * Sets up npm scripts for Branch-lint.
	 * Adds 'commit' script for using an interactive interface CLI.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("branch", "npx @elsikora/git-branch-lint -b");
	}
}
