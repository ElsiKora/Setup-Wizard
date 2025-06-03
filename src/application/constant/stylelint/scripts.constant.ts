interface IStylelintConfigScripts {
	lintStyle: IStylelintScript;
	lintStyleFix: IStylelintScript;
}

interface IStylelintScript {
	command: string;
	name: string;
}

export const STYLELINT_CONFIG_SCRIPTS: IStylelintConfigScripts = {
	lintStyle: {
		command: 'stylelint "**/*.{css,scss}"',
		name: "lint:style",
	},
	lintStyleFix: {
		command: 'stylelint "**/*.{css,scss}" --fix',
		name: "lint:style:fix",
	},
};
