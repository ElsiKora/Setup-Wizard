export const GITIGNORE_CONFIG_SUMMARY: {
	description: string;
	failedConfig: string;
	fileCreated: string;
	fileFailed: (error: string) => string;
	successConfig: string;
	title: string;
} = {
	description: ["", "The .gitignore configuration includes:", "- Build outputs and dependencies", "- Common IDEs and editors", "- Testing and coverage files", "- Environment and local config files", "- System and temporary files", "- Framework-specific files", "- Lock files", "", "You can customize it further by editing .gitignore"].join("\n"),
	failedConfig: "Failed configuration:",
	fileCreated: "✓ .gitignore file",
	fileFailed: (error: string): string => `✗ .gitignore - ${error}`,
	successConfig: "Successfully created configuration:",
	title: "Gitignore Setup Summary",
};
