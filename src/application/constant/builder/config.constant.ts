import path from "node:path";

interface IBuilderConfig {
	buildTsconfigTemplate: () => string;
	template: (entryPoint: string, outputDirectory: string, formats: Array<string>, isSourceMapsEnabled: boolean, isMinifyEnabled: boolean, isCliApp: boolean, isPathAliasEnabled: boolean, isDecoratorsEnabled: boolean, isPackageJsonGenerationEnabled: boolean, isCommonjsEnabled: boolean) => string;
}

export const BUILDER_CONFIG: IBuilderConfig = {
	buildTsconfigTemplate: (): string => {
		return `{
	"extends": "./tsconfig.json",
	"exclude": ["node_modules", "test", "dist", "**/*spec.ts", "**/*.test.ts"]
}
`;
	},

	template: (entryPoint: string, outputDirectory: string, formats: Array<string>, isSourceMapsEnabled: boolean, isMinifyEnabled: boolean, isCliApp: boolean, isPathAliasEnabled: boolean, isDecoratorsEnabled: boolean, isPackageJsonGenerationEnabled: boolean, isCommonjsEnabled: boolean): string => {
		const imports: Array<string> = [];
		const isTypeScript: boolean = entryPoint.endsWith(".ts") || entryPoint.endsWith(".tsx");

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
};
