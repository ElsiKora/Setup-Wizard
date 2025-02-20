import {EModule} from "../../domain/enum/module.enum";

export interface IModuleEnableStatusProperties extends Partial<Record<EModule, boolean>> {}
