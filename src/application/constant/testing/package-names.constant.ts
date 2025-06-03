/**
 * Package names for different testing frameworks
 */

// Vitest packages
export const TESTING_VITEST_PACKAGE_NAME: string = "vitest";
export const TESTING_VITEST_UI_PACKAGE_NAME: string = "@vitest/ui";
export const TESTING_VITEST_COVERAGE_V8_PACKAGE_NAME: string = "@vitest/coverage-v8";
export const TESTING_VITE_TSCONFIG_PATHS_PACKAGE_NAME: string = "vite-tsconfig-paths";

// Jest packages
export const TESTING_JEST_PACKAGE_NAME: string = "jest";
export const TESTING_JEST_TYPES_PACKAGE_NAME: string = "@types/jest";
export const TESTING_JEST_COVERAGE_PACKAGE_NAME: string = "@jest/coverage";
export const TESTING_TS_JEST_PACKAGE_NAME: string = "ts-jest";

// Mocha packages
export const TESTING_MOCHA_PACKAGE_NAME: string = "mocha";
export const TESTING_MOCHA_TYPES_PACKAGE_NAME: string = "@types/mocha";
export const TESTING_CHAI_PACKAGE_NAME: string = "chai";
export const TESTING_CHAI_TYPES_PACKAGE_NAME: string = "@types/chai";

// Jasmine packages
export const TESTING_JASMINE_PACKAGE_NAME: string = "jasmine";
export const TESTING_JASMINE_TYPES_PACKAGE_NAME: string = "@types/jasmine";

// Common testing utility packages
export const TESTING_NYC_PACKAGE_NAME: string = "nyc";
export const TESTING_TS_NODE_PACKAGE_NAME: string = "ts-node";

// CLI command names
export const TESTING_VITEST_CLI_COMMAND: string = "vitest";
export const TESTING_JEST_CLI_COMMAND: string = "jest";
export const TESTING_MOCHA_CLI_COMMAND: string = "mocha";
export const TESTING_JASMINE_CLI_COMMAND: string = "jasmine";
export const TESTING_NYC_CLI_COMMAND: string = "nyc";
export const TESTING_NODEMON_CLI_COMMAND: string = "nodemon";

// Test paths
export const TESTING_UNIT_TEST_PATH: string = "test/unit";
export const TESTING_E2E_TEST_PATH: string = "test/e2e";
export const TESTING_MOCHA_UNIT_PATTERN: string = "'test/unit/**/*.test.js'";
export const TESTING_MOCHA_E2E_PATTERN: string = "'test/e2e/**/*.test.js'";

// Common config file names
export const TESTING_VITEST_CONFIG_FILES: Readonly<Array<string>> = ["vitest.config.js", "vitest.config.ts", "vite.config.js", "vite.config.ts"] as const;
