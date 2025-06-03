import type { ETestingFramework } from "../../../domain/enum/testing-framework.enum";

/**
 * Configuration interface for the Testing module.
 * Stores user preferences for test framework setup.
 */
export interface IConfigTesting {
	/** The selected test framework */
	framework: ETestingFramework;

	/** Whether to enable test coverage reporting */
	isCoverageEnabled: boolean;

	/** Whether to enable end-to-end tests */
	isE2eEnabled: boolean;

	/** Whether to enable unit tests */
	isUnitEnabled: boolean;
}
