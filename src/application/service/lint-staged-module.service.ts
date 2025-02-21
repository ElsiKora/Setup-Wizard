import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { ILintStagedFeatureConfig } from "../../domain/interface/lint-staged-feature-config.interface";
import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfig } from "../interface/config.interface";
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

export class LintStagedModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly COMMAND_SERVICE: ICommandService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	private readonly CONFIG_SERVICE: ConfigService;

	private selectedFeatures: Array<ELintStagedFeature> = [];

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

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

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const savedConfig: { features?: Array<ELintStagedFeature> } | null = await this.getSavedConfig();
			const savedFeatures: Array<ELintStagedFeature> = savedConfig?.features ?? [];

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

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up lint-staged with Husky pre-commit hooks?", true);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private async createConfigs(selectedFeatures: Array<ELintStagedFeature>): Promise<void> {
		const config: string = LINT_STAGED_CONFIG.template(selectedFeatures);
		await this.FILE_SYSTEM_SERVICE.writeFile("lint-staged.config.js", config, "utf8");
	}

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

	private async getSavedConfig(): Promise<{ features?: Array<ELintStagedFeature> } | null> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.LINT_STAGED]) {
					return config[EModule.LINT_STAGED] as { features?: Array<ELintStagedFeature> };
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	private async setupHusky(): Promise<void> {
		await this.COMMAND_SERVICE.execute("npx husky install");

		await this.PACKAGE_JSON_SERVICE.addScript("prepare", "husky install");

		await this.COMMAND_SERVICE.execute("mkdir -p .husky");
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/pre-commit", LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/pre-commit");
	}

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
