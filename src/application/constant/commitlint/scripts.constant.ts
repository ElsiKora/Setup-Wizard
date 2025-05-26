interface ICommitlintConfigScripts {
	commit: ICommitlintScript;
	prepare: ICommitlintScript;
}

interface ICommitlintScript {
	command: string;
	name: string;
}

export const COMMITLINT_CONFIG_SCRIPTS: ICommitlintConfigScripts = {
	commit: {
		command: "cz",
		name: "commit",
	},
	prepare: {
		command: "husky",
		name: "prepare",
	},
};
