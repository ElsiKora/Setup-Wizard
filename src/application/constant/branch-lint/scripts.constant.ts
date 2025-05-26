export const BRANCH_LINT_CONFIG_SCRIPTS: {
	branch: {
		command: string;
		name: string;
	};
	prepare: {
		command: string;
		name: string;
	};
} = {
	branch: {
		command: "npx @elsikora/git-branch-lint -b",
		name: "branch",
	},
	prepare: {
		command: "husky",
		name: "prepare",
	},
};
