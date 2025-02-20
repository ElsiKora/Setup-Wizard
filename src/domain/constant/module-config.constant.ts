import {EModule} from "../enum/module.enum";
import {IModuleConfig} from "../interface/module-config.interface";

export const MODULE_CONFIG: Record<EModule, IModuleConfig> = {
    [EModule.ESLINT]: {
        name: EModule.ESLINT,
        dependencies: []
    },
    [EModule.PRETTIER]: {
        name: EModule.PRETTIER,
        dependencies: [EModule.ESLINT]
    },
    [EModule.STYLELINT]: {
        name: EModule.STYLELINT,
        dependencies: []
    },
    [EModule.CI]: {
        name: EModule.CI,
        dependencies: []
    },
    [EModule.SEMANTIC_RELEASE]: {
        name: EModule.SEMANTIC_RELEASE,
        dependencies: [EModule.CI]
    },
    [EModule.COMMITLINT]: {
        name: EModule.COMMITLINT,
        dependencies: []
    },
    [EModule.GITIGNORE]: {
        name: EModule.GITIGNORE,
        dependencies: []
    },
    [EModule.LICENSE]: {
        name: EModule.LICENSE,
        dependencies: []
    },
    [EModule.IDE]: {
        name: EModule.IDE,
        dependencies: []
    }
};
