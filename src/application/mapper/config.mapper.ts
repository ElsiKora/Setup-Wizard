/* eslint-disable @elsikora-typescript/no-unsafe-member-access */
import type { ECiModule } from "../../domain/enum/ci-module.enum";
import type { ECiProvider } from "../../domain/enum/ci-provider.enum";
import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import type { EIde } from "../../domain/enum/ide.enum";
import type { ELicense } from "../../domain/enum/license.enum";
import type { EModule } from "../../domain/enum/module.enum";
import type { TInitCommandProperties } from "../../infrastructure/type/init-command-properties.type";
import type { IConfig } from "../interface/config.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

export const ConfigMapper: {
	fromConfigToInitCommandProperties(config: IConfig): TInitCommandProperties;
	fromSetupResultsToConfig(setupResults: Partial<Record<EModule, IModuleSetupResult>>): IConfig;
} = {
	fromConfigToInitCommandProperties(config: IConfig): TInitCommandProperties {
		const properties: TInitCommandProperties = {} as TInitCommandProperties;

		for (const key in config) {
			if (Object.prototype.hasOwnProperty.call(config, key)) {
				const value:
					| { author?: string; isEnabled?: boolean; license?: ELicense; year?: number }
					| { features?: Array<EEslintFeature>; isEnabled?: boolean }
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
							moduleProperties?: Partial<Record<ECiModule, { [p: string]: any; isEnabled?: boolean } | boolean>>;
							modules?: Array<ECiModule>;
							provider?: ECiProvider;
					  }
					| boolean
					| undefined = config[key as keyof IConfig];

				if (typeof value === "boolean") {
					(properties as any)[key] = value;
				} else if (value && typeof value === "object" && "isEnabled" in value) {
					(properties as any)[key] = value.isEnabled;
				} else {
					(properties as any)[key] = !!value;
				}
			}
		}

		return properties;
	},

	fromSetupResultsToConfig(setupResults: Partial<Record<EModule, IModuleSetupResult>>): IConfig {
		const config: IConfig = {} as IConfig;

		for (const key in setupResults) {
			if (Object.prototype.hasOwnProperty.call(setupResults, key)) {
				(config as any)[key] = { isEnabled: setupResults[key as EModule]?.wasInstalled, ...setupResults[key as EModule]?.customProperties };
			}
		}

		return config;
	},
};
