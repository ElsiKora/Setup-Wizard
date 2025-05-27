/**
 * Core dependencies required for Vitest testing setup.
 */
export const TESTING_CONFIG_CORE_DEPENDENCIES: Readonly<Array<string>> = ["vitest", "@vitest/ui"] as const;

/**
 * Optional dependencies for testing features.
 */
export const TESTING_CONFIG_OPTIONAL_DEPENDENCIES: Readonly<{
	coverage: string;
	typescript: string;
}> = {
	coverage: "@vitest/coverage-v8",
	typescript: "vite-tsconfig-paths",
} as const;
