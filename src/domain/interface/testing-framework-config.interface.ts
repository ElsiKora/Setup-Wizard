/**
 * Configuration interface for testing frameworks.
 * Defines the structure for framework-specific settings.
 */
export interface ITestingFrameworkConfig {
	/** Configuration file names */
	configFiles: {
		/** E2E test configuration file */
		e2e: string;
		/** Unit test configuration file */
		unit: string;
	};

	/** Configuration generation details */
	configGenerator: {
		/** Import statements */
		imports: {
			/** Base imports for the framework */
			base: string;
			/** Additional imports for TypeScript */
			typescript: string;
		};
		/** Plugin configurations */
		plugins: {
			/** TypeScript plugin configuration */
			typescript: string;
		};
	};

	/** Core npm dependencies required for the framework */
	coreDependencies: Array<string>;

	/** Brief description of the framework */
	description: string;

	/** Human-readable name of the testing framework */
	name: string;

	/** Optional dependencies for additional features */
	optionalDependencies: {
		/** Package name for coverage support */
		coverage: string;
		/** Package name for TypeScript support */
		typescript: string;
	};

	/** NPM scripts for running tests */
	scripts: {
		/** Script to run e2e tests */
		testE2e: string;
		/** Script to run e2e tests in watch mode */
		testE2eWatch: string;
		/** Script to run unit tests */
		testUnit: string;
		/** Script to run unit tests with coverage */
		testUnitCoverage: string;
		/** Script to run unit tests in watch mode */
		testUnitWatch: string;
	};
}
