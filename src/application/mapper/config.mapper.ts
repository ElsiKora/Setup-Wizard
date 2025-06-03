import type { ECiModule } from "../../domain/enum/ci-module.enum";
import type { ECiProvider } from "../../domain/enum/ci-provider.enum";
import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import type { EIde } from "../../domain/enum/ide.enum";
import type { ELicense } from "../../domain/enum/license.enum";
import type { EModule } from "../../domain/enum/module.enum";
import type { TInitCommandProperties } from "../../infrastructure/type/init-command-properties.type";
import type { IConfig } from "../interface/config.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

/**
 * Mapper for configuration processing.
 * Provides utility functions for transforming between configuration formats.
 */
export const ConfigMapper: {
	/**
	 * Converts a configuration object to initialization command properties.
	 * @param config - The configuration object
	 * @returns Command properties for initialization
	 */
	fromConfigToInitCommandProperties(config: IConfig): TInitCommandProperties;

	/**
	 * Converts setup results to a configuration object.
	 * @param setupResults - Partial record of module setup results
	 * @returns Configuration object
	 */
	fromSetupResultsToConfig(setupResults: Partial<Record<EModule, IModuleSetupResult>>): IConfig;
} = {
	/**
	 * Converts a configuration object to initialization command properties.
	 * Extracts the enabled status from complex configuration objects.
	 * @param config - The configuration object
	 * @returns Command properties for initialization
	 */
	fromConfigToInitCommandProperties(config: IConfig): TInitCommandProperties {
		const properties: TInitCommandProperties = {} as TInitCommandProperties;

		for (const key in config) {
			if (Object.prototype.hasOwnProperty.call(config, key)) {
				const value:
					| { author?: string; isEnabled?: boolean; license?: ELicense; year?: number }
					| {
							baseUrl?: string;
							isCleanArchitectureEnabled?: boolean;
							isDecoratorsEnabled?: boolean;
							isEnabled?: boolean;
							outputDirectory?: string;
							rootDirectory?: string;
					  }
					| { features?: Array<EEslintFeature>; isEnabled?: boolean }
					| {
							framework?: string;
							isCoverageEnabled?: boolean;
							isE2eEnabled?: boolean;
							isEnabled?: boolean;
					  }
					| {
							ides?: Array<EIde>;
							isEnabled?: boolean;
					  }
					| {
							isEnabled?: boolean;
							isPrereleaseEnabled?: boolean;
							mainBranch?: string;
							preReleaseBranch?: string;
							preReleaseChannel?: string;
							repositoryUrl?: string;
					  }
					| {
							isEnabled?: boolean;
							moduleProperties?: Partial<Record<ECiModule, { [p: string]: unknown; isEnabled?: boolean } | boolean>>;
							modules?: Array<ECiModule>;
							provider?: ECiProvider;
					  }
					| boolean
					| undefined = config[key as keyof IConfig];

				if (typeof value === "boolean") {
					(properties as Record<string, unknown>)[key] = value;
				} else if (value && typeof value === "object" && "isEnabled" in value) {
					(properties as Record<string, unknown>)[key] = value.isEnabled;
				} else {
					(properties as Record<string, unknown>)[key] = !!value;
				}
			}
		}

		return properties;
	},

	/**
	 * Converts setup results to a configuration object.
	 * Combines wasInstalled flag with custom properties into a configuration.
	 * @param setupResults - Partial record of module setup results
	 * @returns Configuration object
	 */
	fromSetupResultsToConfig(setupResults: Partial<Record<EModule, IModuleSetupResult>>): IConfig {
		const config: IConfig = {} as IConfig;

		for (const key in setupResults) {
			if (Object.prototype.hasOwnProperty.call(setupResults, key)) {
				(config as Record<string, unknown>)[key] = { isEnabled: setupResults[key as EModule]?.wasInstalled, ...setupResults[key as EModule]?.customProperties };
			}
		}

		return config;
	},
};
