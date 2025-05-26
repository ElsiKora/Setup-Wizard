interface IPrettierConfigScripts {
	format: IPrettierScript;
	formatFix: IPrettierScript;
}

interface IPrettierScript {
	command: string;
	name: string;
}

export const PRETTIER_CONFIG_SCRIPTS: IPrettierConfigScripts = {
	format: {
		command: "prettier --check .",
		name: "format",
	},
	formatFix: {
		command: "prettier --write .",
		name: "format:fix",
	},
};
