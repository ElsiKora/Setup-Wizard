interface IPrettierConfigMessages {
	confirmSetup: string;
	deleteFilesQuestion: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	generatedScriptsLabel: string;
	prettierConfigCreated: string;
	settingUpSpinner: string;
	setupCompleteSpinner: string;
	setupCompleteTitle: string;
}

export const PRETTIER_CONFIG_MESSAGES: IPrettierConfigMessages = {
	confirmSetup: "Do you want to set up Prettier for your project?",
	deleteFilesQuestion: "Do you want to delete them?",
	existingFilesAborted: "Existing Prettier configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing Prettier configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupError: "Failed to complete Prettier setup",
	failedSetupSpinner: "Failed to setup Prettier configuration",
	generatedScriptsLabel: "Generated scripts:",
	prettierConfigCreated: "Prettier configuration has been created.",
	settingUpSpinner: "Setting up Prettier configuration...",
	setupCompleteSpinner: "Prettier configuration completed successfully!",
	setupCompleteTitle: "Prettier Setup",
};
