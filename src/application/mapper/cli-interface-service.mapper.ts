import type { ELicense } from "../../domain/enum/license.enum";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { ILicenseConfig } from "../../domain/interface/license-config.interface";

/**
 * Mapper for CLI interface service operations.
 * Provides utility functions for transforming data structures for CLI display.
 */
export const CliInterfaceServiceMapper: {
	/**
	 * Converts license configurations to select options for CLI interface.
	 *
	 * @param properties - Record of license types to license configurations
	 * @returns Array of select options formatted for CLI interface
	 */
	fromLicenseConfigsToSelectOptions(properties: Record<ELicense, ILicenseConfig>): Array<ICliInterfaceServiceSelectOptions>;
} = {
	/**
	 * Converts license configurations to select options for CLI interface.
	 * Formats each license as an option with name and value for display in selection prompts.
	 *
	 * @param properties - Record of license types to license configurations
	 * @returns Array of select options formatted for CLI interface
	 */
	fromLicenseConfigsToSelectOptions(properties: Record<ELicense, ILicenseConfig>): Array<ICliInterfaceServiceSelectOptions> {
		return Object.entries(properties).map(([license, config]: [string, ILicenseConfig]) => ({
			label: `${config.name} (${license})`,
			value: license,
		}));
	},
};
