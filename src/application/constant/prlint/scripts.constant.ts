interface IPrlintConfigScript {
	command: string;
	name: string;
}

interface IPrlintConfigScripts {
	context: IPrlintConfigScript;
	create: IPrlintConfigScript;
	fix: IPrlintConfigScript;
	generate: IPrlintConfigScript;
	lint: IPrlintConfigScript;
}

export const PRLINT_CONFIG_SCRIPTS: IPrlintConfigScripts = {
	context: {
		command: "prlint context",
		name: "prlint:context",
	},
	create: {
		command: "prlint create",
		name: "prlint:create",
	},
	fix: {
		command: "prlint fix",
		name: "prlint:fix",
	},
	generate: {
		command: "prlint generate",
		name: "prlint:generate",
	},
	lint: {
		command: "prlint lint",
		name: "prlint",
	},
};
