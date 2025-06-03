interface ILintStagedConfigMessages {
	configurationCompleted: string;
	configurationCreated: string;
	configurationFilesLabel: string;
	confirmSetup: string;
	deleteFilesQuestion: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	huskyHookSetup: string;
	packageJsonConfig: string;
	requiredPackagesLabel: string;
	selectedToolsLabel: string;
	selectFeaturesPrompt: string;
	settingUpSpinner: string;
	setupCompleteTitle: string;
}

export const LINT_STAGED_CONFIG_MESSAGES: ILintStagedConfigMessages = {
	configurationCompleted: "lint-staged configuration completed successfully!",
	configurationCreated: "lint-staged configuration has been created.",
	configurationFilesLabel: "Configuration files:",
	confirmSetup: "Do you want to set up lint-staged with Husky pre-commit hooks?",
	deleteFilesQuestion: "Do you want to delete them?",
	existingFilesAborted: "Existing lint-staged configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing lint-staged configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupError: "Failed to complete lint-staged setup",
	failedSetupSpinner: "Failed to setup lint-staged configuration",
	huskyHookSetup: "Husky git hooks have been set up to run lint-staged before commits.",
	packageJsonConfig: "package.json (lint-staged config)",
	requiredPackagesLabel: "Required packages (please ensure these are installed):",
	selectedToolsLabel: "Selected linting tools:",
	selectFeaturesPrompt: "Select which linting tools to include:",
	settingUpSpinner: "Setting up lint-staged configuration...",
	setupCompleteTitle: "lint-staged Setup",
};
