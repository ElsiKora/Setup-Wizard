import { EBuildTool } from "../../../domain/enum/build-tool.enum";

interface IBuilderConfigScripts {
	build: IBuilderScript;
	buildWatch: IBuilderScript;
	prebuild: IBuilderScript;
}

interface IBuilderScript {
	command: (tool: EBuildTool, outputDirectory?: string) => string;
	name: string;
}

export const BUILDER_CONFIG_SCRIPTS: IBuilderConfigScripts = {
	build: {
		command: (tool: EBuildTool): string => {
			switch (tool) {
				case EBuildTool.ESBUILD: {
					return "npm run prebuild && node esbuild.config.js";
				}

				case EBuildTool.PARCEL: {
					return "npm run prebuild && parcel build";
				}

				case EBuildTool.ROLLUP: {
					return "npm run prebuild && rollup -c";
				}

				case EBuildTool.SWC: {
					return "npm run prebuild && swc src -d dist";
				}

				case EBuildTool.TURBOPACK: {
					return "npm run prebuild && turbopack build";
				}

				case EBuildTool.VITE: {
					return "npm run prebuild && vite build";
				}

				case EBuildTool.WEBPACK: {
					return "npm run prebuild && webpack";
				}

				default: {
					return "npm run prebuild && rollup -c";
				}
			}
		},
		name: "build",
	},
	buildWatch: {
		command: (tool: EBuildTool): string => {
			switch (tool) {
				case EBuildTool.ESBUILD: {
					return "node esbuild.config.js --watch";
				}

				case EBuildTool.PARCEL: {
					return "parcel watch";
				}

				case EBuildTool.ROLLUP: {
					return "rollup -c -w";
				}

				case EBuildTool.SWC: {
					return "swc src -d dist --watch";
				}

				case EBuildTool.TURBOPACK: {
					return "turbopack dev";
				}

				case EBuildTool.VITE: {
					return "vite build --watch";
				}

				case EBuildTool.WEBPACK: {
					return "webpack --watch";
				}

				default: {
					return "rollup -c -w";
				}
			}
		},
		name: "build:watch",
	},
	prebuild: {
		command: (_tool: EBuildTool, outputDirectory: string = "dist"): string => `rimraf ${outputDirectory}`,
		name: "prebuild",
	},
};
