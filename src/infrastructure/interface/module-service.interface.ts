import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfigService } from "../../application/interface/config-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";

/**
 * Interface for module services that can be installed/configured.
 * Provides methods for handling module installation and configuration.
 */
export interface IModuleService {
	/**
	 * CLI interface service for user interaction.
	 */
	CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/**
	 * Configuration service for managing app configuration
	 */
	CONFIG_SERVICE: IConfigService;

	/**
	 * File system service for file operations.
	 */
	FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Handles the case when the module is already installed.
	 * @returns Promise that resolves to true if the existing setup was handled successfully,
	 *          false if it should be reinstalled or reconfigured
	 */
	handleExistingSetup(): Promise<boolean>;

	/**
	 * Installs and configures the module.
	 * @returns Promise that resolves to the module setup result containing configuration details
	 */
	install(): Promise<IModuleSetupResult>;

	/**
	 * Determines whether the module should be installed.
	 * @returns Promise that resolves to true if the module should be installed, false otherwise
	 */
	shouldInstall(): Promise<boolean>;
}
