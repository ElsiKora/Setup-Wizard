export const COMMITLINT_CONFIG_HUSKY: {
	chmodCommand: string;
	initCommand: string;
	mkdirCommand: string;
} = {
	chmodCommand: "chmod +x .husky/commit-msg",
	initCommand: "npx husky",
	mkdirCommand: "mkdir -p .husky",
};
