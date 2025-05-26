interface ICommitlintConfigMessages {
	commitizenDescription: string;
	commitizenPath: string;
	configurationCompleted: string;
	configurationCreated: string;
	configurationFilesLabel: string;
	confirmSetup: string;
	deleteFilesQuestion: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupConfiguration: string;
	failedSetupError: string;
	generatedScriptsLabel: string;
	huskyGitHooksInfo: string;
	settingUpSpinner: string;
	setupCompleteTitle: string;
}

export const COMMITLINT_CONFIG_MESSAGES: ICommitlintConfigMessages = {
	commitizenDescription: "Use 'npm run commit' to create commits using the interactive commitizen interface.",
	commitizenPath: "@elsikora/commitizen-plugin-commitlint-ai",
	configurationCompleted: "Commitlint and Commitizen configuration completed successfully!",
	configurationCreated: "Commitlint and Commitizen configuration has been created.",
	configurationFilesLabel: "Configuration files:",
	confirmSetup: "Do you want to set up Commitlint and Commitizen for your project?",
	deleteFilesQuestion: "Do you want to delete them?",
	existingFilesAborted: "Existing Commitlint/Commitizen configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing Commitlint/Commitizen configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupConfiguration: "Failed to setup Commitlint and Commitizen configuration",
	failedSetupError: "Failed to complete Commitlint setup",
	generatedScriptsLabel: "Generated scripts:",
	huskyGitHooksInfo: "Husky git hooks have been set up to validate your commits.",
	settingUpSpinner: "Setting up Commitlint and Commitizen configuration...",
	setupCompleteTitle: "Commitlint Setup",
};
