import type { EModule } from "../enum/module.enum";

export interface IModuleConfig {
	dependencies?: Array<EModule>;
	name: EModule;
}
