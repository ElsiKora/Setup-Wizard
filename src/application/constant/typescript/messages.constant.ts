interface ITypescriptConfigMessages {
	baseUrlPrompt: string;
	baseUrlRequired: string;
	baseUrlValidation: string;
	cleanArchitectureEnabled: string;
	cleanArchitectureInfo: string;
	configurationCreated: string;
	configurationOptionsLabel: string;
	confirmCleanArchitecture: string;
	confirmDecorators: string;
	confirmSetup: string;
	decoratorsEnabled: string;
	deleteFilesQuestion: string;
	existingFilesAborted: string;
	existingFilesDetected: string;
	failedConfirmation: string;
	failedSetupError: string;
	failedSetupSpinner: string;
	generatedFilesLabel: string;
	generatedScriptsLabel: string;
	outDirPrompt: string;
	outDirRequired: string;
	outDirValidation: string;
	rootDirPrompt: string;
	rootDirRequired: string;
	rootDirValidation: string;
	settingUpSpinner: string;
	setupCompleteSpinner: string;
	setupCompleteTitle: string;
	summaryBaseUrl: (baseUrl: string) => string;
	summaryOutputDir: (outputDirectory: string) => string;
	summaryRootDir: (rootDirectory: string) => string;
	tscBuildDescription: string;
	tscCheckDescription: string;
	tsconfigLocation: string;
}

export const TYPESCRIPT_CONFIG_MESSAGES: ITypescriptConfigMessages = {
	baseUrlPrompt: "Enter the base URL for module resolution (e.g., ./src):",
	baseUrlRequired: "Base URL is required",
	baseUrlValidation: "Base URL must be a relative path (e.g., ./src, ., or ../src)",
	cleanArchitectureEnabled: "• Clean Architecture: Enabled with path aliases",
	cleanArchitectureInfo: "Clean Architecture provides a structured approach with separate layers for application, domain, infrastructure, and presentation.",
	configurationCreated: "TypeScript configuration has been created.",
	configurationOptionsLabel: "Configuration options:",
	confirmCleanArchitecture: "Would you like to use Clean Architecture with path aliases?",
	confirmDecorators: "Would you like to enable TypeScript decorators (experimental features)?",
	confirmSetup: "Would you like to set up TypeScript configuration?",
	decoratorsEnabled: "• Decorators: Enabled (experimental features)",
	deleteFilesQuestion: "Would you like to remove these files and create new ones?",
	existingFilesAborted: "Skipping TypeScript setup due to existing files.",
	existingFilesDetected: "The following TypeScript configuration files already exist:",
	failedConfirmation: "Failed to get user confirmation for TypeScript setup",
	failedSetupError: "Failed to set up TypeScript:",
	failedSetupSpinner: "Failed to set up TypeScript configuration",
	generatedFilesLabel: "Generated files:",
	generatedScriptsLabel: "Generated scripts:",
	outDirPrompt: "Enter the output directory for compiled files:",
	outDirRequired: "Output directory is required",
	outDirValidation: "Output directory must be a relative path (e.g., ./dist, ., or ../dist)",
	rootDirPrompt: "Enter the root directory of source files:",
	rootDirRequired: "Root directory is required",
	rootDirValidation: "Root directory must be a relative path (e.g., ./src, ., or ../src)",
	settingUpSpinner: "Setting up TypeScript configuration...",
	setupCompleteSpinner: "TypeScript configuration completed successfully!",
	setupCompleteTitle: "TypeScript Setup Complete!",
	summaryBaseUrl: (baseUrl: string): string => `• Base URL: ${baseUrl}`,
	summaryOutputDir: (outputDirectory: string): string => `• Output directory: ${outputDirectory}`,
	summaryRootDir: (rootDirectory: string): string => `• Root directory: ${rootDirectory}`,
	tscBuildDescription: "• npm run build:types - Compile TypeScript files",
	tscCheckDescription: "• npm run lint:types - Type check without emitting files",
	tsconfigLocation: "tsconfig.json",
};
