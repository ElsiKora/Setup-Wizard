import { EModule } from "../../domain/enum/module.enum";
import { ELicense } from "../../domain/enum/license.enum";
import { ECiProvider } from "../../domain/enum/ci-provider.enum";
import { ECiModule } from "../../domain/enum/ci-module.enum";
import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { EIde } from "../../domain/enum/ide.enum";

export interface IConfig {
	[EModule.PRETTIER]?: boolean;
	[EModule.ESLINT]?: {
		isEnabled?: boolean;
		features?: EEslintFeature[];
	};
	[EModule.SEMANTIC_RELEASE]?: {
		isEnabled?: boolean;
		repositoryUrl?: string;
		mainBranch?: string;
		needsPreRelease?: boolean;
		preReleaseBranch?: string;
		preReleaseChannel?: string;
	};
	[EModule.IDE]?: {
		isEnabled?: boolean;
		ides?: EIde[];
	};
	[EModule.CI]?: {
		isEnabled?: boolean;
		provider?: ECiProvider;
		modules?: ECiModule[];
		moduleProperties?: {
			[key in ECiModule]?:
				| boolean
				| {
						isEnabled?: boolean;
						[propName: string]: any;
				  };
		};
	};
	[EModule.GITIGNORE]?: boolean;
	[EModule.COMMITLINT]?: boolean;
	[EModule.STYLELINT]?: boolean;
	[EModule.LICENSE]?: {
		isEnabled?: boolean;
		year?: number;
		author?: string;
		license?: ELicense;
	};
}
