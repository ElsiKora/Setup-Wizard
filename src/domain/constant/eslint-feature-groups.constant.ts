import type { IEslintFeatureGroup } from "../interface/eslint-feature-group.interface";

import { EEslintFeature } from "../enum/eslint-feature.enum";

export const ESLINT_FEATURE_GROUPS: Array<IEslintFeatureGroup> = [
	{
		features: [EEslintFeature.SONAR, EEslintFeature.UNICORN, EEslintFeature.PERFECTIONIST, EEslintFeature.JSDOC],
		name: "Code Quality",
	},
	{
		features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT, EEslintFeature.JSX],
		name: "Core Features",
	},
	{
		features: [EEslintFeature.JSON, EEslintFeature.YAML, EEslintFeature.CHECK_FILE, EEslintFeature.PACKAGE_JSON, EEslintFeature.MARKDOWN],
		name: "File Types",
	},
	{
		features: [EEslintFeature.REACT, EEslintFeature.NEST, EEslintFeature.NEXT],
		name: "Frameworks",
	},
	{
		features: [EEslintFeature.NODE, EEslintFeature.REGEXP, EEslintFeature.TYPEORM],
		name: "Other Tools",
	},
	{
		features: [EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER, EEslintFeature.STYLISTIC, EEslintFeature.CSS],
		name: "Styling",
	},
];
