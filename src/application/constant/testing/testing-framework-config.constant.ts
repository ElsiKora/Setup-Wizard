import type { ITestingFrameworkConfig } from "../../../domain/interface/testing-framework-config.interface";

import { ETestingFramework } from "../../../domain/enum/testing-framework.enum";
import {
	TESTING_CHAI_PACKAGE_NAME,
	TESTING_CHAI_TYPES_PACKAGE_NAME,
	TESTING_JASMINE_PACKAGE_NAME,
	TESTING_JASMINE_TYPES_PACKAGE_NAME,
	TESTING_JEST_COVERAGE_PACKAGE_NAME,
	TESTING_JEST_PACKAGE_NAME,
	TESTING_JEST_TYPES_PACKAGE_NAME,
	TESTING_MOCHA_PACKAGE_NAME,
	TESTING_MOCHA_TYPES_PACKAGE_NAME,
	TESTING_NYC_PACKAGE_NAME,
	TESTING_TS_JEST_PACKAGE_NAME,
	TESTING_TS_NODE_PACKAGE_NAME,
	TESTING_VITE_TSCONFIG_PATHS_PACKAGE_NAME,
	TESTING_VITEST_COVERAGE_V8_PACKAGE_NAME,
	TESTING_VITEST_PACKAGE_NAME,
	TESTING_VITEST_UI_PACKAGE_NAME,
} from "../testing/package-names.constant";

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
		coreDependencies: [TESTING_JASMINE_PACKAGE_NAME, TESTING_JASMINE_TYPES_PACKAGE_NAME],
		description: "Behavior-driven testing framework",
		name: "Jasmine",
		optionalDependencies: {
			coverage: TESTING_NYC_PACKAGE_NAME,
			typescript: TESTING_TS_NODE_PACKAGE_NAME,
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
		coreDependencies: [TESTING_JEST_PACKAGE_NAME, TESTING_JEST_TYPES_PACKAGE_NAME],
		description: "Delightful JavaScript testing framework",
		name: "Jest",
		optionalDependencies: {
			coverage: TESTING_JEST_COVERAGE_PACKAGE_NAME,
			typescript: TESTING_TS_JEST_PACKAGE_NAME,
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
		coreDependencies: [TESTING_MOCHA_PACKAGE_NAME, TESTING_MOCHA_TYPES_PACKAGE_NAME, TESTING_CHAI_PACKAGE_NAME, TESTING_CHAI_TYPES_PACKAGE_NAME],
		description: "Feature-rich JavaScript test framework",
		name: "Mocha",
		optionalDependencies: {
			coverage: TESTING_NYC_PACKAGE_NAME,
			typescript: TESTING_TS_NODE_PACKAGE_NAME,
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
		coreDependencies: [TESTING_VITEST_PACKAGE_NAME, TESTING_VITEST_UI_PACKAGE_NAME],
		description: "Fast unit test framework powered by Vite",
		name: "Vitest",
		optionalDependencies: {
			coverage: TESTING_VITEST_COVERAGE_V8_PACKAGE_NAME,
			typescript: TESTING_VITE_TSCONFIG_PATHS_PACKAGE_NAME,
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
