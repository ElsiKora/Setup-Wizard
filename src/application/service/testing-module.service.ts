import type { ITestingFrameworkConfig } from "../../domain/interface/testing-framework-config.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigTesting } from "../interface/config/testing.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { ETestingFramework } from "../../domain/enum/testing-framework.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { TESTING_CONFIG } from "../constant/testing/config.constant";
import { TESTING_CONFIG_MESSAGES } from "../constant/testing/messages.constant";
import { TESTING_E2E_TEST_PATH, TESTING_UNIT_TEST_PATH, TESTING_VITEST_CONFIG_FILES } from "../constant/testing/package-names.constant";
import { TESTING_CONFIG_SCRIPTS } from "../constant/testing/scripts.constant";
import { TESTING_FRAMEWORK_CONFIG } from "../constant/testing/testing-framework-config.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing testing configuration.
 * Supports multiple testing frameworks through configuration.
 */
export class TestingModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Command service for executing shell commands */
	readonly COMMAND_SERVICE: ICommandService;

	/** Configuration service for managing app configuration */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Cached testing configuration */
	private config: IConfigTesting | null = null;

	/**
	 * Initializes a new instance of the TestingModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 * @param configService - Service for managing app configuration
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService(cliInterfaceService);
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Handles existing testing setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [TESTING_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", TESTING_CONFIG_MESSAGES.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn(TESTING_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures the testing framework.
	 * Guides the user through setting up testing configuration.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigTesting>(EModule.TESTING);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupParameters: Record<string, string> = await this.setupTesting();

			return {
				customProperties: setupParameters,
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(TESTING_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	/**
	 * Determines if the testing framework should be installed.
	 * Asks the user if they want to set up testing configuration.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(TESTING_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.TESTING));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(TESTING_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Creates e2e test configuration file.
	 * @param framework - The selected testing framework
	 * @param isTypeScript - Whether the project uses TypeScript
	 * @param isCoverageEnabled - Whether coverage is enabled
	 */
	private async createEndToEndConfig(framework: ETestingFramework, isTypeScript: boolean, isCoverageEnabled: boolean): Promise<void> {
		const frameworkConfig: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

		// For now, use the existing Vitest template logic
		// In the future, we'll add specific generators for each framework
		if (framework === ETestingFramework.VITEST) {
			await this.FILE_SYSTEM_SERVICE.writeFile(frameworkConfig.configFiles.e2e, TESTING_CONFIG.e2eConfigTemplate(isTypeScript, isCoverageEnabled), "utf8");
		}
	}

	/**
	 * Creates test directories if they don't exist.
	 */
	private async createTestDirectories(isUnitEnabled: boolean, isEndToEndEnabled: boolean): Promise<void> {
		if (isUnitEnabled) {
			await this.FILE_SYSTEM_SERVICE.createDirectory(TESTING_UNIT_TEST_PATH, { isRecursive: true });
		}

		if (isEndToEndEnabled) {
			await this.FILE_SYSTEM_SERVICE.createDirectory(TESTING_E2E_TEST_PATH, { isRecursive: true });
		}
	}

	/**
	 * Creates unit test configuration file.
	 * @param framework - The selected testing framework
	 * @param isTypeScript - Whether the project uses TypeScript
	 * @param isCoverageEnabled - Whether coverage is enabled
	 */
	private async createUnitConfig(framework: ETestingFramework, isTypeScript: boolean, isCoverageEnabled: boolean): Promise<void> {
		const frameworkConfig: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

		// For now, use the existing Vitest template logic
		// In the future, we'll add specific generators for each framework
		if (framework === ETestingFramework.VITEST) {
			await this.FILE_SYSTEM_SERVICE.writeFile(frameworkConfig.configFiles.unit, TESTING_CONFIG.unitConfigTemplate(isTypeScript, isCoverageEnabled), "utf8");
		}
	}

	/**
	 * Displays a summary of the testing setup results.
	 * Lists configuration options, generated scripts, and files.
	 * @param framework - The selected testing framework
	 * @param isUnitEnabled - Whether unit tests are enabled
	 * @param isCoverageEnabled - Whether coverage is enabled
	 * @param isEndToEndEnabled - Whether e2e tests are enabled
	 */
	private displaySetupSummary(framework: ETestingFramework, isUnitEnabled: boolean, isCoverageEnabled: boolean, isEndToEndEnabled: boolean): void {
		const frameworkConfig: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

		const summary: Array<string> = [TESTING_CONFIG_MESSAGES.testingSummary, "", `  - Testing Framework: ${frameworkConfig.name}`];

		if (isUnitEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.unitEnabled, TESTING_CONFIG_MESSAGES.unitIncludePattern);
		}

		if (isEndToEndEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.e2eEnabled, TESTING_CONFIG_MESSAGES.e2eIncludePattern);
		}

		if (isCoverageEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.coverageEnabled, TESTING_CONFIG_MESSAGES.coverageProvider, TESTING_CONFIG_MESSAGES.coverageReporter, TESTING_CONFIG_MESSAGES.coverageInclude);
		}

		summary.push("", TESTING_CONFIG_MESSAGES.generatedScriptsLabel);

		if (isUnitEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.testUnitDescription, TESTING_CONFIG_MESSAGES.testUnitWatchDescription);

			if (isCoverageEnabled) {
				summary.push(TESTING_CONFIG_MESSAGES.testUnitCoverageDescription);
			}
		}

		if (isEndToEndEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.testE2eDescription, TESTING_CONFIG_MESSAGES.testE2eWatchDescription);
		}

		if (isUnitEnabled && isEndToEndEnabled) {
			summary.push(TESTING_CONFIG_MESSAGES.testAllDescription);
		}

		summary.push("", TESTING_CONFIG_MESSAGES.generatedFilesLabel);

		if (isUnitEnabled) {
			summary.push(`  - ${frameworkConfig.configFiles.unit}`);
		}

		if (isEndToEndEnabled) {
			summary.push(`  - ${frameworkConfig.configFiles.e2e}`);
		}

		this.CLI_INTERFACE_SERVICE.note(TESTING_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	/**
	 * Finds existing testing configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		// Check for config files from all frameworks
		for (const framework of Object.values(ETestingFramework)) {
			const config: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

			if (await this.FILE_SYSTEM_SERVICE.isPathExists(config.configFiles.unit)) {
				existingFiles.push(config.configFiles.unit);
			}

			if (await this.FILE_SYSTEM_SERVICE.isPathExists(config.configFiles.e2e)) {
				existingFiles.push(config.configFiles.e2e);
			}
		}

		// Check for generic config files
		for (const file of TESTING_VITEST_CONFIG_FILES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	/**
	 * Prompts the user if they want to enable coverage.
	 * @returns Promise resolving to true if coverage should be enabled
	 */
	private async isCoverageEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isCoverageEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(TESTING_CONFIG_MESSAGES.confirmCoverage, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to enable e2e tests.
	 * @returns Promise resolving to true if e2e tests should be enabled
	 */
	private async isEndToEndEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isE2eEnabled ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(TESTING_CONFIG_MESSAGES.confirmE2e, isConfirmedByDefault);
	}

	/**
	 * Checks if the project uses TypeScript by looking for tsconfig.json.
	 * @returns Promise resolving to true if TypeScript is detected
	 */
	private async isTypeScriptProject(): Promise<boolean> {
		return await this.FILE_SYSTEM_SERVICE.isPathExists("tsconfig.json");
	}

	/**
	 * Prompts the user if they want to enable unit tests.
	 * @returns Promise resolving to true if unit tests should be enabled
	 */
	private async isUnitEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isUnitEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(TESTING_CONFIG_MESSAGES.confirmUnit, isConfirmedByDefault);
	}

	/**
	 * Prompts the user to select a testing framework.
	 * @returns Promise resolving to the selected testing framework
	 */
	private async selectTestingFramework(): Promise<ETestingFramework> {
		const savedFramework: ETestingFramework | undefined = this.config?.framework;

		// Show all available frameworks
		const availableFrameworks: Array<{
			description: string;
			label: string;
			value: ETestingFramework;
		}> = [
			{
				description: TESTING_FRAMEWORK_CONFIG[ETestingFramework.VITEST].description,
				label: TESTING_FRAMEWORK_CONFIG[ETestingFramework.VITEST].name,
				value: ETestingFramework.VITEST,
			},
			{
				description: TESTING_FRAMEWORK_CONFIG[ETestingFramework.JEST].description,
				label: TESTING_FRAMEWORK_CONFIG[ETestingFramework.JEST].name,
				value: ETestingFramework.JEST,
			},
			{
				description: TESTING_FRAMEWORK_CONFIG[ETestingFramework.MOCHA].description,
				label: TESTING_FRAMEWORK_CONFIG[ETestingFramework.MOCHA].name,
				value: ETestingFramework.MOCHA,
			},
			{
				description: TESTING_FRAMEWORK_CONFIG[ETestingFramework.JASMINE].description,
				label: TESTING_FRAMEWORK_CONFIG[ETestingFramework.JASMINE].name,
				value: ETestingFramework.JASMINE,
			},
		];

		return await this.CLI_INTERFACE_SERVICE.select<ETestingFramework>(TESTING_CONFIG_MESSAGES.selectFrameworkPrompt, availableFrameworks, savedFramework ?? ETestingFramework.VITEST);
	}

	/**
	 * Sets up npm scripts for testing.
	 * Adds scripts for running tests, coverage, and watch mode.
	 * @param framework - The selected testing framework
	 * @param isUnitEnabled - Whether to add unit test scripts
	 * @param isCoverageEnabled - Whether to add coverage script
	 * @param isEndToEndEnabled - Whether to add e2e test scripts
	 */
	private async setupScripts(framework: ETestingFramework, isUnitEnabled: boolean, isCoverageEnabled: boolean, isEndToEndEnabled: boolean): Promise<void> {
		const frameworkConfig: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

		// Unit test scripts
		if (isUnitEnabled) {
			await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testUnit.name, TESTING_CONFIG_SCRIPTS.testUnit.command(framework, frameworkConfig.configFiles.unit));
			await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testUnitWatch.name, TESTING_CONFIG_SCRIPTS.testUnitWatch.command(framework, frameworkConfig.configFiles.unit));

			if (isCoverageEnabled) {
				await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testUnitCoverage.name, TESTING_CONFIG_SCRIPTS.testUnitCoverage.command(framework, frameworkConfig.configFiles.unit));
			}
		}

		if (isEndToEndEnabled) {
			await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testE2e.name, TESTING_CONFIG_SCRIPTS.testE2e.command(framework, frameworkConfig.configFiles.e2e));
			await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testE2eWatch.name, TESTING_CONFIG_SCRIPTS.testE2eWatch.command(framework, frameworkConfig.configFiles.e2e));
		}

		if (isUnitEnabled && isEndToEndEnabled) {
			await this.PACKAGE_JSON_SERVICE.addScript(TESTING_CONFIG_SCRIPTS.testAll.name, TESTING_CONFIG_SCRIPTS.testAll.command());
		}
	}

	/**
	 * Sets up testing configuration.
	 * Collects user input, installs dependencies, creates config files,
	 * and sets up scripts.
	 * @returns Promise resolving to an object containing setup parameters
	 */
	private async setupTesting(): Promise<Record<string, string>> {
		try {
			const parameters: Record<string, unknown> = {};

			// Select testing framework
			const framework: ETestingFramework = await this.selectTestingFramework();
			parameters.framework = framework;

			const frameworkConfig: ITestingFrameworkConfig = TESTING_FRAMEWORK_CONFIG[framework];

			// Detect TypeScript
			const isTypeScript: boolean = await this.isTypeScriptProject();
			parameters.isTypeScript = isTypeScript;

			// Get configuration options from user
			const isUnitEnabled: boolean = await this.isUnitEnabled();
			parameters.isUnitEnabled = isUnitEnabled;

			const isEndToEndEnabled: boolean = await this.isEndToEndEnabled();
			parameters.isEndToEndEnabled = isEndToEndEnabled;

			// Only ask about coverage if at least one test type is enabled
			let isCoverageEnabled: boolean = false;

			if (isUnitEnabled || isEndToEndEnabled) {
				isCoverageEnabled = await this.isCoverageEnabled();
				parameters.isCoverageEnabled = isCoverageEnabled;
			}

			// Install and configure
			this.CLI_INTERFACE_SERVICE.startSpinner(TESTING_CONFIG_MESSAGES.settingUpSpinner);

			// Create test directories
			await this.createTestDirectories(isUnitEnabled, isEndToEndEnabled);

			// Install core dependencies
			await this.PACKAGE_JSON_SERVICE.installPackages([...frameworkConfig.coreDependencies], "latest", EPackageJsonDependencyType.DEV);

			// Install optional dependencies
			const optionalDeps: Array<string> = [];

			if (isCoverageEnabled && frameworkConfig.optionalDependencies.coverage) {
				optionalDeps.push(frameworkConfig.optionalDependencies.coverage);
			}

			if (isTypeScript && frameworkConfig.optionalDependencies.typescript) {
				optionalDeps.push(frameworkConfig.optionalDependencies.typescript);
			}

			if (optionalDeps.length > 0) {
				await this.PACKAGE_JSON_SERVICE.installPackages(optionalDeps, "latest", EPackageJsonDependencyType.DEV);
			}

			// Create configuration files
			if (isUnitEnabled) {
				await this.createUnitConfig(framework, isTypeScript, isCoverageEnabled);
			}

			if (isEndToEndEnabled) {
				await this.createEndToEndConfig(framework, isTypeScript, isCoverageEnabled);
			}

			await this.setupScripts(framework, isUnitEnabled, isCoverageEnabled, isEndToEndEnabled);

			this.CLI_INTERFACE_SERVICE.stopSpinner(TESTING_CONFIG_MESSAGES.setupCompleteSpinner);
			this.displaySetupSummary(framework, isUnitEnabled, isCoverageEnabled, isEndToEndEnabled);

			return parameters as Record<string, string>;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(TESTING_CONFIG_MESSAGES.failedSetupSpinner);

			throw error;
		}
	}
}
