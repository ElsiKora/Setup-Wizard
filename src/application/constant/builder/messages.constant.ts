interface IBuilderConfigMessages {
	buildDescription: string;
	buildTsconfigCreated: string;
	buildWatchDescription: string;
	cleanEnabled: string;
	cliAppNotSupported: (toolName: string) => string;
	configGeneratorNotImplemented: (toolName: string) => string;
	configurationCreated: string;
	configurationOptionsLabel: string;
	confirmBuildTsconfig: string;
	confirmClean: string;
	confirmCliApp: string;
	confirmCommonjs: string;
	confirmDecorators: string;
	confirmMinify: string;
	confirmPackageJsonGeneration: string;
	confirmPathAlias: string;
	confirmSetup: string;
	confirmSourceMaps: string;
	decoratorsEnabled: string;
	deleteFilesQuestion: string;
	entryPointPrompt: string;
	entryPointRequired: string;
	entryPointValidation: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	formatPromptCli: string;
	formatsPrompt: string;
	formatsRequired: string;
	generatedFilesLabel: string;
	generatedScriptsLabel: string;
	minifyEnabled: string;
	outputDirPrompt: string;
	outputDirRequired: string;
	outputDirValidation: string;
	packageJsonGenerationEnabled: string;
	pathAliasEnabled: string;
	selectBuildTool: string;
	settingUpSpinner: string;
	setupCompleteSpinner: string;
	setupCompleteTitle: string;
	sourceMapsEnabled: string;
	summaryCliApp: string;
	summaryEntryPoint: (entryPoint: string) => string;
	summaryFormats: (formats: string) => string;
	summaryOutputDirectory: (outputDirectory: string) => string;
	summaryTool: (tool: string) => string;
	todoConfigContent: string;
}

export const BUILDER_CONFIG_MESSAGES: IBuilderConfigMessages = {
	buildDescription: "  - build: Build the project",
	buildTsconfigCreated: "  - Build TypeScript Config: tsconfig.build.json created",
	buildWatchDescription: "  - build:watch: Build and watch for changes",
	cleanEnabled: "  - Clean: Enabled (removes output directory before build)",
	cliAppNotSupported: (toolName: string): string => `${toolName} does not support CLI application builds`,
	configGeneratorNotImplemented: (toolName: string): string => `Configuration generator for ${toolName} is not yet implemented. Creating empty config file.`,
	configurationCreated: "Builder configuration created successfully!",
	configurationOptionsLabel: "Configuration options:",
	confirmBuildTsconfig: "Create a separate tsconfig.build.json for builds?",
	confirmClean: "Enable clean output directory before build?",
	confirmCliApp: "Is this a CLI application?",
	confirmCommonjs: "Include CommonJS plugin? (only needed for older npm packages with require/module.exports)",
	confirmDecorators: "Does your project use TypeScript decorators?",
	confirmMinify: "Enable minification?",
	confirmPackageJsonGeneration: "Generate package.json in output directories?",
	confirmPathAlias: "Use TypeScript path aliases (requires @-style imports)?",
	confirmSetup: "Would you like to set up a build tool for your project?",
	confirmSourceMaps: "Generate source maps?",
	decoratorsEnabled: "  - Decorators: Enabled (with tslib resolution)",
	deleteFilesQuestion: "Would you like to remove these files?",
	entryPointPrompt: "What is the entry point for your build?",
	entryPointRequired: "Entry point is required",
	entryPointValidation: "Entry point must be a relative path ending with .js, .ts, .mjs, .cjs, or .tsx",
	existingFilesAborted: "Setup aborted. Existing configuration files were preserved.",
	existingFilesDetected: "🔍 Found existing builder configuration files:",
	failedConfirmation: "Setup cancelled",
	failedSetupError: "Failed to set up builder",
	failedSetupSpinner: "Failed to set up builder",
	formatPromptCli: "Select output format for CLI:",
	formatsPrompt: "Select output formats:",
	formatsRequired: "At least one output format must be selected",
	generatedFilesLabel: "Generated files:",
	generatedScriptsLabel: "Generated scripts:",
	minifyEnabled: "  - Minification: Enabled",
	outputDirPrompt: "Where should the built files be output?",
	outputDirRequired: "Output directory is required",
	outputDirValidation: "Output directory must be a relative path",
	packageJsonGenerationEnabled: "  - Package.json Generation: Enabled for each output format",
	pathAliasEnabled: "  - Path Aliases: Enabled (dts-path-alias)",
	selectBuildTool: "Select a build tool:",
	settingUpSpinner: "Setting up builder...",
	setupCompleteSpinner: "Builder setup complete!",
	setupCompleteTitle: "Builder Setup Complete",
	sourceMapsEnabled: "  - Source Maps: Enabled",
	summaryCliApp: "  - CLI Application: Yes (with shebang)",
	summaryEntryPoint: (entryPoint: string): string => `  - Entry Point: ${entryPoint}`,
	summaryFormats: (formats: string): string => `  - Output Formats: ${formats}`,
	summaryOutputDirectory: (outputDirectory: string): string => `  - Output Directory: ${outputDirectory}`,
	summaryTool: (tool: string): string => `  - Build Tool: ${tool}`,
	todoConfigContent: "// TODO: Add configuration\n",
};
