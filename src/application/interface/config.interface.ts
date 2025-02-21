import type { ECiModule } from "../../domain/enum/ci-module.enum";
import type { ECiProvider } from "../../domain/enum/ci-provider.enum";
import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import type { EIde } from "../../domain/enum/ide.enum";
import type { ELicense } from "../../domain/enum/license.enum";
import type { ELintStagedFeature } from "../../domain/enum/lint-staged-feature.enum";
import type { EModule } from "../../domain/enum/module.enum";

export interface IConfig {
	[EModule.CI]?: {
		isEnabled?: boolean;
		moduleProperties?: Partial<
			Record<
				ECiModule,
				| {
						[propName: string]: any;
						isEnabled?: boolean;
				  }
				| boolean
			>
		>;
		modules?: Array<ECiModule>;
		provider?: ECiProvider;
	};
	[EModule.COMMITLINT]?: boolean;
	[EModule.ESLINT]?: {
		features?: Array<EEslintFeature>;
		isEnabled?: boolean;
	};
	[EModule.GITIGNORE]?: boolean;
	[EModule.IDE]?: {
		ides?: Array<EIde>;
		isEnabled?: boolean;
	};
	[EModule.LICENSE]?: {
		author?: string;
		isEnabled?: boolean;
		license?: ELicense;
		year?: number;
	};
	[EModule.LINT_STAGED]?: {
		features?: Array<ELintStagedFeature>;
		isEnabled?: boolean;
	};
	[EModule.PRETTIER]?: boolean;
	[EModule.SEMANTIC_RELEASE]?: {
		isEnabled?: boolean;
		isPrereleaseEnabled?: boolean;
		mainBranch?: string;
		preReleaseBranch?: string;
		preReleaseChannel?: string;
		repositoryUrl?: string;
	};
	[EModule.STYLELINT]?: boolean;
}
