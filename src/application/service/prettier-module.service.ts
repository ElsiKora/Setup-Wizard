import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { PRETTIER_CONFIG_CORE_DEPENDENCIES } from "../constant/prettier-config-core-dependencies.constant";
import { PRETTIER_CONFIG_FILE_NAME } from "../constant/prettier-config-file-name.config";
import { PRETTIER_CONFIG_FILE_NAMES } from "../constant/prettier-config-file-names.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../constant/prettier-config-ignore-file-name.constant";
import { PRETTIER_CONFIG_IGNORE_PATHS } from "../constant/prettier-config-ignore-paths.constant";
import { PRETTIER_CONFIG } from "../constant/prettier-config.constant";

import { ConfigService } from "./config.service";
import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing Prettier code formatting.
 * Provides functionality to enforce consistent code style and formatting
 * across the project through Prettier configuration.
 */
export class PrettierModuleService implements IModuleService {
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
	 * Initializes a new instance of the PrettierModuleService.
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
	 * Handles existing Prettier setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing Prettier configuration files detected:"];
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
				this.CLI_INTERFACE_SERVICE.warn("Existing Prettier configuration files detected. Setup aborted.");

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures Prettier.
	 * Sets up configuration files and npm scripts for code formatting.
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

			await this.setupPrettier();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Prettier setup", error);

			throw error;
		}
	}

	/**
	 * Determines if Prettier should be installed.
	 * Asks the user if they want to set up Prettier for their project.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Prettier for your project?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.PRETTIER));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates Prettier configuration files.
	 * Generates the main config file and ignore file.
	 */
	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");

		await this.FILE_SYSTEM_SERVICE.writeFile(PRETTIER_CONFIG_IGNORE_FILE_NAME, PRETTIER_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
	}

	/**
	 * Displays a summary of the Prettier setup results.
	 * Lists generated scripts and configuration files.
	 */
	private displaySetupSummary(): void {
		const summary: Array<string> = ["Prettier configuration has been created.", "", "Generated scripts:", "- npm run format", "- npm run format:fix", "", "You can customize the configuration in these files:", `- ${PRETTIER_CONFIG_FILE_NAME}`, `- ${PRETTIER_CONFIG_IGNORE_FILE_NAME}`];

		this.CLI_INTERFACE_SERVICE.note("Prettier Setup", summary.join("\n"));
	}

	/**
	 * Finds existing Prettier configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of PRETTIER_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	/**
	 * Sets up Prettier configuration.
	 * Installs dependencies, creates config files, and adds npm scripts.
	 */
	private async setupPrettier(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Prettier configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(PRETTIER_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Prettier configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Prettier configuration");

			throw error;
		}
	}

	/**
	 * Sets up npm scripts for Prettier.
	 * Adds scripts for checking and fixing code formatting.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("format", "prettier --check .");
		await this.PACKAGE_JSON_SERVICE.addScript("format:fix", "prettier --write .");
	}
}
