import typescript from "@rollup/plugin-typescript";

export default {
	external: ["node:fs", "node:fs/promises", "node:path", "node:child_process", "node:util", "commander", "@clack/prompts", "chalk", "ora", "prompts", "cosmiconfig", "javascript-stringify", "yaml"],
	input: "src/index.ts",
	output: {
		banner: "#!/usr/bin/env node",
		dir: "bin",
		exports: "auto",
		format: "esm",
		preserveModules: true,
		preserveModulesRoot: "src",
		sourcemap: true,
	},
	plugins: [
		typescript({
			declaration: true,
			outDir: "bin",
			sourceMap: true,
			tsconfig: "./tsconfig.json",
		}),
	],
};
