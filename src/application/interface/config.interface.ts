import type { EModule } from "../../domain/enum/module.enum";

import type { IBranchlint } from "./config/branch-lint.interface";
import type { IConfigBuilder } from "./config/builder.interface";
import type { IConfigCi } from "./config/ci.interface";
import type { IConfigCommitlint } from "./config/commitlint.interface";
import type { IConfigEslint } from "./config/eslint.interface";
import type { IConfigGitignore } from "./config/gitignore.interface";
import type { IConfigIde } from "./config/ide.interface";
import type { IConfigLicense } from "./config/license.interface";
import type { IConfigLintStaged } from "./config/lint-staged.interface";
import type { IConfigPrettier } from "./config/prettier.interface";
import type { IConfigPrlint } from "./config/prlint.interface";
import type { IConfigSemanticRelease } from "./config/semantic-release.interface";
import type { IConfigStylelint } from "./config/stylelint.interface";
import type { IConfigTesting } from "./config/testing.interface";
import type { IConfigTypescript } from "./config/typescript.interface";

/**
 * Configuration interface that includes all module configurations.
 * Each property represents a module's configuration.
 */
export interface IConfig {
	[EModule.BRANCH_LINT]?: IBranchlint;
	[EModule.BUILDER]?: IConfigBuilder;
	[EModule.CI]?: IConfigCi;
	[EModule.COMMITLINT]?: IConfigCommitlint;
	[EModule.ESLINT]?: IConfigEslint;
	[EModule.GITIGNORE]?: IConfigGitignore;
	[EModule.IDE]?: IConfigIde;
	[EModule.LICENSE]?: IConfigLicense;
	[EModule.LINT_STAGED]?: IConfigLintStaged;
	[EModule.PRETTIER]?: IConfigPrettier;
	[EModule.PRLINT]?: IConfigPrlint;
	[EModule.SEMANTIC_RELEASE]?: IConfigSemanticRelease;
	[EModule.STYLELINT]?: IConfigStylelint;
	[EModule.TESTING]?: IConfigTesting;
	[EModule.TYPESCRIPT]?: IConfigTypescript;
}
