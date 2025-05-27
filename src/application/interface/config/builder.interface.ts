/**
 * Configuration interface for the Builder module.
 * Stores user preferences for build tool setup.
 */
export interface IConfigBuilder {
	/** Entry point file for the build */
	entryPoint: string;

	/** Output formats to generate (e.g., ['esm', 'cjs']) */
	formats: Array<string>;

	/** Whether to create a separate tsconfig.build.json */
	isBuildTsconfigEnabled: boolean;

	/** Whether to clean output directory before build */
	isCleanEnabled: boolean;

	/** Whether this is a CLI application */
	isCliApp: boolean;

	/** Whether to include CommonJS plugin for older npm packages */
	isCommonjsEnabled: boolean;

	/** Whether decorators are used (requires tslib resolution) */
	isDecoratorsEnabled: boolean;

	/** Whether to minify the output */
	isMinifyEnabled: boolean;

	/** Whether to generate package.json in output directories */
	isPackageJsonGenerationEnabled: boolean;

	/** Whether to use path aliases with dts-path-alias plugin */
	isPathAliasEnabled: boolean;

	/** Whether to generate source maps */
	isSourceMapsEnabled: boolean;

	/** Output directory for built files */
	outputDirectory: string;

	/** The selected build tool (e.g., 'rollup') */
	tool: string;
}
