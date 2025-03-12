import type { EModule } from "../../domain/enum/module.enum";
import type { IConfig } from "../interface/config.interface";

import type { IFileSystemService } from "./file-system-service.interface";

/**
 * Interface for managing application configuration.
 * Defines contract for reading, writing, and manipulating configuration settings.
 */
export interface IConfigService {
	/**
	 * Checks if the configuration exists.
	 * @returns Promise resolving to true if the configuration exists, false otherwise
	 */
	exists(): Promise<boolean>;

	/**
	 * File system service for file operations.
	 */
	FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Retrieves the current configuration.
	 * @returns Promise resolving to the configuration object
	 */
	get(): Promise<IConfig>;

	/**
	 * Gets the saved configuration for a specific module.
	 * @param module - The module to get configuration for
	 * @returns Promise resolving to the module configuration or null if not found
	 */
	// eslint-disable-next-line @elsikora/unicorn/prefer-module
	getModuleConfig<T>(module: EModule): Promise<null | T>;

	/**
	 * Gets a specific property from the configuration.
	 * @param property - The property key to retrieve
	 * @returns Promise resolving to the value of the specified property
	 */
	getProperty<K extends keyof IConfig>(property: K): Promise<IConfig[K]>;

	/**
	 * Checks if a specific module is enabled in the configuration.
	 * @param module - The module to check
	 * @returns Promise resolving to true if the module is enabled, false otherwise
	 */
	// eslint-disable-next-line @elsikora/unicorn/prefer-module
	isModuleEnabled(module: EModule): Promise<boolean>;

	/**
	 * Merges partial configuration with the existing configuration.
	 * @param partial - Partial configuration to merge
	 * @returns Promise that resolves when the merged configuration is saved
	 */
	merge(partial: Partial<IConfig>): Promise<void>;

	/**
	 * Saves the entire configuration.
	 * @param config - The complete configuration to save
	 * @returns Promise that resolves when the configuration is saved
	 */
	set(config: IConfig): Promise<void>;

	/**
	 * Sets a specific property in the configuration.
	 * @param property - The property key to set
	 * @param value - The value to assign to the property
	 * @returns Promise that resolves when the updated configuration is saved
	 */
	setProperty<K extends keyof IConfig>(property: K, value: IConfig[K]): Promise<void>;
}
