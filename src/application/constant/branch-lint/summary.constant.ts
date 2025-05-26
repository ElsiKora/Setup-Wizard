export const BRANCH_LINT_CONFIG_SUMMARY: {
	confirmationErrorMessage: string;
	confirmationQuestion: string;
	deleteFilesQuestion: string;
	existingConfigWarning: string;
	existingFilesMessage: string;
	installErrorMessage: string;
	setupCompleteMessage: string;
	setupFailedMessage: string;
	setupStartMessage: string;
	title: string;
} = {
	confirmationErrorMessage: "Failed to get user confirmation",
	confirmationQuestion: "Do you want to set up Branch name linter for your project?",
	deleteFilesQuestion: "Do you want to delete them?",
	existingConfigWarning: "Existing branch-lint configuration files detected. Setup aborted.",
	existingFilesMessage: "Existing branch-lint configuration files detected:",
	installErrorMessage: "Failed to complete branch-lint setup",
	setupCompleteMessage: "Branch Lint configuration completed successfully!",
	setupFailedMessage: "Failed to setup Branch Lint configuration",
	setupStartMessage: "Setting up branch-lint configuration...",
	title: "Branch Lint Setup",
};
