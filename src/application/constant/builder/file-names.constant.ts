/**
 * List of possible builder configuration file names to check for existing setup.
 */
export const BUILDER_CONFIG_FILE_NAMES: Readonly<Array<string>> = ["rollup.config.js", "rollup.config.mjs", "rollup.config.cjs", "rollup.config.ts", "webpack.config.js", "webpack.config.ts", "vite.config.js", "vite.config.ts", "esbuild.config.js", "esbuild.config.ts"] as const;
