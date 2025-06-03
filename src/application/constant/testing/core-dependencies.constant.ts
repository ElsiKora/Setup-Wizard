import { TESTING_VITE_TSCONFIG_PATHS_PACKAGE_NAME, TESTING_VITEST_COVERAGE_V8_PACKAGE_NAME, TESTING_VITEST_PACKAGE_NAME, TESTING_VITEST_UI_PACKAGE_NAME } from "./package-names.constant";

/**
 * Core dependencies required for Vitest testing setup.
 */
export const TESTING_CONFIG_CORE_DEPENDENCIES: Readonly<Array<string>> = [TESTING_VITEST_PACKAGE_NAME, TESTING_VITEST_UI_PACKAGE_NAME] as const;

/**
 * Optional dependencies for testing features.
 */
export const TESTING_CONFIG_OPTIONAL_DEPENDENCIES: Readonly<{
	coverage: string;
	typescript: string;
}> = {
	coverage: TESTING_VITEST_COVERAGE_V8_PACKAGE_NAME,
	typescript: TESTING_VITE_TSCONFIG_PATHS_PACKAGE_NAME,
} as const;
