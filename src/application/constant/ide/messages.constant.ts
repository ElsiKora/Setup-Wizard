interface IIdeConfigMessages {
	confirmContinue: string;
	confirmSetup: string;
	existingFilesFound: string;
	failedConfiguration: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	noIdesSelected: string;
	selectIdesPrompt: string;
	settingUpSpinner: string;
	setupCancelledByUser: string;
	setupCompleteSpinner: string;
	setupSummaryTitle: string;
	successfulConfiguration: string;
	unknownError: string;
}

export const IDE_CONFIG_MESSAGES: IIdeConfigMessages = {
	confirmContinue: "Do you want to continue? This might overwrite existing files.",
	confirmSetup: "Would you like to set up ESLint and Prettier configurations for your code editors?",
	existingFilesFound: "Found existing IDE configuration files that might be modified:",
	failedConfiguration: "Failed configurations:",
	failedSetupError: "Failed to complete IDE setup",
	failedSetupSpinner: "Failed to setup IDE configuration",
	noIdesSelected: "No IDEs selected.",
	selectIdesPrompt: "Select your code editor(s):",
	settingUpSpinner: "Setting up IDE configurations...",
	setupCancelledByUser: "Setup cancelled by user.",
	setupCompleteSpinner: "IDE configuration completed successfully!",
	setupSummaryTitle: "IDE Setup Summary",
	successfulConfiguration: "Successfully created configurations:",
	unknownError: "Unknown error",
};
