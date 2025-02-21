export interface IPackageManager {
	checkConfigInstalled(): Promise<{ isInstalled: boolean; version: null | string }>;
	checkEslintInstalled(): Promise<{ isInstalled: boolean; version: null | string }>;
	detectInstalledFeatures(): Promise<Array<string>>;
	detectTypescriptInProject(): Promise<boolean>;
	installDependencies(features: Array<string>): Promise<void>;
	validateFeatureSelection(features: Array<string>): Promise<{ errors: Array<string>; isValid: boolean }>;
}
