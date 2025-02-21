import type { EModule } from "../../domain/enum/module.enum";
import type { TModuleEnableStatusProperties } from "../type/module-enable-status-properties.type";

import { COMMAND_FLAG_CONFIG } from "../constant/command-flag-config.constant";

export const CommandOptionsMapper: {
	fromFlagToModule(properties: Record<string, boolean>): TModuleEnableStatusProperties;
} = {
	fromFlagToModule(properties: Record<string, boolean>): TModuleEnableStatusProperties {
		const commandProperties: TModuleEnableStatusProperties = {};

		for (const [module, config] of Object.entries(COMMAND_FLAG_CONFIG)) {
			const moduleKey: EModule = module as EModule;
			commandProperties[moduleKey] = properties[config.fullFlag] || false;
		}

		return commandProperties;
	},
};
