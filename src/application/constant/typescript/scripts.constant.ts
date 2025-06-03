interface ITypescriptConfigScripts {
	buildTypes: ITypescriptScript;
	lintTypes: ITypescriptScript;
}

interface ITypescriptScript {
	command: string;
	name: string;
}

export const TYPESCRIPT_CONFIG_SCRIPTS: ITypescriptConfigScripts = {
	buildTypes: {
		command: "tsc",
		name: "build:types",
	},
	lintTypes: {
		command: "tsc --noEmit",
		name: "lint:types",
	},
};
