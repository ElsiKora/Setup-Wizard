import { EEslintFeature } from "../enum/eslint-feature.enum";
import { IEslintFeatureConfig } from "../interface/eslint-feature-config.interface";

export const ESLINT_FEATURE_CONFIG: Record<
  EEslintFeature,
  IEslintFeatureConfig
> = {
  [EEslintFeature.CHECK_FILE]: {
    description: "File naming rules",
    packages: ["eslint-plugin-check-file"],
    configFlag: "withCheckFile",
  },
  [EEslintFeature.JAVASCRIPT]: {
    description: "JavaScript support",
    packages: [],
    required: true,
    configFlag: "withJavascript",
  },
  [EEslintFeature.JSON]: {
    description: "JSON files support",
    packages: ["eslint-plugin-jsonc"],
    configFlag: "withJson",
  },
  [EEslintFeature.NEST]: {
    description: "NestJS framework support",
    detect: ["@nestjs/core", "@nestjs/common"],
    packages: [
      "eslint-plugin-ng-module-sort",
      "@elsikora/eslint-plugin-nestjs-typed",
    ],
    requiresTypescript: true,
    configFlag: "withNest",
  },
  [EEslintFeature.NODE]: {
    description: "Node.js specific rules",
    detect: ["node", "@types/node"],
    packages: ["eslint-plugin-n"],
    configFlag: "withNode",
  },
  [EEslintFeature.PACKAGE_JSON]: {
    description: "package.json linting",
    packages: ["eslint-plugin-package-json"],
    configFlag: "withPackageJson",
  },
  [EEslintFeature.PERFECTIONIST]: {
    description: "Code organization rules",
    packages: ["eslint-plugin-perfectionist"],
    configFlag: "withPerfectionist",
  },
  [EEslintFeature.PRETTIER]: {
    description: "Prettier integration",
    detect: ["prettier"],
    packages: ["eslint-plugin-prettier", "eslint-config-prettier", "prettier"],
    configFlag: "withPrettier",
  },
  [EEslintFeature.REACT]: {
    description: "React framework support",
    detect: ["react", "react-dom", "@types/react"],
    packages: ["@eslint-react/eslint-plugin"],
    configFlag: "withReact",
  },
  [EEslintFeature.REGEXP]: {
    description: "RegExp linting",
    packages: ["eslint-plugin-regexp"],
    configFlag: "withRegexp",
  },
  [EEslintFeature.SONAR]: {
    description: "SonarJS code quality rules",
    packages: ["eslint-plugin-sonarjs"],
    configFlag: "withSonar",
  },
  [EEslintFeature.STYLISTIC]: {
    description: "Stylistic rules",
    packages: ["@stylistic/eslint-plugin"],
    configFlag: "withStylistic",
  },
  [EEslintFeature.TAILWIND_CSS]: {
    description: "Tailwind CSS support",
    detect: ["tailwindcss"],
    packages: ["eslint-plugin-tailwindcss"],
    configFlag: "withTailwindCss",
  },
  [EEslintFeature.TYPEORM]: {
    description: "TypeORM support",
    detect: ["typeorm", "@typeorm/core"],
    packages: ["eslint-plugin-typeorm-typescript"],
    configFlag: "withTypeorm",
    requiresTypescript: true,
  },
  [EEslintFeature.TYPESCRIPT]: {
    description: "TypeScript support",
    detect: ["typescript", "@types/node"],
    packages: [
      "typescript",
      "@typescript-eslint/parser",
      "@typescript-eslint/eslint-plugin",
      "typescript-eslint",
    ],
    requiresTypescript: true,
    configFlag: "withTypescript",
  },
  [EEslintFeature.UNICORN]: {
    description: "Unicorn rules",
    packages: ["eslint-plugin-unicorn"],
    configFlag: "withUnicorn",
  },
  [EEslintFeature.YAML]: {
    description: "YAML files support",
    packages: ["eslint-plugin-yml"],
    configFlag: "withYaml",
  },
};
