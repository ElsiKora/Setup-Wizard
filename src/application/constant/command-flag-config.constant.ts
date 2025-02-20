import {ICommandFlagConfig} from "../interface/command-flag-config.interface";
import {EModule} from "../../domain/enum/module.enum";

export const COMMAND_FLAG_CONFIG: Record<EModule, ICommandFlagConfig> = {
    [EModule.ESLINT]: {
        shortFlag: 'e',
        fullFlag: 'withEslint',
        description: 'Add ESLint configuration'
    },
    [EModule.PRETTIER]: {
        shortFlag: 'p',
        fullFlag: 'withPrettier',
        description: 'Add Prettier configuration'
    },
    [EModule.STYLELINT]: {
        shortFlag: 's',
        fullFlag: 'withStylelint',
        description: 'Add Stylelint configuration'
    },
    [EModule.CI]: {
        shortFlag: 'i',
        fullFlag: 'withCI',
        description: 'Add GitHub CI configuration'
    },
    [EModule.SEMANTIC_RELEASE]: {
        shortFlag: 'r',
        fullFlag: 'withSemanticRelease',
        description: 'Add semantic-release configuration'
    },
    [EModule.COMMITLINT]: {
        shortFlag: 'c',
        fullFlag: 'withCommitlint',
        description: 'Add commitlint configuration'
    },
    [EModule.GITIGNORE]: {
        shortFlag: 'g',
        fullFlag: 'withGitignore',
        description: 'Add .gitignore file'
    },
    [EModule.LICENSE]: {
        shortFlag: 'l',
        fullFlag: 'withLicense',
        description: 'Add LICENSE file'
    },
    [EModule.IDE]: {
        shortFlag: 'd',
        fullFlag: 'withIde',
        description: 'Add IDE configuration'
    }
};
