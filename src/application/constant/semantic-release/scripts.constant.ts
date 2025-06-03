interface ISemanticReleaseConfigScripts {
	release: ISemanticReleaseScript;
}

interface ISemanticReleaseScript {
	command: string;
	name: string;
}

export const SEMANTIC_RELEASE_CONFIG_SCRIPTS: ISemanticReleaseConfigScripts = {
	release: {
		command: "semantic-release",
		name: "release",
	},
};
