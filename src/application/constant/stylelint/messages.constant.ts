interface IStylelintConfigMessages {
	confirmSetup: string;
	deleteFilesQuestion: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	generatedScriptsLabel: string;
	settingUpSpinner: string;
	setupCompleteSpinner: string;
	setupCompleteTitle: string;
	stylelintConfigCreated: string;
}

export const STYLELINT_CONFIG_MESSAGES: IStylelintConfigMessages = {
	confirmSetup: "Do you want to set up Stylelint for your project?",
	deleteFilesQuestion: "Do you want to delete them?",
	existingFilesAborted: "Existing Stylelint configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing Stylelint configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupError: "Failed to complete Stylelint setup",
	failedSetupSpinner: "Failed to setup Stylelint configuration",
	generatedScriptsLabel: "Generated scripts:",
	settingUpSpinner: "Setting up Stylelint configuration...",
	setupCompleteSpinner: "Stylelint configuration completed successfully!",
	setupCompleteTitle: "Stylelint Setup",
	stylelintConfigCreated: "Stylelint configuration has been created.",
};
