import type { IEslintFeatureConfig } from "../interface/eslint-feature-config.interface";

import { EEslintFeature } from "../enum/eslint-feature.enum";

const a: number = 5;

export const ESLINT_FEATURE_CONFIG: Record<EEslintFeature, IEslintFeatureConfig> = {
	[EEslintFeature.CHECK_FILE]: {
		configFlag: "withCheckFile",
		description: "File naming rules",
		packages: [],
	},
	[EEslintFeature.CSS]: {
		configFlag: "withCss",
		description: "CSS support",
		packages: [],
	},
	[EEslintFeature.FSD]: {
		configFlag: "withFsd",
		description: "File structure definition",
		packages: ["@conarti/eslint-plugin-feature-sliced"],
	},
	[EEslintFeature.I18NEXT]: {
		configFlag: "withI18next",
		description: "i18next localization support",
		packages: ["eslint-plugin-i18next"],
	},
	[EEslintFeature.JAVASCRIPT]: {
		configFlag: "withJavascript",
		description: "JavaScript support",
		isRequired: true,
		packages: [],
	},
	[EEslintFeature.JSDOC]: {
		configFlag: "withJsDoc",
		description: "JSDoc support",
		packages: [],
	},
	[EEslintFeature.JSON]: {
		configFlag: "withJson",
		description: "JSON files support",
		packages: [],
	},
	[EEslintFeature.JSX]: {
		configFlag: "withJsx",
		description: "JSX support",
		packages: ["eslint-plugin-jsx-a11y"],
	},
	[EEslintFeature.MARKDOWN]: {
		configFlag: "withMarkdown",
		description: "Markdown files support",
		packages: [],
	},
	[EEslintFeature.NEST]: {
		configFlag: "withNest",
		description: "NestJS framework support",
		detect: ["@nestjs/core", "@nestjs/common"],
		isRequiresTypescript: true,
		packages: ["eslint-plugin-ng-module-sort", "@elsikora/eslint-plugin-nestjs-typed"],
	},
	[EEslintFeature.NEXT]: {
		configFlag: "withNext",
		description: "Next.js framework support",
		detect: ["next", "next/types"],
		packages: ["@next/eslint-plugin-next"],
	},
	[EEslintFeature.NO_SECRETS]: {
		configFlag: "withNoSecrets",
		description: "Secrets detection",
		packages: ["eslint-plugin-no-secrets"],
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
		packages: [],
	},
	[EEslintFeature.PERFECTIONIST]: {
		configFlag: "withPerfectionist",
		description: "Code organization rules",
		packages: [],
	},
	[EEslintFeature.PRETTIER]: {
		configFlag: "withPrettier",
		description: "Prettier integration",
		detect: ["prettier"],
		packages: [],
	},
	[EEslintFeature.REACT]: {
		configFlag: "withReact",
		description: "React framework support",
		detect: ["react", "react-dom", "@types/react"],
		packages: ["@eslint-react/eslint-plugin", "eslint-plugin-react"],
	},
	[EEslintFeature.REGEXP]: {
		configFlag: "withRegexp",
		description: "RegExp linting",
		packages: [],
	},
	[EEslintFeature.SONAR]: {
		configFlag: "withSonar",
		description: "SonarJS code quality rules",
		packages: [],
	},
	[EEslintFeature.STORYBOOK]: {
		configFlag: "withStorybook",
		description: "Storybook support",
		packages: ["eslint-plugin-storybook"],
	},
	[EEslintFeature.STYLISTIC]: {
		configFlag: "withStylistic",
		description: "Stylistic rules",
		packages: [],
	},
	[EEslintFeature.TAILWIND_CSS]: {
		configFlag: "withTailwindCss",
		description: "Tailwind CSS support",
		detect: ["tailwindcss"],
		packages: [],
	},
	[EEslintFeature.TANSTACK]: {
		configFlag: "withTanstack",
		description: "TanStack rules",
		packages: ["@tanstack/eslint-plugin-router", "@tanstack/eslint-plugin-query"],
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
		packages: [],
	},
	[EEslintFeature.UNICORN]: {
		configFlag: "withUnicorn",
		description: "Unicorn rules",
		packages: [],
	},
	[EEslintFeature.YAML]: {
		configFlag: "withYaml",
		description: "YAML files support",
		packages: [],
	},
};
