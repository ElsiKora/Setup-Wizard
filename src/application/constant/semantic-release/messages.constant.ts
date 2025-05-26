interface ISemanticReleaseConfigMessages {
	backmergeEnabledInfo: (mainBranch: string, developBranch: string) => string;
	branchNameRequired: string;
	branchNameSpacesError: string;
	changelogLocation: string;
	changelogLocationLabel: string;
	channelNameRequired: string;
	channelNameSpacesError: string;
	configurationCompleted: string;
	configurationCreated: string;
	configurationFilesLabel: string;
	confirmBackmerge: (mainBranch: string) => string;
	confirmPrereleaseChannel: string;
	confirmSetup: string;
	deleteFilesQuestion: string;
	developBranchPrompt: string;
	enterRepositoryUrl: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupConfiguration: string;
	failedSetupError: string;
	foundRepositoryUrl: (url: string) => string;
	generatedScriptsLabel: string;
	mainBranchPrompt: string;
	mainReleaseBranchLabel: string;
	noteEffectiveUsage: string;
	noteInstruction1: string;
	noteInstruction2: string;
	noteInstruction3: string;
	preReleaseBranchLabel: (branch: string, channel: string) => string;
	preReleaseBranchPrompt: string;
	preReleaseChannelPrompt: string;
	releaseBranchesLabel: string;
	releaseScriptDescription: string;
	repositoryUrlRequired: string;
	repositoryUrlStartError: string;
	settingUpSpinner: string;
	setupCompleteTitle: string;
}

export const SEMANTIC_RELEASE_CONFIG_MESSAGES: ISemanticReleaseConfigMessages = {
	backmergeEnabledInfo: (mainBranch: string, developBranch: string): string => `- Backmerge enabled: Changes from ${mainBranch} will be automatically merged to ${developBranch} after release`,
	branchNameRequired: "Branch name is required",
	branchNameSpacesError: "Branch name cannot contain spaces",
	changelogLocation: "CHANGELOG.md",
	changelogLocationLabel: "Changelog location:",
	channelNameRequired: "Channel name is required",
	channelNameSpacesError: "Channel name cannot contain spaces",
	configurationCompleted: "Semantic Release configuration completed successfully!",
	configurationCreated: "Semantic Release configuration has been created.",
	configurationFilesLabel: "Configuration files:",
	confirmBackmerge: (mainBranch: string): string => `Do you want to enable automatic backmerge from ${mainBranch} to development branch after release?`,
	confirmPrereleaseChannel: "Do you want to configure a pre-release channel for development branches?",
	confirmSetup: "Do you want to set up Semantic Release for automated versioning and publishing?",
	deleteFilesQuestion: "Do you want to delete them?",
	developBranchPrompt: "Enter the name of your development branch for backmerge:",
	enterRepositoryUrl: "Enter your repository URL (e.g., https://github.com/username/repo):",
	existingFilesAborted: "Existing Semantic Release configuration files detected. Setup aborted.",
	existingFilesDetected: "Existing Semantic Release configuration files detected:",
	failedConfirmation: "Failed to get user confirmation",
	failedSetupConfiguration: "Failed to setup Semantic Release configuration",
	failedSetupError: "Failed to complete Semantic Release setup",
	foundRepositoryUrl: (url: string): string => `Found repository URL: ${url}\nIs this correct?`,
	generatedScriptsLabel: "Generated scripts:",
	mainBranchPrompt: "Enter the name of your main release branch:",
	mainReleaseBranchLabel: "- Main release branch:",
	noteEffectiveUsage: "Note: To use Semantic Release effectively, you should:",
	noteInstruction1: "1. Configure CI/CD in your repository",
	noteInstruction2: "2. Set up required access tokens (GITHUB_TOKEN, NPM_TOKEN)",
	noteInstruction3: "3. Use conventional commits (works with the Commitlint setup)",
	preReleaseBranchLabel: (branch: string, channel: string): string => `- Pre-release branch: ${branch} (channel: ${channel})`,
	preReleaseBranchPrompt: "Enter the name of your pre-release branch:",
	preReleaseChannelPrompt: "Enter the pre-release channel name (e.g., beta, alpha, next):",
	releaseBranchesLabel: "Release branches:",
	releaseScriptDescription: "- npm run release",
	repositoryUrlRequired: "Repository URL is required",
	repositoryUrlStartError: "Repository URL must start with 'https://' or 'http://'",
	settingUpSpinner: "Setting up Semantic Release configuration...",
	setupCompleteTitle: "Semantic Release Setup",
};
