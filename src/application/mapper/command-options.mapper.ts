import {COMMAND_FLAG_CONFIG} from "../constant/command-flag-config.constant";
import {EModule} from "../../domain/enum/module.enum";
import {IModuleEnableStatusProperties} from "../interface/module-enable-status-properties.interface";

export class CommandOptionsMapper {
    static fromFlagToModule(properties: Record<string, boolean>): IModuleEnableStatusProperties {
        const commandProperties: IModuleEnableStatusProperties = {};

        Object.entries(COMMAND_FLAG_CONFIG).forEach(([module, config]) => {
            const moduleKey = module as EModule;
            commandProperties[moduleKey] = properties[config.fullFlag] || false;
        });

        return commandProperties;
    }
}
