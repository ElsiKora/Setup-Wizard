/**
 * Configuration interface for build tools.
 * Defines the structure for bundler-specific settings.
 */
export interface IBuildToolConfig {
	/** Whether the tool supports CLI app builds */
	canSupportCliApps: boolean;

	/** Configuration file name */
	configFileName: string;

	/** Configuration generation function */
	configGenerator?: (options: { entryPoint: string; formats: Array<string>; isCliApp: boolean; isCommonjsEnabled: boolean; isDecoratorsEnabled: boolean; isMinifyEnabled: boolean; isPackageJsonGenerationEnabled: boolean; isPathAliasEnabled: boolean; isSourceMapsEnabled: boolean; isTypeScript: boolean; outputDirectory: string }) => string;

	/** Core npm dependencies required for the tool */
	coreDependencies: Array<string>;

	/** Default output directory */
	defaultOutputDir: string;

	/** Default output directory for CLI apps */
	defaultOutputDirCli: string;

	/** Brief description of the tool */
	description: string;

	/** Human-readable name of the build tool */
	name: string;

	/** Optional dependencies for additional features */
	optionalDependencies: {
		/** Dependencies for decorator support */
		decorators?: Array<string>;
		/** Dependencies for minification */
		minify?: Array<string>;
		/** Dependencies for path aliases */
		pathAlias?: Array<string>;
		/** Dependencies for TypeScript support */
		typescript?: Array<string>;
	};

	/** NPM scripts */
	scripts: {
		/** Production build script */
		build: string;
		/** Development build script */
		dev: string;
		/** Watch mode script */
		watch: string;
	};

	/** Supported output formats */
	supportedFormats: Array<string>;
}
