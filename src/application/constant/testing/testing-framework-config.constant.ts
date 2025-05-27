import type { ITestingFrameworkConfig } from "../../../domain/interface/testing-framework-config.interface";

import { ETestingFramework } from "../../../domain/enum/testing-framework.enum";

/**
 * Configuration for different testing frameworks.
 * Provides framework-specific settings and dependencies.
 */
export const TESTING_FRAMEWORK_CONFIG: Record<ETestingFramework, ITestingFrameworkConfig> = {
	[ETestingFramework.JASMINE]: {
		configFiles: {
			e2e: "jasmine.e2e.json",
			unit: "jasmine.json",
		},
		configGenerator: {
			imports: {
				base: "",
				typescript: "",
			},
			plugins: {
				typescript: "",
			},
		},
		coreDependencies: ["jasmine", "@types/jasmine"],
		description: "Behavior-driven testing framework",
		name: "Jasmine",
		optionalDependencies: {
			coverage: "nyc",
			typescript: "ts-node",
		},
		scripts: {
			testE2e: "jasmine --config=jasmine.e2e.json",
			testE2eWatch: "nodemon --exec 'jasmine --config=jasmine.e2e.json'",
			testUnit: "jasmine --config=jasmine.json",
			testUnitCoverage: "nyc jasmine --config=jasmine.json",
			testUnitWatch: "nodemon --exec 'jasmine --config=jasmine.json'",
		},
	},
	[ETestingFramework.JEST]: {
		configFiles: {
			e2e: "jest.e2e.config.js",
			unit: "jest.config.js",
		},
		configGenerator: {
			imports: {
				base: "",
				typescript: "",
			},
			plugins: {
				typescript: "",
			},
		},
		coreDependencies: ["jest", "@types/jest"],
		description: "Delightful JavaScript testing framework",
		name: "Jest",
		optionalDependencies: {
			coverage: "@jest/coverage",
			typescript: "ts-jest",
		},
		scripts: {
			testE2e: "jest --config jest.e2e.config.js",
			testE2eWatch: "jest --watch --config jest.e2e.config.js",
			testUnit: "jest --config jest.config.js",
			testUnitCoverage: "jest --coverage --config jest.config.js",
			testUnitWatch: "jest --watch --config jest.config.js",
		},
	},
	[ETestingFramework.MOCHA]: {
		configFiles: {
			e2e: ".mocharc.e2e.json",
			unit: ".mocharc.json",
		},
		configGenerator: {
			imports: {
				base: "",
				typescript: "",
			},
			plugins: {
				typescript: "",
			},
		},
		coreDependencies: ["mocha", "@types/mocha", "chai", "@types/chai"],
		description: "Feature-rich JavaScript test framework",
		name: "Mocha",
		optionalDependencies: {
			coverage: "nyc",
			typescript: "ts-node",
		},
		scripts: {
			testE2e: "mocha 'test/e2e/**/*.test.js'",
			testE2eWatch: "mocha --watch 'test/e2e/**/*.test.js'",
			testUnit: "mocha 'test/unit/**/*.test.js'",
			testUnitCoverage: "nyc mocha 'test/unit/**/*.test.js'",
			testUnitWatch: "mocha --watch 'test/unit/**/*.test.js'",
		},
	},
	[ETestingFramework.VITEST]: {
		configFiles: {
			e2e: "vitest.e2e.config.js",
			unit: "vitest.unit.config.js",
		},
		configGenerator: {
			imports: {
				base: 'import { defineConfig } from "vitest/config";',
				typescript: 'import tsconfigPaths from "vite-tsconfig-paths";',
			},
			plugins: {
				typescript: "tsconfigPaths()",
			},
		},
		coreDependencies: ["vitest", "@vitest/ui"],
		description: "Fast unit test framework powered by Vite",
		name: "Vitest",
		optionalDependencies: {
			coverage: "@vitest/coverage-v8",
			typescript: "vite-tsconfig-paths",
		},
		scripts: {
			testE2e: "vitest run test/e2e --config vitest.e2e.config.js",
			testE2eWatch: "vitest test/e2e --config vitest.e2e.config.js",
			testUnit: "vitest run test/unit --config vitest.unit.config.js",
			testUnitCoverage: "vitest run test/unit --config vitest.unit.config.js --coverage",
			testUnitWatch: "vitest test/unit --config vitest.unit.config.js",
		},
	},
};
