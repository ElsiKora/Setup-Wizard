import type { EEslintFeature } from "../enum/eslint-feature.enum";

export interface IEslintFeatureGroup {
	features: Array<EEslintFeature>;
	name: string;
}
