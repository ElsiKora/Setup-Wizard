import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { GITIGNORE_CONFIG } from "../../domain/constant/gitignore-config.constant";
import { EModule } from "../../domain/enum/module.enum";

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
			const existingGitignore: string | undefined = await this.FILE_SYSTEM_SERVICE.isOneOfPathsExists([".gitignore"]);

			if (!existingGitignore) {
				return true;
			}

			const shouldReplace: boolean = await this.CLI_INTERFACE_SERVICE.confirm(`An existing .gitignore file was found (${existingGitignore}). Would you like to replace it?`);

			if (!shouldReplace) {
				this.CLI_INTERFACE_SERVICE.warn("Keeping existing .gitignore file.");

				return false;
			}

			try {
				await this.FILE_SYSTEM_SERVICE.deleteFile(existingGitignore);
				this.CLI_INTERFACE_SERVICE.success("Deleted existing .gitignore file.");

				return true;
			} catch (error) {
				this.CLI_INTERFACE_SERVICE.handleError("Failed to delete existing .gitignore file", error);

				return false;
			}
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to check existing .gitignore setup", error);

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
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete .gitignore installation", error);

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
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to generate .gitignore file for your project?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.GITIGNORE));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

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
			summary.push("Successfully created configuration:", "✓ .gitignore file");
		} else {
			summary.push("Failed configuration:", `✗ .gitignore - ${error?.message ?? "Unknown error"}`);
		}

		summary.push("", "The .gitignore configuration includes:", "- Build outputs and dependencies", "- Common IDEs and editors", "- Testing and coverage files", "- Environment and local config files", "- System and temporary files", "- Framework-specific files", "- Lock files", "", "You can customize it further by editing .gitignore");

		this.CLI_INTERFACE_SERVICE.note("Gitignore Setup Summary", summary.join("\n"));
	}

	/**
	 * Generates a new .gitignore file.
	 * @returns Promise resolving to an object indicating success or failure with optional error
	 */
	private async generateNewGitignore(): Promise<{ error?: Error; isSuccess: boolean }> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Generating .gitignore file...");

		try {
			await this.FILE_SYSTEM_SERVICE.writeFile(".gitignore", GITIGNORE_CONFIG);
			this.CLI_INTERFACE_SERVICE.stopSpinner(".gitignore file generated");

			return { isSuccess: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			return { error: error as Error, isSuccess: false };
		}
	}
}
