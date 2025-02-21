import type { EEslintFeature } from "../enum/eslint-feature.enum";
import type { EFramework } from "../enum/framework.enum";

import type { IFrameworkConfigIgnorePath } from "./framework-config-ignore-path.interface";

export interface IFrameworkConfig {
	description?: string;
	displayName: string;
	features: Array<EEslintFeature>;
	fileIndicators?: Array<string>;
	ignorePath: IFrameworkConfigIgnorePath;
	isSupportWatch?: boolean;
	lintPaths: Array<string>;
	name: EFramework;
	packageIndicators: {
		dependencies?: Array<string>;
		devDependencies?: Array<string>;
		either?: Array<string>;
	};
}
