import type { ILintStagedFeatureConfig } from "../interface/lint-staged-feature-config.interface";

import { ELintStagedFeature } from "../enum/lint-staged-feature.enum";

export const LINT_STAGED_FEATURE_CONFIG: Record<ELintStagedFeature, ILintStagedFeatureConfig> = {
	[ELintStagedFeature.ESLINT]: {
		fileExtensions: ["js", "jsx", "mjs", "cjs", "ts", "tsx", "json", "jsonc", "yml", "yaml"],
		label: "ESLint - JavaScript/TypeScript linter",
		requiredPackages: ["eslint"],
	},
	[ELintStagedFeature.PRETTIER]: {
		fileExtensions: ["*"],
		label: "Prettier - Code formatter",
		requiredPackages: ["prettier"],
	},
	[ELintStagedFeature.STYLELINT]: {
		fileExtensions: ["css", "scss", "sass", "less", "style", "pcss", "styled", "stylus"],
		label: "Stylelint - CSS/SCSS linter",
		requiredPackages: ["stylelint"],
	},
	[ELintStagedFeature.TYPESCRIPT]: {
		fileExtensions: ["ts", "tsx"],
		label: "TypeScript - Type checking",
		requiredPackages: ["tsc-files"],
	},
};
