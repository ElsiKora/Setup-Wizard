import {ELicense} from "../../domain/enum/license.enum";
import {ILicenseConfig} from "../../domain/interface/license-config.interface";
import {ICliInterfaceServiceSelectOptions} from "../../domain/interface/cli-interface-service-select-options.interface";

export class CliInterfaceServiceMapper {
    static fromLicenseConfigsToSelectOptions(properties: Record<ELicense, ILicenseConfig>): ICliInterfaceServiceSelectOptions[] {
        return Object.entries(properties).map(([license, config]) => ({
            label: `${config.name} (${license})`,
            value: license
        }));
    }
}
