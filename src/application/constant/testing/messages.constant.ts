interface ITestingConfigMessages {
	configCreatedE2e: string;
	configCreatedUnit: string;
	confirmCoverage: string;
	confirmE2e: string;
	confirmSetup: string;
	confirmUnit: string;
	coverageEnabled: string;
	coverageInclude: string;
	coverageProvider: string;
	coverageReporter: string;
	deleteFilesQuestion: string;
	e2eConfigFileName: string;
	e2eEnabled: string;
	e2eIncludePattern: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	generatedFilesLabel: string;
	generatedScriptsLabel: string;
	selectFrameworkPrompt: string;
	settingUpSpinner: string;
	setupCompleteSpinner: string;
	setupCompleteTitle: string;
	testAllDescription: string;
	testE2eDescription: string;
	testE2eWatchDescription: string;
	testingSummary: string;
	testUnitCoverageDescription: string;
	testUnitDescription: string;
	testUnitWatchDescription: string;
	unitConfigFileName: string;
	unitEnabled: string;
	unitIncludePattern: string;
}

/**
 * Messages for the testing configuration module.
 */
export const TESTING_CONFIG_MESSAGES: ITestingConfigMessages = {
	configCreatedE2e: "E2E test configuration created successfully!",
	configCreatedUnit: "Unit test configuration created successfully!",
	confirmCoverage: "Would you like to enable code coverage reporting?",
	confirmE2e: "Would you like to set up end-to-end (E2E) tests?",
	confirmSetup: "Would you like to set up testing configuration?",
	confirmUnit: "Would you like to set up unit tests?",
	coverageEnabled: "  - Coverage: Enabled",
	coverageInclude: "    - Include: src/**/*.{js,ts}",
	coverageProvider: "    - Provider: v8",
	coverageReporter: "    - Reporter: text, html, lcov",
	deleteFilesQuestion: "Would you like to delete these files and continue?",
	e2eConfigFileName: "E2E Config File",
	e2eEnabled: "  - E2E Tests: Enabled",
	e2eIncludePattern: "    - Pattern: test/e2e/**/*.test.{js,ts}",
	existingFilesAborted: "Setup aborted. Existing configuration files were preserved.",
	existingFilesDetected: "Existing testing configuration files detected:",
	failedConfirmation: "Failed to get testing setup confirmation",
	failedSetupError: "Failed to set up testing configuration",
	failedSetupSpinner: "Failed to set up testing",
	generatedFilesLabel: "Generated Files:",
	generatedScriptsLabel: "Generated Scripts:",
	selectFrameworkPrompt: "Select a testing framework:",
	settingUpSpinner: "Setting up testing configuration...",
	setupCompleteSpinner: "Testing configuration complete!",
	setupCompleteTitle: "Testing Setup Complete!",
	testAllDescription: "  - test:all: Run all tests (unit + e2e)",
	testE2eDescription: "  - test:e2e: Run end-to-end tests",
	testE2eWatchDescription: "  - test:e2e:watch: Run e2e tests in watch mode",
	testingSummary: "Configuration Options:",
	testUnitCoverageDescription: "  - test:unit:coverage: Run unit tests with coverage",
	testUnitDescription: "  - test:unit: Run unit tests",
	testUnitWatchDescription: "  - test:unit:watch: Run unit tests in watch mode",
	unitConfigFileName: "Unit Config File",
	unitEnabled: "  - Unit Tests: Enabled",
	unitIncludePattern: "    - Pattern: test/unit/**/*.test.{js,ts}",
};
