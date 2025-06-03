interface IBuilderConfigSummary {
	entryPointDefault: string;
	formatsDefault: Array<string>;
	outputDirDefault: string;
	outputDirDefaultCli: string;
}

export const BUILDER_CONFIG_SUMMARY: IBuilderConfigSummary = {
	entryPointDefault: "./src/index.ts",
	formatsDefault: ["esm", "cjs"],
	outputDirDefault: "./dist",
	outputDirDefaultCli: "./bin",
};
