/**
 * Enum representing available build tools.
 * Used to determine which bundler to configure.
 */
export enum EBuildTool {
	/** esbuild bundler */
	ESBUILD = "esbuild",

	/** Parcel bundler */
	PARCEL = "parcel",

	/** Rollup bundler */
	ROLLUP = "rollup",

	/** SWC bundler */
	SWC = "swc",

	/** Turbopack bundler */
	TURBOPACK = "turbopack",

	/** Vite build tool */
	VITE = "vite",

	/** Webpack bundler */
	WEBPACK = "webpack",
}
