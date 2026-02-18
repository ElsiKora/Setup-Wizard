interface IPrlintConfigMessages {
	addScriptsPrompt: string;
	addScriptsPromptError: string;
	branchLintMissingBehaviorPrompt: string;
	branchLintMissingBehaviorPromptError: string;
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
	forbiddenPlaceholdersPrompt: string;
	forbiddenPlaceholdersPromptError: string;
	generatedScriptsLabel: string;
	githubBaseBranchPrompt: string;
	githubBaseBranchPromptError: string;
	githubDraftPrompt: string;
	githubDraftPromptError: string;
	githubProhibitedBranchesPrompt: string;
	githubProhibitedBranchesPromptError: string;
	lintRequiredSectionsPrompt: string;
	lintRequiredSectionsPromptError: string;
	lintTitlePatternPrompt: string;
	lintTitlePatternPromptError: string;
	modelPrompt: string;
	modelPromptError: string;
	providerPrompt: string;
	providerPromptError: string;
	retriesPrompt: string;
	retriesPromptError: string;
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
	validationRetriesPrompt: string;
	validationRetriesPromptError: string;
}

export const PRLINT_CONFIG_MESSAGES: IPrlintConfigMessages = {
	addScriptsPrompt: "Do you want Setup-Wizard to add PRLint npm scripts?",
	addScriptsPromptError: "Failed to get PRLint scripts confirmation",
	branchLintMissingBehaviorPrompt: "When branch-lint config is missing, what should happen?",
	branchLintMissingBehaviorPromptError: "Failed to select missing branch-lint behavior",
	configurationCompleted: "PRLint configuration completed successfully!",
	configurationCreated: "PRLint configuration has been created.",
	configurationFilesLabel: "Configuration files:",
	confirmSetup: "Do you want to set up PRLint for your project?",
	deleteFilesQuestion: "Do you want to delete and recreate PRLint configuration?",
	existingFilesAborted: "Existing PRLint configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing PRLint configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupConfiguration: "Failed to setup PRLint configuration",
	failedSetupError: "Failed to complete PRLint setup",
	forbiddenPlaceholdersPrompt: "Forbidden placeholders (comma separated):",
	forbiddenPlaceholdersPromptError: "Failed to read forbidden placeholders",
	generatedScriptsLabel: "Generated scripts:",
	githubBaseBranchPrompt: "GitHub base branch for PR creation:",
	githubBaseBranchPromptError: "Failed to read GitHub base branch",
	githubDraftPrompt: "Create PRs as draft by default?",
	githubDraftPromptError: "Failed to get GitHub draft confirmation",
	githubProhibitedBranchesPrompt: "Prohibited branches (comma separated):",
	githubProhibitedBranchesPromptError: "Failed to read prohibited branches",
	lintRequiredSectionsPrompt: "Required PR body sections (comma separated):",
	lintRequiredSectionsPromptError: "Failed to read required sections",
	lintTitlePatternPrompt: "PR title regex pattern:",
	lintTitlePatternPromptError: "Failed to read PR title pattern",
	modelPrompt: "Generation model:",
	modelPromptError: "Failed to read generation model",
	providerPrompt: "Select generation provider:",
	providerPromptError: "Failed to select generation provider",
	retriesPrompt: "Generation retries (1-10):",
	retriesPromptError: "Failed to read generation retries",
	settingUpSpinner: "Setting up PRLint configuration...",
	setupCompleteTitle: "PRLint Setup",
	ticketEnabledPrompt: "Enable ticket extraction for branch correlation?",
	ticketEnabledPromptError: "Failed to get ticket integration confirmation",
	ticketNormalizationPrompt: "Select ticket normalization mode:",
	ticketNormalizationPromptError: "Failed to select ticket normalization mode",
	ticketPatternFlagsPrompt: "Ticket regex flags:",
	ticketPatternFlagsPromptError: "Failed to read ticket regex flags",
	ticketPatternPrompt: "Ticket regex pattern:",
	ticketPatternPromptError: "Failed to read ticket regex pattern",
	ticketSourcePrompt: "Select ticket source strategy:",
	ticketSourcePromptError: "Failed to select ticket source strategy",
	validationRetriesPrompt: "Validation retries (1-10):",
	validationRetriesPromptError: "Failed to read validation retries",
};
