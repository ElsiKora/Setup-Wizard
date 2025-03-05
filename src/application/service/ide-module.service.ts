import type { IIdeConfigContent } from "../../domain/interface/ide-config-content.interface";
import type { IIdeConfig } from "../../domain/interface/ide-config.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfigIde } from "../interface/config/ide.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { IDE_CONFIG } from "../../domain/constant/ide-config.constant";
import { EIde } from "../../domain/enum/ide.enum";
import { EModule } from "../../domain/enum/module.enum";

import { ConfigService } from "./config.service";

/**
 * Service for setting up and managing IDE-specific configurations.
 * Provides functionality to generate editor configurations for different IDEs
 * to ensure consistent code style and linting settings.
 */
export class IdeModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Cached IDE configuration */
	private config: IConfigIde | null = null;

	/** Configuration service for managing app configuration */
	private readonly CONFIG_SERVICE: ConfigService;

	/** Selected IDEs to configure */
	private selectedIdes: Array<EIde> = [];

	/**
	 * Initializes a new instance of the IdeModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	/**
	 * Handles existing IDE configuration setup.
	 * Checks for existing configuration files and asks for user confirmation if found.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length === 0) {
			return true;
		}

		this.CLI_INTERFACE_SERVICE.warn("Found existing IDE configuration files that might be modified:\n" + existingFiles.map((file: string) => `- ${file}`).join("\n"));

		return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to continue? This might overwrite existing files.", false);
	}

	/**
	 * Installs and configures IDE-specific settings.
	 * Guides the user through selecting IDEs and generating configuration files.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigIde>(EModule.IDE);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			this.selectedIdes = await this.selectIdes(this.config?.ides ?? []);

			if (this.selectedIdes.length === 0) {
				this.CLI_INTERFACE_SERVICE.warn("No IDEs selected.");

				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.CLI_INTERFACE_SERVICE.warn("Setup cancelled by user.");

				return { wasInstalled: false };
			}

			await this.setupSelectedIdes();

			return {
				customProperties: {
					ides: this.selectedIdes,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete IDE setup", error);

			throw error;
		}
	}

	/**
	 * Determines if IDE configuration should be installed.
	 * Asks the user if they want to set up IDE configurations for their project.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		return await this.CLI_INTERFACE_SERVICE.confirm("Would you like to set up ESLint and Prettier configurations for your code editors?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.IDE));
	}

	/**
	 * Displays a summary of successful and failed IDE configuration setups.
	 * @param successful - Array of successfully set up IDE configurations
	 * @param failed - Array of IDE configurations that failed to set up
	 */
	private displaySetupSummary(successful: Array<{ ide: EIde }>, failed: Array<{ error?: Error; ide: EIde }>): void {
		const summary: Array<string> = [
			"Successfully created configurations:",
			...successful.map(({ ide }: { ide: EIde }) => {
				const files: string = IDE_CONFIG[ide].content.map((config: IIdeConfigContent) => `  - ${config.filePath}`).join("\n");

				return `✓ ${IDE_CONFIG[ide].name}:\n${files}`;
			}),
		];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ error, ide }: { error?: Error; ide: EIde }) => `✗ ${IDE_CONFIG[ide].name} - ${error?.message ?? "Unknown error"}`));
		}

		this.CLI_INTERFACE_SERVICE.note("IDE Setup Summary", summary.join("\n"));
	}

	/**
	 * Finds existing IDE configuration files that might be overwritten.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const ide of this.selectedIdes) {
			const configContent: Array<IIdeConfigContent> = IDE_CONFIG[ide].content;

			for (const config of configContent) {
				if (await this.FILE_SYSTEM_SERVICE.isPathExists(config.filePath)) {
					existingFiles.push(config.filePath);
				}
			}
		}

		return existingFiles;
	}

	/**
	 * Prompts the user to select which IDEs they want to configure.
	 * @param savedIdes - Previously saved IDE selections
	 * @returns Promise resolving to an array of selected IDE enum values
	 */
	private async selectIdes(savedIdes: Array<EIde> = []): Promise<Array<EIde>> {
		const choices: Array<{ description: string; label: string; value: string }> = Object.entries(IDE_CONFIG).map(([ide, config]: [string, IIdeConfig]) => ({
			description: config.description,
			label: config.name,
			value: ide,
		}));

		const validSavedIdes: Array<EIde> = savedIdes.filter((ide: EIde) => Object.values(EIde).includes(ide));

		const initialSelection: Array<EIde> | undefined = validSavedIdes.length > 0 ? validSavedIdes : undefined;

		return await this.CLI_INTERFACE_SERVICE.multiselect<EIde>("Select your code editor(s):", choices, true, initialSelection);
	}

	/**
	 * Sets up configuration for a specific IDE.
	 * Creates necessary directories and configuration files.
	 * @param ide - The IDE to set up configuration for
	 * @returns Promise resolving to an object indicating success or failure with optional error
	 */
	private async setupIde(ide: EIde): Promise<{ error?: Error; ide: EIde; isSuccess: boolean }> {
		try {
			const configContent: Array<IIdeConfigContent> = IDE_CONFIG[ide].content;

			for (const config of configContent) {
				await this.FILE_SYSTEM_SERVICE.createDirectory(config.filePath, { isRecursive: true });
				await this.FILE_SYSTEM_SERVICE.writeFile(config.filePath, config.template());
			}

			return { ide, isSuccess: true };
		} catch (error) {
			return { error: error as Error, ide, isSuccess: false };
		}
	}

	/**
	 * Sets up configuration for all selected IDEs.
	 * Creates and writes IDE-specific configuration files.
	 */
	private async setupSelectedIdes(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up IDE configurations...");

		try {
			const results: Array<
				Awaited<{
					error?: Error;
					ide: EIde;
					isSuccess: boolean;
				}>
			> = await Promise.all(this.selectedIdes.map((ide: EIde) => this.setupIde(ide)));

			this.CLI_INTERFACE_SERVICE.stopSpinner("IDE configuration completed successfully!");

			const successfulSetups: Array<Awaited<{ error?: Error; ide: EIde; isSuccess: boolean }>> = results.filter(
				(
					r: Awaited<{
						error?: Error;
						ide: EIde;
						isSuccess: boolean;
					}>,
				) => r.isSuccess,
			);

			const failedSetups: Array<Awaited<{ error?: Error; ide: EIde; isSuccess: boolean }>> = results.filter(
				(
					r: Awaited<{
						error?: Error;
						ide: EIde;
						isSuccess: boolean;
					}>,
				) => !r.isSuccess,
			);

			this.displaySetupSummary(successfulSetups, failedSetups);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			throw error;
		}
	}
}
