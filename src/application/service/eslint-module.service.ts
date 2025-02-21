import type { EPackageJsonDependencyVersionFlag } from "../../domain/enum/package-json-dependency-version-flag.enum";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { IEslintFeatureConfig } from "../../domain/interface/eslint-feature-config.interface";
import type { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import type { TPackageJsonScripts } from "../../domain/type/package-json-scripts.type";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { ESLINT_FEATURE_CONFIG } from "../../domain/constant/eslint-feature-config.constant";
import { ESLINT_FEATURE_GROUPS } from "../../domain/constant/eslint-feature-groups.constant";
import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { EFramework } from "../../domain/enum/framework.enum";
import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { ESLINT_CONFIG } from "../constant/elint-config.constant";
import { ESLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/eslint-config-core-dependencies.constant";
import { ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME } from "../constant/eslint-config-elsikora-package-name.constant";
import { ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION } from "../constant/eslint-config-eslint-minimum-required-version.constant";
import { ESLINT_CONFIG_ESLINT_PACKAGE_NAME } from "../constant/eslint-config-eslint-package-name.costant";
import { ESLINT_CONFIG_FILE_NAME } from "../constant/eslint-config-file-name.constant";
import { ESLINT_CONFIG_FILE_NAMES } from "../constant/eslint-config-file-names.constant";
import { ESLINT_CONFIG_IGNORE_PATHS } from "../constant/eslint-config-ignore-paths.constant";

import { ConfigService } from "./config.service";
import { FrameworkService } from "./framework.service";
import { PackageJsonService } from "./package-json.service";

export class EslintModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly COMMAND_SERVICE: ICommandService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	private readonly CONFIG_SERVICE: ConfigService;

	private detectedFrameworks: Array<IFrameworkConfig> = [];

	private readonly FRAMEWORK_SERVICE: FrameworkService;

	private selectedFeatures: Array<EEslintFeature> = [];

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.FRAMEWORK_SERVICE = new FrameworkService(fileSystemService, this.PACKAGE_JSON_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	async checkEslintVersion(): Promise<boolean> {
		const eslintVersion:
			| {
					flag: EPackageJsonDependencyVersionFlag;
					isPrerelease: boolean;
					majorVersion: number;
					minorVersion: number;
					patchVersion: number;
					prereleaseChannel?: string;
					version: string;
			  }
			| undefined = await this.PACKAGE_JSON_SERVICE.getInstalledDependencyVersion(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);

		if (eslintVersion) {
			const majorVersion: number = eslintVersion.majorVersion;

			if (majorVersion < ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION) {
				this.CLI_INTERFACE_SERVICE.info(`Detected ESLint version ${String(majorVersion)}, which is lower than required version ${String(ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION)}.`);

				const shouldRemove: boolean = await this.CLI_INTERFACE_SERVICE.confirm(`Do you want to remove ESLint version ${String(majorVersion)} and install the latest version?`, true);

				if (!shouldRemove) {
					this.CLI_INTERFACE_SERVICE.warn("ESLint update cancelled. Setup cannot proceed with the current version.");

					return false;
				}

				this.CLI_INTERFACE_SERVICE.startSpinner("Uninstalling ESLint...");

				await this.PACKAGE_JSON_SERVICE.uninstallPackages(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
				this.CLI_INTERFACE_SERVICE.stopSpinner("ESLint uninstalled successfully.");
			}
		}

		return true;
	}

	async handleExistingSetup(): Promise<boolean> {
		const hasConfig: boolean = await this.PACKAGE_JSON_SERVICE.isExistsDependency(ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME);

		if (hasConfig) {
			const shouldUninstall: boolean = await this.CLI_INTERFACE_SERVICE.confirm("An existing ElsiKora ESLint configuration is detected. Would you like to uninstall it?", true);

			if (!shouldUninstall) {
				this.CLI_INTERFACE_SERVICE.warn("Existing ElsiKora ESLint configuration detected. Setup aborted.");

				return false;
			}

			await this.uninstallExistingConfig();
		}

		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const filesList: string = existingFiles.map((f: string) => `- ${f}`).join("\n");
			const message: string = `Existing ESLint configuration files detected:\n${filesList}\n\nDo you want to delete them?`;
			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(message, true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn("Existing ESLint configuration files detected. Setup aborted.");

				return false;
			}
		}

		return true;
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			if (!(await this.checkEslintVersion())) {
				return { wasInstalled: false };
			}

			await this.detectFrameworks();

			const savedConfig: { features?: Array<EEslintFeature> } | null = await this.getSavedConfig();
			const savedFeatures: Array<EEslintFeature> = savedConfig?.features ?? [];

			this.selectedFeatures = await this.selectFeatures(savedFeatures);

			if (this.selectedFeatures.length === 0) {
				this.CLI_INTERFACE_SERVICE.warn("No features selected.");

				return { wasInstalled: false };
			}

			if (!this.validateFeatureSelection()) {
				return { wasInstalled: false };
			}

			await this.setupSelectedFeatures();

			return {
				customProperties: {
					features: this.selectedFeatures,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete ESLint setup", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up ESLint for your project?", true);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private collectDependencies(): Array<string> {
		const dependencies: Set<string> = new Set<string>(ESLINT_CONFIG_CORE_DEPENDENCIES);

		for (const feature of this.selectedFeatures) {
			const config: IEslintFeatureConfig = ESLINT_FEATURE_CONFIG[feature];

			if (config.packages) {
				for (const packageName of config.packages) dependencies.add(packageName);
			}
		}

		return [...dependencies];
	}

	private async createConfig(): Promise<void> {
		const ignores: Array<string> = this.generateLintIgnorePaths();

		await this.FILE_SYSTEM_SERVICE.writeFile(ESLINT_CONFIG_FILE_NAME, ESLINT_CONFIG.template(ignores, this.selectedFeatures), "utf8");
	}

	private async detectFrameworks(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Detecting frameworks...");

		try {
			this.detectedFrameworks = await this.FRAMEWORK_SERVICE.detect();

			if (this.detectedFrameworks.length > 0) {
				const frameworkNames: string = this.detectedFrameworks.map((f: IFrameworkConfig) => f.displayName).join(", ");
				this.CLI_INTERFACE_SERVICE.info(`Detected frameworks: ${frameworkNames}`);
			}

			this.CLI_INTERFACE_SERVICE.stopSpinner("Framework detection completed");
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to detect frameworks");

			throw error;
		}
	}

	private async detectInstalledFeatures(): Promise<Array<EEslintFeature>> {
		const detectedFeatures: Set<EEslintFeature> = new Set<EEslintFeature>();

		const dependencies: Record<string, string> = {
			...(await this.PACKAGE_JSON_SERVICE.getDependencies(EPackageJsonDependencyType.PROD)),
			...(await this.PACKAGE_JSON_SERVICE.getDependencies(EPackageJsonDependencyType.DEV)),
		};

		const frameworkFeatures: Array<EEslintFeature> = this.FRAMEWORK_SERVICE.getFeatures(this.detectedFrameworks);

		for (const feature of frameworkFeatures) detectedFeatures.add(feature);

		for (const [feature, config] of Object.entries(ESLINT_FEATURE_CONFIG)) {
			if (config.isRequired) {
				detectedFeatures.add(feature as EEslintFeature);
			}
		}

		for (const [feature, config] of Object.entries(ESLINT_FEATURE_CONFIG)) {
			if (config.detect?.some((packageName: string) => packageName in dependencies)) {
				detectedFeatures.add(feature as EEslintFeature);
			}
		}

		return [...detectedFeatures];
	}

	private async displaySetupSummary(): Promise<void> {
		const packageJsonScripts: TPackageJsonScripts | undefined = await this.PACKAGE_JSON_SERVICE.getProperty("scripts");

		const packageJsonScriptsKeys: Array<string> = packageJsonScripts ? Object.keys(packageJsonScripts) : [];

		const generatedScripts: Array<string> = ["lint", "lint:fix", "lint:watch", "lint:types", "lint:types:fix", "lint:all", "lint:all:fix"].filter((script: string) => packageJsonScriptsKeys.includes(script));

		const frameworksList: Array<string> =
			this.detectedFrameworks.length > 0
				? this.detectedFrameworks.map((framework: IFrameworkConfig) => {
						const description: string = framework.description ? `: ${framework.description}` : "";

						return `- ${framework.displayName}${description}`;
					})
				: ["No frameworks detected"];

		const featuresList: Array<string> = this.selectedFeatures.map((feature: EEslintFeature) => `- ${feature}: ${ESLINT_FEATURE_CONFIG[feature].description}`);

		const frameworkConfigs: Array<string> = this.detectedFrameworks.length > 0 ? [`Lint Paths: ${this.FRAMEWORK_SERVICE.getLintPaths(this.detectedFrameworks).join(", ")}`] : ["No framework-specific configurations"];

		const scriptsList: Array<string> = generatedScripts.map((script: string) => `- npm run ${script}`);

		const summary: Array<string> = ["ESLint configuration has been created.", "", "Detected Frameworks:", ...frameworksList, "", "Installed features:", ...featuresList, "", "Framework-specific configurations:", ...frameworkConfigs, "", "Generated scripts:", ...scriptsList, "", "You can customize the configuration in these file:", `- ${ESLINT_CONFIG_FILE_NAME}`];

		this.CLI_INTERFACE_SERVICE.note("ESLint Setup", summary.join("\n"));
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of ESLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private generateLintCommand(): string {
		const lintPaths: Array<string> = this.FRAMEWORK_SERVICE.getLintPaths(this.detectedFrameworks);

		return `eslint ${lintPaths.length > 0 ? lintPaths.join(" ") : "."}`;
	}

	private generateLintFixCommand(): string {
		const lintPaths: Array<string> = this.FRAMEWORK_SERVICE.getLintPaths(this.detectedFrameworks);

		return `eslint --fix ${lintPaths.length > 0 ? lintPaths.join(" ") : "."}`;
	}

	private generateLintIgnorePaths(): Array<string> {
		const ignorePatterns: Array<string> = this.getIgnorePatterns();

		return ignorePatterns.length > 0 ? ignorePatterns : [];
	}

	private getIgnorePatterns(): Array<string> {
		return [...this.FRAMEWORK_SERVICE.getIgnorePatterns(this.detectedFrameworks), ...ESLINT_CONFIG_IGNORE_PATHS];
	}

	private async getSavedConfig(): Promise<{ features?: Array<EEslintFeature> } | null> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.ESLINT]) {
					return config[EModule.ESLINT] as { features?: Array<EEslintFeature> };
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	private async selectFeatures(savedFeatures: Array<EEslintFeature> = []): Promise<Array<EEslintFeature>> {
		const detectedFeatures: Array<EEslintFeature> = await this.detectInstalledFeatures();
		let shouldUseDetected: boolean = false;

		const hasValidSavedFeatures: boolean = savedFeatures.length > 0 && savedFeatures.every((feature: EEslintFeature) => Object.values(EEslintFeature).includes(feature));

		if (!hasValidSavedFeatures && detectedFeatures.length > 1) {
			shouldUseDetected = await this.CLI_INTERFACE_SERVICE.confirm(`Detected features: ${detectedFeatures.join(", ")}. Would you like to include these features?`, true);
		}

		const groupedOptions: Record<string, Array<ICliInterfaceServiceSelectOptions>> = {};

		for (const group of ESLINT_FEATURE_GROUPS) {
			groupedOptions[group.name] = group.features.map((feature: EEslintFeature) => ({
				label: `${feature} - ${ESLINT_FEATURE_CONFIG[feature].description}`,
				value: feature,
			}));
		}

		const defaultFeatures: Array<EEslintFeature> = shouldUseDetected ? detectedFeatures : [];
		const initialValues: Array<string> = hasValidSavedFeatures ? savedFeatures : defaultFeatures;

		return await this.CLI_INTERFACE_SERVICE.groupMultiselect<EEslintFeature>("Select the features you want to enable:", groupedOptions, true, initialValues);
	}

	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("lint", this.generateLintCommand());
		await this.PACKAGE_JSON_SERVICE.addScript("lint:fix", this.generateLintFixCommand());

		if (this.detectedFrameworks.some((framework: IFrameworkConfig) => framework.isSupportWatch)) {
			const lintPaths: Array<string> = this.FRAMEWORK_SERVICE.getLintPaths(this.detectedFrameworks);
			await this.PACKAGE_JSON_SERVICE.addScript("lint:watch", `npx eslint-watch ${lintPaths.join(" ")}`);
		}

		if (this.detectedFrameworks.some((framework: IFrameworkConfig) => framework.name === EFramework.TYPESCRIPT)) {
			await this.PACKAGE_JSON_SERVICE.addScript("lint:types", "tsc --noEmit");
			await this.PACKAGE_JSON_SERVICE.addScript("lint:types:fix", "tsc --noEmit --skipLibCheck");
			await this.PACKAGE_JSON_SERVICE.addScript("lint:all", "npm run lint && npm run lint:types");
			await this.PACKAGE_JSON_SERVICE.addScript("lint:all:fix", "npm run lint:fix && npm run lint:types:fix");
		}
	}

	private async setupSelectedFeatures(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up ESLint configuration...");

		try {
			const packages: Array<string> = this.collectDependencies();
			await this.PACKAGE_JSON_SERVICE.installPackages(packages, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfig();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("ESLint configuration completed successfully!");
			await this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup ESLint configuration");

			throw error;
		}
	}

	private async uninstallExistingConfig(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Uninstalling existing ESLint configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.uninstallPackages([ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME, ESLINT_CONFIG_ESLINT_PACKAGE_NAME]);
			this.CLI_INTERFACE_SERVICE.stopSpinner("Existing ESLint configuration uninstalled successfully!");
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to uninstall existing ESLint configuration");

			throw error;
		}
	}

	private validateFeatureSelection(): boolean {
		const errors: Array<string> = [];

		for (const feature of this.selectedFeatures) {
			const config: IEslintFeatureConfig = ESLINT_FEATURE_CONFIG[feature];

			if (config.isRequiresTypescript && !this.detectedFrameworks.some((framework: IFrameworkConfig) => framework.name === EFramework.TYPESCRIPT)) {
				errors.push(`${feature} requires TypeScript, but TypeScript is not detected in your project.`);
			}
		}

		if (errors.length > 0) {
			this.CLI_INTERFACE_SERVICE.warn("Configuration cannot proceed due to the following errors:\n" + errors.map((error: string) => `- ${error}`).join("\n"));

			return false;
		}

		return true;
	}
}
