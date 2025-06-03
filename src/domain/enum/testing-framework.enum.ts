/**
 * Enum representing available testing frameworks.
 * Used to determine which testing tool to configure.
 */
export enum ETestingFramework {
	/** Jasmine testing framework */
	JASMINE = "jasmine",

	/** Jest testing framework */
	JEST = "jest",

	/** Mocha testing framework */
	MOCHA = "mocha",

	/** Vitest testing framework */
	VITEST = "vitest",
}
