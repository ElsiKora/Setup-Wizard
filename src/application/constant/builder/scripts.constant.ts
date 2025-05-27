interface IBuilderConfigScripts {
	build: IBuilderScript;
	buildWatch: IBuilderScript;
	prebuild: IBuilderScript;
}

interface IBuilderScript {
	command: string;
	name: string;
}

export const BUILDER_CONFIG_SCRIPTS: IBuilderConfigScripts = {
	build: {
		command: "npm run prebuild && rollup -c",
		name: "build",
	},
	buildWatch: {
		command: "rollup -c -w",
		name: "build:watch",
	},
	prebuild: {
		command: "rimraf dist",
		name: "prebuild",
	},
};
