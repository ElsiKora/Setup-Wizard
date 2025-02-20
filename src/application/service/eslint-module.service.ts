import { PackageJsonService } from "./package-json.service";
import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { ESLINT_CONFIG_FILE_NAMES } from "../constant/eslint-config-file-names.constant";
import { ESLINT_FEATURE_CONFIG } from "../../domain/constant/eslint-feature-config.constant";
import { ESLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/eslint-config-core-dependencies.constant";
import { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import { ESLINT_FEATURE_GROUPS } from "../../domain/constant/eslint-feature-groups.constant";
import { ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME } from "../constant/eslint-config-elsikora-package-name.constant";
import { ICommandService } from "../interface/command-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { FrameworkService } from "./framework.service";
import { EFramework } from "../../domain/enum/framework.enum";
import { ESLINT_CONFIG_ESLINT_PACKAGE_NAME } from "../constant/eslint-config-eslint-package-name.costant";
import { ESLINT_CONFIG } from "../constant/elint-config.constant";
import { ESLINT_CONFIG_FILE_NAME } from "../constant/eslint-config-file-name.constant";
import { ESLINT_CONFIG_IGNORE_PATHS } from "../constant/eslint-config-ignore-paths.constant";
import { ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION } from "../constant/eslint-config-eslint-minimum-required-version.constant";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
import { ConfigService } from "./config.service";
import { EModule } from "../../domain/enum/module.enum";

export class EslintModuleService implements IModuleService {
	private selectedFeatures: EEslintFeature[] = [];
	private detectedFrameworks: IFrameworkConfig[] = [];
	readonly packageJsonService: PackageJsonService;
	readonly commandService: ICommandService;
	private frameworkService: FrameworkService;
	private readonly configService: ConfigService;

	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {
		this.commandService = new NodeCommandService();
		this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
		this.frameworkService = new FrameworkService(fileSystemService, this.packageJsonService);
		this.configService = new ConfigService(fileSystemService);
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

			const savedConfig = await this.getSavedConfig();
			const savedFeatures = savedConfig?.features || [];

			this.selectedFeatures = await this.selectFeatures(savedFeatures);

			if (this.selectedFeatures.length === 0) {
				this.cliInterfaceService.warn("No features selected.");
				return { wasInstalled: false };
			}

			if (!(await this.validateFeatureSelection())) {
				return { wasInstalled: false };
			}

			await this.setupSelectedFeatures();

			return {
				wasInstalled: true,
				customProperties: {
					features: this.selectedFeatures,
				},
			};
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete ESLint setup", error);
			throw error;
		}
	}

	private async getSavedConfig(): Promise<{ features?: EEslintFeature[] } | null> {
		try {
			if (await this.configService.exists()) {
				const config = await this.configService.get();
				if (config[EModule.ESLINT]) {
					return config[EModule.ESLINT] as { features?: EEslintFeature[] };
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	private async detectFrameworks(): Promise<void> {
		this.cliInterfaceService.startSpinner("Detecting frameworks...");

		try {
			this.detectedFrameworks = await this.frameworkService.detect();

			if (this.detectedFrameworks.length > 0) {
				const frameworkNames = this.detectedFrameworks.map((f) => f.displayName).join(", ");
				this.cliInterfaceService.info(`Detected frameworks: ${frameworkNames}`);
			}

			this.cliInterfaceService.stopSpinner("Framework detection completed");
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to detect frameworks");
			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to set up ESLint for your project?", true));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	private async setupScripts(): Promise<void> {
		await this.packageJsonService.addScript("lint", this.generateLintCommand());
		await this.packageJsonService.addScript("lint:fix", this.generateLintFixCommand());

		if (this.detectedFrameworks.some((framework) => framework.isSupportWatch)) {
			const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
			await this.packageJsonService.addScript("lint:watch", `npx eslint-watch ${lintPaths.join(" ")}`);
		}

		if (this.detectedFrameworks.some((framework) => framework.name === EFramework.TYPESCRIPT)) {
			await this.packageJsonService.addScript("lint:types", "tsc --noEmit");
			await this.packageJsonService.addScript("lint:types:fix", "tsc --noEmit --skipLibCheck");
			await this.packageJsonService.addScript("lint:all", "npm run lint && npm run lint:types");
			await this.packageJsonService.addScript("lint:all:fix", "npm run lint:fix && npm run lint:types:fix");
		}
	}

	private generateLintCommand(): string {
		const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
		return `eslint ${lintPaths.length ? lintPaths.join(" ") : "."}`;
	}

	private generateLintFixCommand(): string {
		const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
		return `eslint --fix ${lintPaths.length ? lintPaths.join(" ") : "."}`;
	}

	private generateLintIgnorePaths(): Array<string> {
		const ignorePatterns = this.getIgnorePatterns();
		return ignorePatterns.length ? ignorePatterns : [];
	}

	async handleExistingSetup(): Promise<boolean> {
		const hasConfig = await this.packageJsonService.isExistsDependency(ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME);

		if (hasConfig) {
			const shouldUninstall = await this.cliInterfaceService.confirm("An existing ElsiKora ESLint configuration is detected. Would you like to uninstall it?", true);

			if (!shouldUninstall) {
				this.cliInterfaceService.warn("Existing ElsiKora ESLint configuration detected. Setup aborted.");
				return false;
			}

			await this.uninstallExistingConfig();
		}

		const existingFiles = await this.findExistingConfigFiles();
		if (existingFiles.length > 0) {
			const shouldDelete = await this.cliInterfaceService.confirm(`Existing ESLint configuration files detected:\n${existingFiles.map((f) => `- ${f}`).join("\n")}\n\nDo you want to delete them?`, true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file) => this.fileSystemService.deleteFile(file)));
			} else {
				this.cliInterfaceService.warn("Existing ESLint configuration files detected. Setup aborted.");
				return false;
			}
		}

		return true;
	}

	private async uninstallExistingConfig(): Promise<void> {
		this.cliInterfaceService.startSpinner("Uninstalling existing ESLint configuration...");

		try {
			await this.packageJsonService.uninstallPackages([ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME, ESLINT_CONFIG_ESLINT_PACKAGE_NAME]);
			this.cliInterfaceService.stopSpinner("Existing ESLint configuration uninstalled successfully!");
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to uninstall existing ESLint configuration");
			throw error;
		}
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const file of ESLINT_CONFIG_FILE_NAMES) {
			if (await this.fileSystemService.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private async detectInstalledFeatures(): Promise<EEslintFeature[]> {
		const detectedFeatures = new Set<EEslintFeature>();
		const deps = {
			...(await this.packageJsonService.getDependencies("dependencies")),
			...(await this.packageJsonService.getDependencies("devDependencies")),
		};

		const frameworkFeatures = this.frameworkService.getFeatures(this.detectedFrameworks);
		frameworkFeatures.forEach((feature) => detectedFeatures.add(feature));

		Object.entries(ESLINT_FEATURE_CONFIG).forEach(([feature, config]) => {
			if (config.required) {
				detectedFeatures.add(feature as EEslintFeature);
			}
		});

		Object.entries(ESLINT_FEATURE_CONFIG).forEach(([feature, config]) => {
			if (config.detect && config.detect.some((pkg) => pkg in deps)) {
				detectedFeatures.add(feature as EEslintFeature);
			}
		});

		return Array.from(detectedFeatures);
	}

	private async selectFeatures(savedFeatures: EEslintFeature[] = []): Promise<EEslintFeature[]> {
		const detectedFeatures = await this.detectInstalledFeatures();
		let shouldUseDetected = false;

		const hasValidSavedFeatures = savedFeatures.length > 0 && savedFeatures.every((feature) => Object.values(EEslintFeature).includes(feature));

		if (!hasValidSavedFeatures && detectedFeatures.length > 1) {
			shouldUseDetected = await this.cliInterfaceService.confirm(`Detected features: ${detectedFeatures.join(", ")}. Would you like to include these features?`, true);
		}

		const groupedOptions: Record<string, Array<ICliInterfaceServiceSelectOptions>> = {};

		ESLINT_FEATURE_GROUPS.forEach((group) => {
			groupedOptions[group.name] = group.features.map((feature) => ({
				label: `${feature} - ${ESLINT_FEATURE_CONFIG[feature].description}`,
				value: feature,
			}));
		});

		const initialValues: Array<string> = hasValidSavedFeatures ? savedFeatures : shouldUseDetected ? detectedFeatures : [];

		return await this.cliInterfaceService.groupMultiselect<EEslintFeature>("Select the features you want to enable:", groupedOptions, true, initialValues);
	}

	private async validateFeatureSelection(): Promise<boolean> {
		const errors: string[] = [];

		for (const feature of this.selectedFeatures) {
			const config = ESLINT_FEATURE_CONFIG[feature];
			if (config.requiresTypescript && !this.detectedFrameworks.some((framework) => framework.name === EFramework.TYPESCRIPT)) {
				errors.push(`${feature} requires TypeScript, but TypeScript is not detected in your project.`);
			}
		}

		if (errors.length > 0) {
			this.cliInterfaceService.warn("Configuration cannot proceed due to the following errors:\n" + errors.map((error) => `- ${error}`).join("\n"));
			return false;
		}

		return true;
	}

	private async setupSelectedFeatures(): Promise<void> {
		this.cliInterfaceService.startSpinner("Setting up ESLint configuration...");

		try {
			const packages = this.collectDependencies();
			await this.packageJsonService.installPackages(packages, "latest", "devDependencies");
			await this.createConfig();
			await this.setupScripts();

			this.cliInterfaceService.stopSpinner("ESLint configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to setup ESLint configuration");
			throw error;
		}
	}

	async checkEslintVersion(): Promise<boolean> {
		const eslintVersion = await this.packageJsonService.getInstalledDependencyVersion(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);

		if (eslintVersion) {
			const majorVersion = eslintVersion.majorVersion;

			if (majorVersion < ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION) {
				this.cliInterfaceService.info(`Detected ESLint version ${majorVersion}, which is lower than required version ${ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION}.`);

				const shouldRemove = await this.cliInterfaceService.confirm(`Do you want to remove ESLint version ${majorVersion} and install the latest version?`, true);

				if (!shouldRemove) {
					this.cliInterfaceService.warn("ESLint update cancelled. Setup cannot proceed with the current version.");
					return false;
				}

				this.cliInterfaceService.startSpinner("Uninstalling ESLint...");

				await this.packageJsonService.uninstallPackages(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
				this.cliInterfaceService.stopSpinner("ESLint uninstalled successfully.");
			}
		}
		return true;
	}

	private collectDependencies(): string[] {
		const dependencies = new Set<string>(ESLINT_CONFIG_CORE_DEPENDENCIES);

		for (const feature of this.selectedFeatures) {
			const config = ESLINT_FEATURE_CONFIG[feature];
			if (config.packages) {
				config.packages.forEach((pkg) => dependencies.add(pkg));
			}
		}

		return Array.from(dependencies);
	}

	private async createConfig(): Promise<void> {
		const ignores: Array<string> = this.generateLintIgnorePaths();

		await this.fileSystemService.writeFile(`${ESLINT_CONFIG_FILE_NAME}`, ESLINT_CONFIG.template(ignores, this.selectedFeatures), "utf8");
	}

	private getIgnorePatterns(): Array<string> {
		return [...this.frameworkService.getIgnorePatterns(this.detectedFrameworks), ...ESLINT_CONFIG_IGNORE_PATHS];
	}

	private async displaySetupSummary(): Promise<void> {
		const packageJsonScripts = await this.packageJsonService.getProperty("scripts");

		const packageJsonScriptsKeys = packageJsonScripts ? Object.keys(packageJsonScripts) : [];

		const generatedScripts = ["lint", "lint:fix", "lint:watch", "lint:types", "lint:types:fix", "lint:all", "lint:all:fix"].filter((script) => packageJsonScriptsKeys.includes(script));

		const summary = [
			"ESLint configuration has been created.",
			"",
			"Detected Frameworks:",
			...(this.detectedFrameworks.length > 0 ? this.detectedFrameworks.map((framework) => `- ${framework.displayName}${framework.description ? `: ${framework.description}` : ""}`) : ["No frameworks detected"]),
			"",
			"Installed features:",
			...this.selectedFeatures.map((feature) => `- ${feature}: ${ESLINT_FEATURE_CONFIG[feature].description}`),
			"",
			"Framework-specific configurations:",
			...(this.detectedFrameworks.length > 0 ? [`Lint Paths: ${this.frameworkService.getLintPaths(this.detectedFrameworks).join(", ")}`] : ["No framework-specific configurations"]),
			"",
			"Generated scripts:",
			...generatedScripts.map((script) => `- npm run ${script}`),
			"",
			"You can customize the configuration in these file:",
			`- ${ESLINT_CONFIG_FILE_NAME}`,
		];

		this.cliInterfaceService.note("ESLint Setup", summary.join("\n"));
	}
}
