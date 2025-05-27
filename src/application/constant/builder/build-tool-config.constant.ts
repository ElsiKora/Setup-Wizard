import type { IBuildToolConfig } from "../../../domain/interface/build-tool-config.interface";

import path from "node:path";

import { EBuildTool } from "../../../domain/enum/build-tool.enum";

/**
 * Configuration for different build tools.
 * Provides tool-specific settings and dependencies.
 */
export const BUILD_TOOL_CONFIG: Record<EBuildTool, IBuildToolConfig> = {
	[EBuildTool.ESBUILD]: {
		canSupportCliApps: true,
		configFileName: "esbuild.config.js",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isMinifyEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const { entryPoint, formats, isCliApp, isMinifyEnabled, isSourceMapsEnabled, isTypeScript, outputDirectory }: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isMinifyEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string } = options;

			// esbuild uses a JavaScript config file
			const format: string = formats[0]; // esbuild builds one format at a time

			let outExtension: string;

			if (format === "esm") {
				outExtension = ".mjs";
			} else if (format === "cjs") {
				outExtension = ".cjs";
			} else {
				outExtension = ".js";
			}

			// Extract nested ternary for format
			let buildFormat: string;

			if (format === "esm") {
				buildFormat = "esm";
			} else if (format === "cjs") {
				buildFormat = "cjs";
			} else {
				buildFormat = "iife";
			}

			return `import { build } from "esbuild";
import { resolve } from "path";

const args = process.argv.slice(2);
const isWatch = args.includes("--watch");

const buildOptions = {
	entryPoints: ["${entryPoint}"],
	bundle: true,
	platform: "${isCliApp ? "node" : "neutral"}",
	format: "${buildFormat}",
	outfile: "${outputDirectory}/${path.basename(entryPoint, path.extname(entryPoint))}${outExtension}",
	sourcemap: ${isSourceMapsEnabled},
	minify: ${isMinifyEnabled},${
		isCliApp
			? `
	banner: {
		js: "#!/usr/bin/env node",
	},`
			: ""
	}${
		isTypeScript
			? `
	tsconfig: "./tsconfig.json",`
			: ""
	}
	external: ${isCliApp ? '["node:*"]' : "[]"},
};

if (isWatch) {
	const context = await build({ ...buildOptions, metafile: true });
	await context.watch();
	console.log("Watching for changes...");
} else {
	await build(buildOptions);
	console.log("Build complete!");
}
`;
		},
		coreDependencies: ["esbuild"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "An extremely fast JavaScript bundler",
		name: "esbuild",
		optionalDependencies: {
			minify: [], // Built-in
			typescript: ["typescript"],
		},
		scripts: {
			build: "node esbuild.config.js",
			dev: "node esbuild.config.js --watch",
			watch: "node esbuild.config.js --watch",
		},
		supportedFormats: ["esm", "cjs", "iife"],
	},
	[EBuildTool.PARCEL]: {
		canSupportCliApps: true,
		configFileName: ".parcelrc",
		configGenerator: (_options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			// Parcel uses .parcelrc for configuration
			return `{
	"extends": "@parcel/config-default",
	"transformers": {
		"*.{js,jsx,ts,tsx}": ["@parcel/transformer-js"]
	}
}
`;
		},
		coreDependencies: ["parcel"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "The zero configuration build tool",
		name: "Parcel",
		optionalDependencies: {
			minify: [], // Built-in
			typescript: ["typescript"],
		},
		scripts: {
			build: "parcel build",
			dev: "parcel watch",
			watch: "parcel watch",
		},
		supportedFormats: ["esm", "cjs"],
	},
	[EBuildTool.ROLLUP]: {
		canSupportCliApps: true,
		configFileName: "rollup.config.js",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const {
				entryPoint,
				formats,
				isCliApp,
				isCommonjsEnabled,
				isDecoratorsEnabled,
				isMinifyEnabled,
				isPackageJsonGenerationEnabled,
				isPathAliasEnabled,
				isSourceMapsEnabled,
				isTypeScript,
				outputDirectory,
			}: {
				entryPoint: string;
				formats: Array<string>;
				isCliApp: boolean;
				isCommonjsEnabled: boolean;
				isDecoratorsEnabled: boolean;
				isMinifyEnabled: boolean;
				isPackageJsonGenerationEnabled: boolean;
				isPathAliasEnabled: boolean;
				isSourceMapsEnabled: boolean;
				isTypeScript: boolean;
				outputDirectory: string;
			} = options;

			const imports: Array<string> = [];

			// Base imports
			imports.push("import resolve from '@rollup/plugin-node-resolve';");

			// CommonJS plugin (only if enabled)
			if (isCommonjsEnabled) {
				imports.push("import commonjs from '@rollup/plugin-commonjs';");
			}

			// TypeScript plugin
			if (isTypeScript) {
				imports.push("import typescript from '@rollup/plugin-typescript';");
			}

			// Optional plugins
			if (isPathAliasEnabled) {
				imports.push("import dtsPathAlias from 'rollup-plugin-dts-path-alias';");
			}

			if (isMinifyEnabled) {
				imports.push("import terser from '@rollup/plugin-terser';");
			}

			if (isPackageJsonGenerationEnabled && !isCliApp) {
				imports.push("import generatePackageJson from 'rollup-plugin-generate-package-json';");
			}

			// Generate configurations for each format
			if (isCliApp || formats.length === 1) {
				// Single configuration
				const format: string = formats[0];
				const plugins: Array<string> = [];

				// Resolve plugin with decorators support
				if (isDecoratorsEnabled) {
					plugins.push(`resolve({
				include: ["node_modules/tslib/**"],
			})`);
				} else {
					plugins.push("resolve()");
				}

				if (isCommonjsEnabled) {
					plugins.push("commonjs()");
				}

				if (isPathAliasEnabled) {
					plugins.push("dtsPathAlias()");
				}

				if (isTypeScript) {
					const tsconfigPath: string = isCliApp ? "./tsconfig.json" : "./tsconfig.build.json";

					plugins.push(`typescript({
				declaration: true,
				outDir: "${outputDirectory}",
				sourceMap: ${isSourceMapsEnabled},
				tsconfig: "${tsconfigPath}",
			})`);
				}

				if (isMinifyEnabled) {
					plugins.push("terser()");
				}

				const outputOptions: Array<string> = [];

				if (isCliApp) {
					outputOptions.push(`banner: "#!/usr/bin/env node"`);
				}

				// Determine output file/dir
				const baseName: string = path.basename(entryPoint, path.extname(entryPoint));

				if (isCliApp) {
					outputOptions.push(`dir: "${outputDirectory}"`, `preserveModules: true`, `preserveModulesRoot: "src"`);
				} else {
					let extension: string;

					if (format === "esm") {
						extension = "mjs";
					} else if (format === "cjs") {
						extension = "cjs";
					} else {
						extension = "js";
					}

					outputOptions.push(`file: "${outputDirectory}/${baseName}.${extension}"`);
				}

				outputOptions.push(`format: "${format === "cjs" ? "cjs" : format}"`);

				if (format === "cjs") {
					outputOptions.push(`exports: "named"`);
				} else if (isCliApp && format === "esm") {
					outputOptions.push(`exports: "auto"`);
				}

				outputOptions.push(`sourcemap: ${isSourceMapsEnabled}`);

				return `${imports.join("\n")}

export default {
	${isCliApp ? 'external: ["node:fs", "node:fs/promises", "node:path", "node:child_process", "node:util"],\n\t' : ""}input: "${entryPoint}",
	output: {
		${outputOptions.join(",\n\t\t")}
	},
	plugins: [
		${plugins.join(",\n\t\t")}
	],
};
`;
			} else {
				// Multiple configurations for different formats
				const configs: Array<string> = [];

				for (const format of formats) {
					const outputDirectoryFormat: string = `${outputDirectory}/${format}`;
					const plugins: Array<string> = [];

					// Resolve plugin with decorators support
					if (isDecoratorsEnabled) {
						plugins.push(`resolve({
				include: ["node_modules/tslib/**"],
			})`);
					} else {
						plugins.push("resolve()");
					}

					if (isCommonjsEnabled) {
						plugins.push("commonjs()");
					}

					if (isPathAliasEnabled) {
						plugins.push("dtsPathAlias()");
					}

					if (isTypeScript) {
						plugins.push(`typescript({
				declaration: true,
				declarationDir: "${outputDirectoryFormat}",
				outDir: "${outputDirectoryFormat}",
				sourceMap: ${isSourceMapsEnabled},
				tsconfig: "./tsconfig.build.json",
			})`);
					}

					if (isMinifyEnabled) {
						plugins.push("terser()");
					}

					if (isPackageJsonGenerationEnabled) {
						const packageType: string = format === "esm" ? "module" : "commonjs";

						plugins.push(`generatePackageJson({
				baseContents: { type: "${packageType}" },
				outputFolder: "${outputDirectoryFormat}",
			})`);
					}

					const entryFileNamesFunction: string = isDecoratorsEnabled
						? `entryFileNames: (chunkInfo) => {
				if (chunkInfo.name.includes("node_modules")) {
					return chunkInfo.name.replace("node_modules", "external") + ".js";
				}

				return "[name].js";
			},`
						: "";

					configs.push(`{
	input: "${entryPoint}",
	output: {
		dir: "${outputDirectoryFormat}",
		${entryFileNamesFunction}
		${format === "cjs" ? 'exports: "named",\n\t\t\t' : ""}format: "${format}",
		preserveModules: true,
		preserveModulesRoot: "src",
		sourcemap: ${isSourceMapsEnabled},
	},
	plugins: [
		${plugins.join(",\n\t\t\t")}
	],
	}`);
				}

				return `${imports.join("\n")}

export default [
	${configs.join(",\n\t")}
];
`;
			}
		},
		coreDependencies: ["rollup"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "Next-generation ES module bundler",
		name: "Rollup",
		optionalDependencies: {
			decorators: ["tslib"],
			minify: ["@rollup/plugin-terser"],
			pathAlias: ["rollup-plugin-dts-path-alias"],
			typescript: ["@rollup/plugin-typescript", "tslib"],
		},
		scripts: {
			build: "rollup -c",
			dev: "rollup -c -w",
			watch: "rollup -c -w",
		},
		supportedFormats: ["esm", "cjs", "umd", "iife"],
	},
	[EBuildTool.SWC]: {
		canSupportCliApps: true,
		configFileName: ".swcrc",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const { isDecoratorsEnabled, isMinifyEnabled, isSourceMapsEnabled }: { isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isSourceMapsEnabled: boolean } = options;

			// SWC uses .swcrc for configuration
			return `{
	"$schema": "https://json.schemastore.org/swcrc",
	"jsc": {
		"parser": {
			"syntax": "typescript",
			"tsx": true,
			"decorators": ${isDecoratorsEnabled}
		},
		"target": "es2022",
		"loose": false,
		"minify": ${
			isMinifyEnabled
				? `{
			"compress": true,
			"mangle": true
		}`
				: "null"
		}
	},
	"module": {
		"type": "es6"
	},
	"minify": ${isMinifyEnabled},
	"sourceMaps": ${isSourceMapsEnabled}
}
`;
		},
		coreDependencies: ["@swc/core", "@swc/cli"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "Super-fast TypeScript/JavaScript compiler",
		name: "SWC",
		optionalDependencies: {
			minify: [], // Built-in
			typescript: [], // Built-in
		},
		scripts: {
			build: "swc src -d dist",
			dev: "swc src -d dist --watch",
			watch: "swc src -d dist --watch",
		},
		supportedFormats: ["esm", "cjs"],
	},
	[EBuildTool.TURBOPACK]: {
		canSupportCliApps: true,
		configFileName: "turbopack.config.js",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const { entryPoint, isMinifyEnabled, isSourceMapsEnabled, outputDirectory }: { entryPoint: string; isMinifyEnabled: boolean; isSourceMapsEnabled: boolean; outputDirectory: string } = options;

			// Turbopack uses a JavaScript config
			return `export default {
	entry: {
		main: "${entryPoint}",
	},
	output: {
		path: "${outputDirectory}",
		filename: "[name].js",
	},
	optimization: {
		minimize: ${isMinifyEnabled},
	},
	devtool: ${isSourceMapsEnabled ? '"source-map"' : "false"},
};
`;
		},
		coreDependencies: ["@vercel/turbopack"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "Incremental bundler optimized for JavaScript and TypeScript",
		name: "Turbopack",
		optionalDependencies: {
			minify: [],
			typescript: ["typescript"],
		},
		scripts: {
			build: "turbopack build",
			dev: "turbopack dev",
			watch: "turbopack dev",
		},
		supportedFormats: ["esm", "cjs"],
	},
	[EBuildTool.VITE]: {
		canSupportCliApps: false,
		configFileName: "vite.config.js",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const { entryPoint, formats, isMinifyEnabled, isPathAliasEnabled, isSourceMapsEnabled, isTypeScript, outputDirectory }: { entryPoint: string; formats: Array<string>; isMinifyEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string } = options;

			const plugins: Array<string> = [];

			if (isPathAliasEnabled && isTypeScript) {
				plugins.push("viteTsconfigPaths()");
			}

			const formatMap: Record<string, string> = {
				esm: "es",
				umd: "umd",
			};

			return `import { defineConfig } from "vite";
import { resolve } from "path";${
				isPathAliasEnabled && isTypeScript
					? `
import viteTsconfigPaths from "vite-tsconfig-paths";`
					: ""
			}

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "${entryPoint}"),
			name: "MyLib",
			formats: ${JSON.stringify(formats.map((f: string) => formatMap[f] || f))},
			fileName: (format) => \`index.\${format}.js\`,
		},
		outDir: "${outputDirectory}",
		sourcemap: ${isSourceMapsEnabled},
		minify: ${isMinifyEnabled ? '"esbuild"' : "false"},
		rollupOptions: {
			external: [],
			output: {
				globals: {},
			},
		},
	},${
		plugins.length > 0
			? `
	plugins: [${plugins.join(", ")}],`
			: ""
	}
});
`;
		},
		coreDependencies: ["vite"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./dist",
		description: "Next generation frontend tooling",
		name: "Vite",
		optionalDependencies: {
			minify: [], // Built-in
			pathAlias: ["vite-tsconfig-paths"],
			typescript: ["@vitejs/plugin-vue", "typescript"],
		},
		scripts: {
			build: "vite build",
			dev: "vite",
			watch: "vite build --watch",
		},
		supportedFormats: ["es", "umd"],
	},
	[EBuildTool.WEBPACK]: {
		canSupportCliApps: true,
		configFileName: "webpack.config.js",
		configGenerator: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => {
			const { entryPoint, formats, isCliApp, isMinifyEnabled, isPathAliasEnabled, isSourceMapsEnabled, isTypeScript, outputDirectory }: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isMinifyEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string } = options;

			const rules: Array<string> = [];
			const plugins: Array<string> = [];
			const imports: Array<string> = ["const path = require('path');"];

			if (isTypeScript) {
				rules.push(`{
				test: /\\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}`);
			}

			if (isMinifyEnabled) {
				imports.push("const TerserPlugin = require('terser-webpack-plugin');");
			}

			if (isPathAliasEnabled && isTypeScript) {
				imports.push("const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');");
			}

			// Webpack output format mapping
			const firstFormat: string = formats[0];

			let libraryType: string;

			if (firstFormat === "commonjs") {
				libraryType = "commonjs2";
			} else if (firstFormat === "module") {
				libraryType = "module";
			} else {
				libraryType = "umd";
			}

			return `${imports.join("\n")}

module.exports = {
	entry: '${entryPoint}',
	mode: 'production',
	devtool: ${isSourceMapsEnabled ? "'source-map'" : "false"},${
		isCliApp
			? `
	target: 'node',`
			: ""
	}
	module: {
		rules: [${
			rules.length > 0
				? `
			${rules.join(",\n\t\t\t")}`
				: ""
		}
		],
	},${((): string => {
		if (isPathAliasEnabled && isTypeScript) {
			return `
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		plugins: [new TsconfigPathsPlugin()],
	},`;
		} else if (isTypeScript) {
			return `
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},`;
		} else {
			return "";
		}
	})()}
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, '${outputDirectory}'),
		library: {
			type: '${libraryType}',
		},${
			isCliApp
				? `
		hashbang: true,`
				: ""
		}
	},${
		isMinifyEnabled
			? `
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},`
			: ""
	}${
		plugins.length > 0
			? `
	plugins: [
		${plugins.join(",\n\t\t")}
	],`
			: ""
	}
};
`;
		},
		coreDependencies: ["webpack", "webpack-cli"],
		defaultOutputDir: "./dist",
		defaultOutputDirCli: "./bin",
		description: "Static module bundler for modern JavaScript applications",
		name: "Webpack",
		optionalDependencies: {
			minify: ["terser-webpack-plugin"],
			pathAlias: ["tsconfig-paths-webpack-plugin"],
			typescript: ["ts-loader", "typescript"],
		},
		scripts: {
			build: "webpack --mode production",
			dev: "webpack --mode development --watch",
			watch: "webpack --mode development --watch",
		},
		supportedFormats: ["commonjs", "module", "umd"],
	},
};
