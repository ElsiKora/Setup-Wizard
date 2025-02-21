import type { IModuleConfig } from "../interface/module-config.interface";

import { EModule } from "../enum/module.enum";

export const MODULE_CONFIG: Record<EModule, IModuleConfig> = {
	[EModule.CI]: {
		dependencies: [],
		name: EModule.CI,
	},
	[EModule.COMMITLINT]: {
		dependencies: [],
		name: EModule.COMMITLINT,
	},
	[EModule.ESLINT]: {
		dependencies: [],
		name: EModule.ESLINT,
	},
	[EModule.GITIGNORE]: {
		dependencies: [],
		name: EModule.GITIGNORE,
	},
	[EModule.IDE]: {
		dependencies: [],
		name: EModule.IDE,
	},
	[EModule.LICENSE]: {
		dependencies: [],
		name: EModule.LICENSE,
	},
	[EModule.PRETTIER]: {
		dependencies: [EModule.ESLINT],
		name: EModule.PRETTIER,
	},
	[EModule.SEMANTIC_RELEASE]: {
		dependencies: [EModule.CI],
		name: EModule.SEMANTIC_RELEASE,
	},
	[EModule.STYLELINT]: {
		dependencies: [],
		name: EModule.STYLELINT,
	},
};
