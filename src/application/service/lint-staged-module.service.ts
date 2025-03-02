import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { ILintStagedFeatureConfig } from "../../domain/interface/lint-staged-feature-config.interface";
import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigLintStaged } from "../interface/config/lint-staged.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { LINT_STAGED_FEATURE_CONFIG } from "../../domain/constant/lint-staged-feature-config.constant";
import { ELintStagedFeature } from "../../domain/enum/lint-staged-feature.enum";
import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { LINT_STAGED_CONFIG_FILE_NAMES } from "../constant/lint-staged-config-file-names.constant";
import { LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT } from "../constant/lint-staged-config-husky-pre-commit-script.constant";
import { LINT_STAGED_CONFIG } from "../constant/lint-staged-config.constant";
import { LINT_STAGED_CORE_DEPENDENCIES } from "../constant/lint-staged-core-dependencies.constant";

import { ConfigService } from "./config.service";
import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing lint-staged configuration.
 * Provides functionality to run linters on git staged files,
 * ensuring only properly formatted code is committed.
 */
export class LintStagedModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Command service for executing shell commands */
	readonly COMMAND_SERVICE: ICommandService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Cached lint-staged configuration */
	private config: IConfigLintStaged | null = null;

	/** Configuration service for managing app configuration */
	private readonly CONFIG_SERVICE: ConfigService;

	/** Selected lint-staged features to configure */
	private selectedFeatures: Array<ELintStagedFeature> = [];

	/**
	 * Initializes a new instance of the LintStagedModuleService.
	 *
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	/**
	 * Handles existing lint-staged setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 *
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

		if (packageJson["lint-staged"]) {
			existingFiles.push("package.json (lint-staged config)");
		}

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing lint-staged configuration files detected:"];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", "Do you want to delete them?");

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.filter((file: string) => file !== "package.json (lint-staged config)").map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));

				if (packageJson["lint-staged"]) {
					delete packageJson["lint-staged"];
					await this.PACKAGE_JSON_SERVICE.set(packageJson);
				}
			} else {
				this.CLI_INTERFACE_SERVICE.warn("Existing lint-staged configuration files detected. Setup aborted.");

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures lint-staged.
	 * Guides the user through selecting linting tools and setting up git hooks.
	 *
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigLintStaged>(EModule.LINT_STAGED);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const savedFeatures: Array<ELintStagedFeature> = this.config?.features ?? [];

			await this.setupLintStaged(savedFeatures);

			return {
				customProperties: {
					features: this.selectedFeatures,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete lint-staged setup", error);

			throw error;
		}
	}

	/**
	 * Determines if lint-staged should be installed.
	 * Asks the user if they want to set up lint-staged with Husky pre-commit hooks.
	 * Uses the saved config value as default if it exists.
	 *
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up lint-staged with Husky pre-commit hooks?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.LINT_STAGED));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates the lint-staged configuration file.
	 *
	 * @param selectedFeatures - Array of selected lint-staged features
	 */
	private async createConfigs(selectedFeatures: Array<ELintStagedFeature>): Promise<void> {
		const config: string = LINT_STAGED_CONFIG.template(selectedFeatures);
		await this.FILE_SYSTEM_SERVICE.writeFile("lint-staged.config.js", config, "utf8");
	}

	/**
	 * Displays a summary of the lint-staged setup results.
	 * Lists selected linting tools and required packages.
	 *
	 * @param selectedFeatures - Array of selected lint-staged features
	 */
	private displaySetupSummary(selectedFeatures: Array<ELintStagedFeature>): void {
		const requiredPackages: Array<string> = selectedFeatures.flatMap((feature: ELintStagedFeature) => LINT_STAGED_FEATURE_CONFIG[feature].requiredPackages);

		const summary: Array<string> = [
			"lint-staged configuration has been created.",
			"",
			"Configuration files:",
			"- lint-staged.config.js",
			"- .husky/pre-commit",
			"",
			"Selected linting tools:",
			...selectedFeatures.map((feature: ELintStagedFeature) => `- ${LINT_STAGED_FEATURE_CONFIG[feature].label}`),
			"",
			"Required packages (please ensure these are installed):",
			...requiredPackages.map((packageName: string) => `- ${packageName}`),
			"",
			"Husky git hooks have been set up to run lint-staged before commits.",
		];

		this.CLI_INTERFACE_SERVICE.note("lint-staged Setup", summary.join("\n"));
	}

	/**
	 * Finds existing lint-staged configuration files.
	 *
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of LINT_STAGED_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(".husky/pre-commit")) {
			existingFiles.push(".husky/pre-commit");
		}

		return existingFiles;
	}

	/**
	 * Sets up Husky git hooks.
	 * Initializes Husky, adds prepare script, and creates pre-commit hook.
	 */
	private async setupHusky(): Promise<void> {
		await this.COMMAND_SERVICE.execute("npx husky");

		await this.PACKAGE_JSON_SERVICE.addScript("prepare", "husky");

		await this.COMMAND_SERVICE.execute("mkdir -p .husky");
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/pre-commit", LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/pre-commit");
	}

	/**
	 * Sets up lint-staged configuration.
	 * Guides the user through selecting linting tools and creates necessary config files.
	 *
	 * @param savedFeatures - Previously saved lint-staged features
	 */
	private async setupLintStaged(savedFeatures: Array<ELintStagedFeature> = []): Promise<void> {
		try {
			const options: Array<ICliInterfaceServiceSelectOptions> = Object.entries(LINT_STAGED_FEATURE_CONFIG).map(([value, config]: [string, ILintStagedFeatureConfig]) => ({
				label: config.label,
				value,
			}));

			const hasValidSavedFeatures: boolean = savedFeatures.length > 0 && savedFeatures.every((feature: ELintStagedFeature) => Object.values(ELintStagedFeature).includes(feature));

			const initialValues: Array<string> = hasValidSavedFeatures ? savedFeatures : [];

			this.selectedFeatures = await this.CLI_INTERFACE_SERVICE.multiselect<ELintStagedFeature>("Select which linting tools to include:", options, true, initialValues);

			this.CLI_INTERFACE_SERVICE.startSpinner("Setting up lint-staged configuration...");
			await this.PACKAGE_JSON_SERVICE.installPackages(LINT_STAGED_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(this.selectedFeatures);
			await this.setupHusky();

			this.CLI_INTERFACE_SERVICE.stopSpinner("lint-staged configuration completed successfully!");
			this.displaySetupSummary(this.selectedFeatures);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup lint-staged configuration");

			throw error;
		}
	}
}
