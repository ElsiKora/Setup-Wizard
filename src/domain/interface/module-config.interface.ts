import {EModule} from "../enum/module.enum";

export interface IModuleConfig {
    name: EModule;
    dependencies?: EModule[];
}
