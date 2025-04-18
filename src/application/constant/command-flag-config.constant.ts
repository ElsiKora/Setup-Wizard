import type { ICommandFlagConfig } from "../interface/command-flag-config.interface";

import { EModule } from "../../domain/enum/module.enum";

export const COMMAND_FLAG_CONFIG: Record<EModule, ICommandFlagConfig> = {
	[EModule.BRANCH_LINT]: {
		description: "Add branch-lint configuration",
		fullFlag: "withBranchLint",
		shortFlag: "b",
	},
	[EModule.CI]: {
		description: "Add GitHub CI configuration",
		fullFlag: "withCI",
		shortFlag: "i",
	},
	[EModule.COMMITLINT]: {
		description: "Add commitlint configuration",
		fullFlag: "withCommitlint",
		shortFlag: "c",
	},
	[EModule.ESLINT]: {
		description: "Add ESLint configuration",
		fullFlag: "withEslint",
		shortFlag: "e",
	},
	[EModule.GITIGNORE]: {
		description: "Add .gitignore file",
		fullFlag: "withGitignore",
		shortFlag: "g",
	},
	[EModule.IDE]: {
		description: "Add IDE configuration",
		fullFlag: "withIde",
		shortFlag: "d",
	},
	[EModule.LICENSE]: {
		description: "Add LICENSE file",
		fullFlag: "withLicense",
		shortFlag: "l",
	},
	[EModule.LINT_STAGED]: {
		description: "Add lint-staged configuration",
		fullFlag: "withLintStaged",
		shortFlag: "t",
	},
	[EModule.PRETTIER]: {
		description: "Add Prettier configuration",
		fullFlag: "withPrettier",
		shortFlag: "p",
	},
	[EModule.SEMANTIC_RELEASE]: {
		description: "Add semantic-release configuration",
		fullFlag: "withSemanticRelease",
		shortFlag: "r",
	},
	[EModule.STYLELINT]: {
		description: "Add Stylelint configuration",
		fullFlag: "withStylelint",
		shortFlag: "s",
	},
};
