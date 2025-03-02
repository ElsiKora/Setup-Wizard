/* eslint-disable @elsikora-unicorn/prefer-module */
import type { EModule } from "../../domain/enum/module.enum";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { TConfigModule } from "../type/config-module.type";

import { CONFIG_FILE_PATH } from "../constant/config-file-path.constant";

/**
 * Service for managing application configuration.
 * Handles reading, writing, and manipulating configuration settings.
 */
export class ConfigService {
	/**
	 * Initializes a new instance of the ConfigService.
	 *
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(private readonly fileSystemService: IFileSystemService) {}

	/**
	 * Checks if the configuration file exists.
	 *
	 * @returns Promise resolving to true if the configuration file exists, false otherwise
	 */
	public async exists(): Promise<boolean> {
		return this.fileSystemService.isPathExists(CONFIG_FILE_PATH);
	}

	/**
	 * Retrieves the current configuration.
	 * Attempts to load configuration from file, with fallbacks for different scenarios.
	 *
	 * @returns Promise resolving to the configuration object
	 */
	public async get(): Promise<IConfig> {
		try {
			const isExists: boolean = await this.exists();

			if (!isExists) {
				return {} as IConfig;
			}

			if (typeof require !== "undefined") {
				const configPathResolved: string = require.resolve(CONFIG_FILE_PATH);

				if (require.cache[configPathResolved]) {
					// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
					delete require.cache[configPathResolved];
				}

				const configModule: TConfigModule = (await import(CONFIG_FILE_PATH)) as TConfigModule;

				return configModule.default ?? ({} as IConfig);
			}

			const content: string = await this.fileSystemService.readFile(CONFIG_FILE_PATH);
			const configMatch: null | RegExpExecArray = /export\s+default\s+(\{[\s\S]*?\});?\s*$/.exec(content);

			if (configMatch?.[1]) {
				const configString: string = configMatch[1];

				try {
					// eslint-disable-next-line @elsikora-sonar/code-eval,@elsikora-typescript/no-implied-eval,@elsikora-typescript/no-unsafe-call
					return new Function(`"use strict"; return ${configString}`)() as IConfig;
				} catch (evalError: unknown) {
					console.error("Failed to parse config:", evalError);

					return {} as IConfig;
				}
			}

			return JSON.parse(content) as IConfig;
		} catch (error: unknown) {
			console.error("Error reading config:", error);

			return {} as IConfig;
		}
	}

	/**
	 * Gets the saved configuration for a specific module from the config file.
	 *
	 * @param module - The module to get configuration for
	 * @returns Promise resolving to the module configuration or null if not found
	 */
	async getModuleConfig(module: EModule): Promise<null | Partial<IConfig>> {
		try {
			if (await this.exists()) {
				const config: IConfig = await this.get();

				if (config[module]) {
					return config[module] as Record<string, any>;
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Gets a specific property from the configuration.
	 *
	 * @param property - The property key to retrieve
	 * @returns Promise resolving to the value of the specified property
	 */
	public async getProperty<K extends keyof IConfig>(property: K): Promise<IConfig[K]> {
		const config: IConfig = await this.get();

		return config[property];
	}

	/**
	 * Merges partial configuration with the existing configuration.
	 *
	 * @param partial - Partial configuration to merge
	 * @returns Promise that resolves when the merged configuration is saved
	 */
	public async merge(partial: Partial<IConfig>): Promise<void> {
		try {
			const config: IConfig = (await this.exists()) ? await this.get() : ({} as IConfig);
			const merged: IConfig = { ...config, ...partial };
			await this.set(merged);
		} catch (error: unknown) {
			console.error("Error merging config:", error);
			await this.set(partial as IConfig);
		}
	}

	/**
	 * Saves the entire configuration.
	 *
	 * @param config - The complete configuration to save
	 * @returns Promise that resolves when the configuration is saved
	 */
	public async set(config: IConfig): Promise<void> {
		const configContent: string = `export default ${this.objectToJsString(config)};`;
		await this.fileSystemService.writeFile(CONFIG_FILE_PATH, configContent);
	}

	/**
	 * Sets a specific property in the configuration.
	 *
	 * @param property - The property key to set
	 * @param value - The value to assign to the property
	 * @returns Promise that resolves when the updated configuration is saved
	 */
	public async setProperty<K extends keyof IConfig>(property: K, value: IConfig[K]): Promise<void> {
		const config: IConfig = await this.get();
		config[property] = value;
		await this.set(config);
	}

	/**
	 * Determines if a JavaScript object key needs quotes when serialized.
	 *
	 * @param key - The object key to check
	 * @returns True if the key needs quotes in JavaScript object notation, false otherwise
	 */
	private needsQuotes(key: string): boolean {
		const validIdentifier: RegExp = /^[a-z_$][\w$]*$/i;

		const reservedWords: Set<string> = new Set<string>(["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"]);

		return !validIdentifier.test(key) || reservedWords.has(key) || key.includes("-");
	}

	/**
	 * Converts an object to a formatted JavaScript string representation.
	 *
	 * @param object - The object to convert to a string
	 * @param indent - Current indentation level (used for recursive calls)
	 * @returns A string representation of the object in JavaScript syntax
	 */
	private objectToJsString(object: any, indent: number = 0): string {
		if (object === null) return "null";

		if (object === undefined) return "undefined";

		const indentString: string = " ".repeat(indent);
		// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
		const nextIndentString: string = " ".repeat(indent + 2);

		if (Array.isArray(object)) {
			const objectArray: Array<any> = object;

			if (objectArray.length === 0) return "[]";

			// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
			const items: string = objectArray.map((item: any): string => `${nextIndentString}${this.objectToJsString(item, indent + 2)}`).join(",\n");

			return `[\n${items}\n${indentString}]`;
		}

		if (typeof object === "object") {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-argument
			const objectKeys: Array<string> = Object.keys(object);

			if (objectKeys.length === 0) return "{}";

			const entries: string = objectKeys
				.map((key: string): string => {
					const formattedKey: string = this.needsQuotes(key) ? `"${key}"` : key;

					// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-magic-numbers
					return `${nextIndentString}${formattedKey}: ${this.objectToJsString(object[key], indent + 2)}`;
				})
				.join(",\n");

			return `{\n${entries}\n${indentString}}`;
		}

		if (typeof object === "string") {
			// eslint-disable-next-line @elsikora-sonar/no-nested-template-literals
			return `'${object.replaceAll("'", String.raw`\'`)}'`;
		}

		if (typeof object === "function") {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment,@elsikora-typescript/no-unsafe-function-type
			const functionObject: Function = object;

			return functionObject.toString();
		}

		return String(object);
	}
}
