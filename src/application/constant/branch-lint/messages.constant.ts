export const BRANCH_LINT_CONFIG_MESSAGES: {
	branchCreationNote: string;
	branchLintDescription: string;
	branchScriptDescription: string;
	configurationFilesLabel: string;
	generatedScriptsLabel: string;
	huskyHookSetupNote: string;
	packageJsonBranchScript: string;
} = {
	branchCreationNote: "Use 'npm run {script}' to create and switch to new branches using an interactive interface.",
	branchLintDescription: "Branch Lint configuration has been created.",
	branchScriptDescription: "(for create new branch)",
	configurationFilesLabel: "Configuration files:",
	generatedScriptsLabel: "Generated scripts:",
	huskyHookSetupNote: "Husky git hooks have been set up to validate your branch names.",
	packageJsonBranchScript: "package.json (branch script)",
};
