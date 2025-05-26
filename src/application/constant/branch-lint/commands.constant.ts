export const BRANCH_LINT_CONFIG_COMMANDS: {
	createHuskyDirectory: string;
	initHusky: string;
	makePrePushExecutable: (filePath: string) => string;
} = {
	createHuskyDirectory: "mkdir -p .husky",
	initHusky: "npx husky",
	makePrePushExecutable: (filePath: string) => `chmod +x ${filePath}`,
};
