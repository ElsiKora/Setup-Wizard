interface ICommitlintConfigMessages {
	branchLintMissingBehaviorPrompt: string;
	branchLintMissingBehaviorPromptError: string;
	commitCommandPrompt: string;
	commitCommandPromptError: string;
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
	ticketEnabledPrompt: string;
	ticketEnabledPromptError: string;
	ticketNormalizationPrompt: string;
	ticketNormalizationPromptError: string;
	ticketPatternFlagsPrompt: string;
	ticketPatternFlagsPromptError: string;
	ticketPatternPrompt: string;
	ticketPatternPromptError: string;
	ticketSourcePrompt: string;
	ticketSourcePromptError: string;
}

export const COMMITLINT_CONFIG_MESSAGES: ICommitlintConfigMessages = {
	branchLintMissingBehaviorPrompt: "When branch-lint config is missing, what should happen?",
	branchLintMissingBehaviorPromptError: "Failed to select missing branch-lint behavior",
	commitCommandPrompt: "Do you want Setup-Wizard to add 'npm run commit' command (Commitizen)?",
	commitCommandPromptError: "Failed to get commit command confirmation",
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
	ticketEnabledPrompt: "Enable automatic ticket extraction for commit footer Refs?",
	ticketEnabledPromptError: "Failed to get ticket integration confirmation",
	ticketNormalizationPrompt: "Select ticket normalization mode:",
	ticketNormalizationPromptError: "Failed to select ticket normalization mode",
	ticketPatternFlagsPrompt: "Enter ticket regex flags (used for pattern/auto fallback):",
	ticketPatternFlagsPromptError: "Failed to read ticket regex flags",
	ticketPatternPrompt: "Enter ticket regex pattern (used for pattern/auto fallback):",
	ticketPatternPromptError: "Failed to read ticket regex pattern",
	ticketSourcePrompt: "Select ticket source strategy:",
	ticketSourcePromptError: "Failed to select ticket source strategy",
};
