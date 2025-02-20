export interface IPackageManager {
    checkConfigInstalled(): Promise<{ isInstalled: boolean; version: string | null }>;
    checkEslintInstalled(): Promise<{ isInstalled: boolean; version: string | null }>;
    detectInstalledFeatures(): Promise<string[]>;
    detectTypescriptInProject(): Promise<boolean>;
    installDependencies(features: string[]): Promise<void>;
    validateFeatureSelection(features: string[]): Promise<{ isValid: boolean; errors: string[] }>;
}
