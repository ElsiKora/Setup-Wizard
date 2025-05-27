/**
 * Core dependencies required for Rollup build setup.
 */
export const BUILDER_CONFIG_CORE_DEPENDENCIES: Readonly<Array<string>> = ["rollup", "@rollup/plugin-node-resolve", "@rollup/plugin-commonjs", "@rollup/plugin-typescript", "@rollup/plugin-terser", "rimraf"] as const;

/**
 * Optional dependencies for advanced Rollup features.
 */
export const BUILDER_CONFIG_OPTIONAL_DEPENDENCIES: Readonly<{ packageJsonGeneration: string; pathAlias: string }> = {
	packageJsonGeneration: "rollup-plugin-generate-package-json",
	pathAlias: "rollup-plugin-dts-path-alias",
} as const;
