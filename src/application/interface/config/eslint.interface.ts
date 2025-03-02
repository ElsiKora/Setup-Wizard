import type { EEslintFeature } from "../../../domain/enum/eslint-feature.enum";

export interface IConfigEslint {
	features?: Array<EEslintFeature>;
	isEnabled?: boolean;
}
