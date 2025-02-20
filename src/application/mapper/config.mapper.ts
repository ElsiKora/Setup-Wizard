import { IConfig } from "../interface/config.interface";
import { IInitCommandProperties } from "../../infrastructure/interface/init-command-properties.interface";
import { EModule } from "../../domain/enum/module.enum";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";

export class ConfigMapper {
	static fromConfigToInitCommandProperties(config: IConfig): IInitCommandProperties {
		const properties = {} as IInitCommandProperties;

		for (const key in config) {
			if (Object.prototype.hasOwnProperty.call(config, key)) {
				const value = config[key as keyof IConfig];

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
	}

	static fromSetupResultsToConfig(setupResults: Partial<Record<EModule, IModuleSetupResult>>): IConfig {
		const config = {} as IConfig;

		for (const key in setupResults) {
			if (Object.prototype.hasOwnProperty.call(setupResults, key)) {
				(config as any)[key] = { isEnabled: setupResults[key as EModule]?.wasInstalled, ...setupResults[key as EModule]?.customProperties };
			}
		}

		return config;
	}
}
