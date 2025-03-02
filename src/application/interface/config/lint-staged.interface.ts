import type { ELintStagedFeature } from "../../../domain/enum/lint-staged-feature.enum";

export interface IConfigLintStaged {
	features?: Array<ELintStagedFeature>;
	isEnabled?: boolean;
}
