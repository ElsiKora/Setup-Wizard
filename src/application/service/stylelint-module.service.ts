import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { STYLELINT_CONFIG_CORE_DEPENDENCIES } from "../constant/stylelint-config-core-dependencies.constant";
import { STYLELINT_CONFIG_FILE_NAME } from "../constant/stylelint-config-file-name.constant";
import { STYLELINT_CONFIG_FILE_NAMES } from "../constant/stylelint-config-file-names.constant";
import { STYLELINT_CONFIG_IGNORE_FILE_NAME } from "../constant/stylelint-config-ignore-file-name.constant";
import { STYLELINT_CONFIG_IGNORE_PATHS } from "../constant/stylelint-config-ignore-paths.constant";
import { STYLELINT_CONFIG } from "../constant/stylelint-config.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing Stylelint configuration.
 * Provides functionality to enforce consistent CSS/SCSS code style and format
 * through Stylelint configuration and npm scripts.
 */
export class StylelintModuleService implements IModuleService {
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
	 * Initializes a new instance of the StylelintModuleService.
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
	 * Handles existing Stylelint setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing Stylelint configuration files detected:"];
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
				this.CLI_INTERFACE_SERVICE.warn("Existing Stylelint configuration files detected. Setup aborted.");

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures Stylelint.
	 * Sets up configuration files and npm scripts for CSS/SCSS linting.
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

			await this.setupStylelint();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Stylelint setup", error);

			throw error;
		}
	}

	/**
	 * Determines if Stylelint should be installed.
	 * Asks the user if they want to set up Stylelint for their project.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Stylelint for your project?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.STYLELINT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates Stylelint configuration files.
	 * Generates the main config file and ignore file.
	 */
	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(STYLELINT_CONFIG_FILE_NAME, STYLELINT_CONFIG, "utf8");

		await this.FILE_SYSTEM_SERVICE.writeFile(STYLELINT_CONFIG_IGNORE_FILE_NAME, STYLELINT_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
	}

	/**
	 * Displays a summary of the Stylelint setup results.
	 * Lists generated scripts and configuration files.
	 */
	private displaySetupSummary(): void {
		const summary: Array<string> = ["Stylelint configuration has been created.", "", "Generated scripts:", "- npm run lint:style", "- npm run lint:style:fix", "", "You can customize the configuration in these files:", `- ${STYLELINT_CONFIG_FILE_NAME}`, `- ${STYLELINT_CONFIG_IGNORE_FILE_NAME}`];

		this.CLI_INTERFACE_SERVICE.note("Stylelint Setup", summary.join("\n"));
	}

	/**
	 * Finds existing Stylelint configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of STYLELINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	/**
	 * Sets up npm scripts for Stylelint.
	 * Adds scripts for linting and fixing CSS/SCSS files.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("lint:style", 'stylelint "**/*.{css,scss}"');
		await this.PACKAGE_JSON_SERVICE.addScript("lint:style:fix", 'stylelint "**/*.{css,scss}" --fix');
	}

	/**
	 * Sets up Stylelint configuration.
	 * Installs dependencies, creates config files, and adds npm scripts.
	 */
	private async setupStylelint(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Stylelint configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(STYLELINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Stylelint configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Stylelint configuration");

			throw error;
		}
	}
}
