import type { EModule } from "../../domain/enum/module.enum";
import type { TModuleEnableStatusProperties } from "../type/module-enable-status-properties.type";

import { COMMAND_FLAG_CONFIG } from "../constant/command-flag-config.constant";

/**
 * Mapper for command options processing.
 * Provides utility functions for transforming command-line flags to module configurations.
 */
export const CommandOptionsMapper: {
	/**
	 * Converts command-line flags to module enable status properties.
	 *
	 * @param properties - Record of flag names to boolean values
	 * @returns Object with module keys mapped to their enabled status
	 */
	fromFlagToModule(properties: Record<string, boolean>): TModuleEnableStatusProperties;
} = {
	/**
	 * Converts command-line flags to module enable status properties.
	 * Maps each flag to its corresponding module and sets the enable status.
	 *
	 * @param properties - Record of flag names to boolean values
	 * @returns Object with module keys mapped to their enabled status
	 */
	fromFlagToModule(properties: Record<string, boolean>): TModuleEnableStatusProperties {
		const commandProperties: TModuleEnableStatusProperties = {};

		for (const [module, config] of Object.entries(COMMAND_FLAG_CONFIG)) {
			const moduleKey: EModule = module as EModule;
			commandProperties[moduleKey] = properties[config.fullFlag] || false;
		}

		return commandProperties;
	},
};
