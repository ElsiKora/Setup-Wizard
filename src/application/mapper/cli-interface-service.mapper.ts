import type { ELicense } from "../../domain/enum/license.enum";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { ILicenseConfig } from "../../domain/interface/license-config.interface";

export const CliInterfaceServiceMapper: {
	fromLicenseConfigsToSelectOptions(properties: Record<ELicense, ILicenseConfig>): Array<ICliInterfaceServiceSelectOptions>;
} = {
	fromLicenseConfigsToSelectOptions(properties: Record<ELicense, ILicenseConfig>): Array<ICliInterfaceServiceSelectOptions> {
		return Object.entries(properties).map(([license, config]: [string, ILicenseConfig]) => ({
			label: `${config.name} (${license})`,
			value: license,
		}));
	},
};
