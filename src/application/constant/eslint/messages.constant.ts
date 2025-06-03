interface IEslintConfigMessages {
	branchScriptDescription: string;
	cannotEnableBothTypescript: string;
	configurationCannotProceed: string;
	configurationCompleted: string;
	configurationFilesLabel: string;
	customizeInFile: string;
	detectedFeatures: (features: string) => string;
	detectedFrameworks: (frameworks: string) => string;
	detectingFrameworks: string;
	eslintConfigCreated: string;
	eslintPackageName: string;
	eslintSetupFailed: string;
	eslintUninstalledSuccessfully: string;
	eslintUpdateCancelled: string;
	eslintVersionLower: (current: string, required: string) => string;
	existingConfigAborted: string;
	existingConfigDetected: string;
	existingConfigUninstalled: string;
	existingFilesAborted: string;
	existingFilesDetected: (filesList: string) => string;
	failedDetectFrameworks: string;
	failedSetupConfig: string;
	failedUninstallConfig: string;
	failedUserConfirmation: string;
	featureRequiresTypescript: (feature: string) => string;
	frameworkConfigurationsLabel: string;
	frameworkDetectionCompleted: string;
	frameworksLabel: string;
	generatedScriptsLabel: string;
	installedFeaturesLabel: string;
	lintPaths: string;
	noFeaturesSelected: string;
	noFrameworkConfigurations: string;
	noFrameworksDetected: string;
	removeEslintVersion: (version: string) => string;
	selectFeatures: string;
	settingUpConfig: string;
	setupEslintPrompt: string;
	typescriptStrictSelected: string;
	uninstallingConfig: string;
	uninstallingEslint: string;
}

export const ESLINT_CONFIG_MESSAGES: IEslintConfigMessages = {
	branchScriptDescription: "- description of each generated script",
	cannotEnableBothTypescript: "Cannot enable both TypeScript and TypeScript Strict mode. Please choose one.",
	configurationCannotProceed: "Configuration cannot proceed due to the following errors:\n",
	configurationCompleted: "ESLint configuration completed successfully!",
	configurationFilesLabel: "Configuration files:",
	customizeInFile: "You can customize the configuration in these file:",
	detectedFeatures: (features: string): string => `Detected features: ${features}. Would you like to include these features?`,
	detectedFrameworks: (frameworks: string): string => `Detected frameworks: ${frameworks}`,
	detectingFrameworks: "Detecting frameworks...",
	eslintConfigCreated: "ESLint configuration has been created.",
	eslintPackageName: "eslint",
	eslintSetupFailed: "Failed to complete ESLint setup",
	eslintUninstalledSuccessfully: "ESLint uninstalled successfully.",
	eslintUpdateCancelled: "ESLint update cancelled. Setup cannot proceed with the current version.",
	eslintVersionLower: (current: string, required: string): string => `Detected ESLint version ${current}, which is lower than required version ${required}.`,
	existingConfigAborted: "Existing ElsiKora ESLint configuration detected. Setup aborted.",
	existingConfigDetected: "An existing ElsiKora ESLint configuration is detected. Would you like to uninstall it?",
	existingConfigUninstalled: "Existing ESLint configuration uninstalled successfully!",
	existingFilesAborted: "Existing ESLint configuration files detected. Setup aborted.",
	existingFilesDetected: (filesList: string): string => `Existing ESLint configuration files detected:\n${filesList}\n\nDo you want to delete them?`,
	failedDetectFrameworks: "Failed to detect frameworks",
	failedSetupConfig: "Failed to setup ESLint configuration",
	failedUninstallConfig: "Failed to uninstall existing ESLint configuration",
	failedUserConfirmation: "Failed to get user confirmation",
	featureRequiresTypescript: (feature: string): string => `${feature} requires TypeScript, but TypeScript is not detected in your project.`,
	frameworkConfigurationsLabel: "Framework-specific configurations:",
	frameworkDetectionCompleted: "Framework detection completed",
	frameworksLabel: "Detected Frameworks:",
	generatedScriptsLabel: "Generated scripts:",
	installedFeaturesLabel: "Installed features:",
	lintPaths: "Lint Paths:",
	noFeaturesSelected: "No features selected.",
	noFrameworkConfigurations: "No framework-specific configurations",
	noFrameworksDetected: "No frameworks detected",
	removeEslintVersion: (version: string): string => `Do you want to remove ESLint version ${version} and install the latest version?`,
	selectFeatures: "Select the features you want to enable:",
	settingUpConfig: "Setting up ESLint configuration...",
	setupEslintPrompt: "Do you want to set up ESLint for your project?",
	typescriptStrictSelected: "Both TypeScript and TypeScript Strict were selected. Using TypeScript Strict mode (recommended).",
	uninstallingConfig: "Uninstalling existing ESLint configuration...",
	uninstallingEslint: "Uninstalling ESLint...",
};
