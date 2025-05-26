import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { GITIGNORE_CONFIG } from "../constant/gitignore/config.constant";
import { GITIGNORE_CONFIG_FILE_NAME } from "../constant/gitignore/file-name.constant";
import { GITIGNORE_CONFIG_FILE_NAMES } from "../constant/gitignore/file-names.constant";
import { GITIGNORE_CONFIG_MESSAGES } from "../constant/gitignore/messages.constant";
import { GITIGNORE_CONFIG_SUMMARY } from "../constant/gitignore/summary.constant";

/**
 * Service for setting up and managing .gitignore file.
 * Provides functionality to create a comprehensive .gitignore file
 * that helps prevent unwanted files from being tracked by Git.
 */
export class GitignoreModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Configuration service for managing app configuration */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Initializes a new instance of the GitignoreModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 * @param configService - Service for managing app configuration
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Handles existing .gitignore setup.
	 * Checks for existing .gitignore file and asks if user wants to replace it.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingGitignore: string | undefined = await this.FILE_SYSTEM_SERVICE.isOneOfPathsExists(GITIGNORE_CONFIG_FILE_NAMES);

			if (!existingGitignore) {
				return true;
			}

			const shouldReplace: boolean = await this.CLI_INTERFACE_SERVICE.confirm(GITIGNORE_CONFIG_MESSAGES.existingFileFound(existingGitignore));

			if (!shouldReplace) {
				this.CLI_INTERFACE_SERVICE.warn(GITIGNORE_CONFIG_MESSAGES.keepingExisting);

				return false;
			}

			try {
				await this.FILE_SYSTEM_SERVICE.deleteFile(existingGitignore);
				this.CLI_INTERFACE_SERVICE.success(GITIGNORE_CONFIG_MESSAGES.deletedExisting);

				return true;
			} catch (error) {
				this.CLI_INTERFACE_SERVICE.handleError(GITIGNORE_CONFIG_MESSAGES.failedDeleteExisting, error);

				return false;
			}
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(GITIGNORE_CONFIG_MESSAGES.failedCheckExisting, error);

			return false;
		}
	}

	/**
	 * Installs and configures .gitignore.
	 * Generates a new .gitignore file with common patterns.
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

			const setupResult: { error?: Error; isSuccess: boolean } = await this.generateNewGitignore();
			this.displaySetupSummary(setupResult.isSuccess, setupResult.error);

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(GITIGNORE_CONFIG_MESSAGES.failedComplete, error);

			throw error;
		}
	}

	/**
	 * Determines if .gitignore should be installed.
	 * Asks the user if they want to generate a .gitignore file.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(GITIGNORE_CONFIG_MESSAGES.confirmGenerate, await this.CONFIG_SERVICE.isModuleEnabled(EModule.GITIGNORE));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(GITIGNORE_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Displays a summary of the setup results.
	 * Lists what was included in the generated .gitignore file.
	 * @param isSuccess - Whether the setup was successful
	 * @param error - Optional error if setup failed
	 */
	private displaySetupSummary(isSuccess: boolean, error?: Error): void {
		const summary: Array<string> = [];

		if (isSuccess) {
			summary.push(GITIGNORE_CONFIG_SUMMARY.successConfig, GITIGNORE_CONFIG_SUMMARY.fileCreated);
		} else {
			summary.push(GITIGNORE_CONFIG_SUMMARY.failedConfig, GITIGNORE_CONFIG_SUMMARY.fileFailed(error?.message ?? "Unknown error"));
		}

		summary.push(GITIGNORE_CONFIG_SUMMARY.description);

		this.CLI_INTERFACE_SERVICE.note(GITIGNORE_CONFIG_SUMMARY.title, summary.join("\n"));
	}

	/**
	 * Generates a new .gitignore file.
	 * @returns Promise resolving to an object indicating success or failure with optional error
	 */
	private async generateNewGitignore(): Promise<{ error?: Error; isSuccess: boolean }> {
		this.CLI_INTERFACE_SERVICE.startSpinner(GITIGNORE_CONFIG_MESSAGES.generatingFile);

		try {
			await this.FILE_SYSTEM_SERVICE.writeFile(GITIGNORE_CONFIG_FILE_NAME, GITIGNORE_CONFIG);
			this.CLI_INTERFACE_SERVICE.stopSpinner(GITIGNORE_CONFIG_MESSAGES.fileGenerated);

			return { isSuccess: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			return { error: error as Error, isSuccess: false };
		}
	}
}
