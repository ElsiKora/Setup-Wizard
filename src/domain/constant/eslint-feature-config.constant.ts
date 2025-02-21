import type { IEslintFeatureConfig } from "../interface/eslint-feature-config.interface";

import { EEslintFeature } from "../enum/eslint-feature.enum";

export const ESLINT_FEATURE_CONFIG: Record<EEslintFeature, IEslintFeatureConfig> = {
	[EEslintFeature.CHECK_FILE]: {
		configFlag: "withCheckFile",
		description: "File naming rules",
		packages: ["eslint-plugin-check-file"],
	},
	[EEslintFeature.JAVASCRIPT]: {
		configFlag: "withJavascript",
		description: "JavaScript support",
		isRequired: true,
		packages: [],
	},
	[EEslintFeature.JSON]: {
		configFlag: "withJson",
		description: "JSON files support",
		packages: ["eslint-plugin-jsonc"],
	},
	[EEslintFeature.NEST]: {
		configFlag: "withNest",
		description: "NestJS framework support",
		detect: ["@nestjs/core", "@nestjs/common"],
		isRequiresTypescript: true,
		packages: ["eslint-plugin-ng-module-sort", "@elsikora/eslint-plugin-nestjs-typed"],
	},
	[EEslintFeature.NODE]: {
		configFlag: "withNode",
		description: "Node.js specific rules",
		detect: ["node", "@types/node"],
		packages: ["eslint-plugin-n"],
	},
	[EEslintFeature.PACKAGE_JSON]: {
		configFlag: "withPackageJson",
		description: "package.json linting",
		packages: ["eslint-plugin-package-json"],
	},
	[EEslintFeature.PERFECTIONIST]: {
		configFlag: "withPerfectionist",
		description: "Code organization rules",
		packages: ["eslint-plugin-perfectionist"],
	},
	[EEslintFeature.PRETTIER]: {
		configFlag: "withPrettier",
		description: "Prettier integration",
		detect: ["prettier"],
		packages: ["eslint-plugin-prettier", "eslint-config-prettier", "prettier"],
	},
	[EEslintFeature.REACT]: {
		configFlag: "withReact",
		description: "React framework support",
		detect: ["react", "react-dom", "@types/react"],
		packages: ["@eslint-react/eslint-plugin"],
	},
	[EEslintFeature.REGEXP]: {
		configFlag: "withRegexp",
		description: "RegExp linting",
		packages: ["eslint-plugin-regexp"],
	},
	[EEslintFeature.SONAR]: {
		configFlag: "withSonar",
		description: "SonarJS code quality rules",
		packages: ["eslint-plugin-sonarjs"],
	},
	[EEslintFeature.STYLISTIC]: {
		configFlag: "withStylistic",
		description: "Stylistic rules",
		packages: ["@stylistic/eslint-plugin"],
	},
	[EEslintFeature.TAILWIND_CSS]: {
		configFlag: "withTailwindCss",
		description: "Tailwind CSS support",
		detect: ["tailwindcss"],
		packages: ["eslint-plugin-tailwindcss"],
	},
	[EEslintFeature.TYPEORM]: {
		configFlag: "withTypeorm",
		description: "TypeORM support",
		detect: ["typeorm", "@typeorm/core"],
		isRequiresTypescript: true,
		packages: ["eslint-plugin-typeorm-typescript"],
	},
	[EEslintFeature.TYPESCRIPT]: {
		configFlag: "withTypescript",
		description: "TypeScript support",
		detect: ["typescript", "@types/node"],
		isRequiresTypescript: true,
		packages: ["typescript", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin", "typescript-eslint"],
	},
	[EEslintFeature.UNICORN]: {
		configFlag: "withUnicorn",
		description: "Unicorn rules",
		packages: ["eslint-plugin-unicorn"],
	},
	[EEslintFeature.YAML]: {
		configFlag: "withYaml",
		description: "YAML files support",
		packages: ["eslint-plugin-yml"],
	},
};
