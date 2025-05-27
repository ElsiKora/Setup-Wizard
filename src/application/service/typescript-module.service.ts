import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigTypescript } from "../interface/config/typescript.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { TYPESCRIPT_CONFIG_FILE_NAME } from "../constant/typescript/config-file-name.constant";
import { TYPESCRIPT_CONFIG } from "../constant/typescript/config.constant";
import { TYPESCRIPT_CONFIG_CORE_DEPENDENCIES } from "../constant/typescript/core-dependencies.constant";
import { TYPESCRIPT_CONFIG_FILE_NAMES } from "../constant/typescript/file-names.constant";
import { TYPESCRIPT_CONFIG_MESSAGES } from "../constant/typescript/messages.constant";
import { TYPESCRIPT_CONFIG_SCRIPTS } from "../constant/typescript/scripts.constant";
import { TYPESCRIPT_CONFIG_SUMMARY } from "../constant/typescript/summary.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing TypeScript configuration.
 * Provides functionality to configure TypeScript compiler options,
 * clean architecture paths, and decorator support.
 */
export class TypescriptModuleService implements IModuleService {
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

	/** Cached TypeScript configuration */
	private config: IConfigTypescript | null = null;

	/**
	 * Initializes a new instance of the TypescriptModuleService.
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
	 * Handles existing TypeScript setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [TYPESCRIPT_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", TYPESCRIPT_CONFIG_MESSAGES.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn(TYPESCRIPT_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures TypeScript.
	 * Guides the user through setting up TypeScript compiler options.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigTypescript>(EModule.TYPESCRIPT);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupParameters: Record<string, string> = await this.setupTypescript();

			return {
				customProperties: setupParameters,
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(TYPESCRIPT_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	/**
	 * Determines if TypeScript should be installed.
	 * Asks the user if they want to set up TypeScript configuration.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(TYPESCRIPT_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.TYPESCRIPT));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(TYPESCRIPT_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Creates TypeScript configuration file.
	 * Generates the tsconfig.json file with user-specified options.
	 * @param baseUrl - The base URL for module resolution
	 * @param rootDirectory - The root directory of source files
	 * @param outputDirectory - The output directory for compiled files
	 * @param isCleanArchitectureEnabled - Whether to enable clean architecture paths
	 * @param isDecoratorsEnabled - Whether to enable decorator support
	 */
	private async createConfig(baseUrl: string, rootDirectory: string, outputDirectory: string, isCleanArchitectureEnabled: boolean, isDecoratorsEnabled: boolean): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(TYPESCRIPT_CONFIG_FILE_NAME, TYPESCRIPT_CONFIG.template(baseUrl, rootDirectory, outputDirectory, isCleanArchitectureEnabled, isDecoratorsEnabled), "utf8");
	}

	/**
	 * Displays a summary of the TypeScript setup results.
	 * Lists configuration options, generated scripts, and files.
	 * @param baseUrl - The configured base URL
	 * @param rootDirectory - The configured root directory
	 * @param outputDirectory - The configured output directory
	 * @param isCleanArchitectureEnabled - Whether clean architecture was enabled
	 * @param isDecoratorsEnabled - Whether decorators were enabled
	 */
	private displaySetupSummary(baseUrl: string, rootDirectory: string, outputDirectory: string, isCleanArchitectureEnabled: boolean, isDecoratorsEnabled: boolean): void {
		const summary: Array<string> = [TYPESCRIPT_CONFIG_MESSAGES.configurationCreated, "", TYPESCRIPT_CONFIG_MESSAGES.configurationOptionsLabel, TYPESCRIPT_CONFIG_MESSAGES.summaryBaseUrl(baseUrl), TYPESCRIPT_CONFIG_MESSAGES.summaryRootDir(rootDirectory), TYPESCRIPT_CONFIG_MESSAGES.summaryOutputDir(outputDirectory)];

		if (isCleanArchitectureEnabled) {
			summary.push(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled);
		}

		if (isDecoratorsEnabled) {
			summary.push(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled);
		}

		summary.push("", TYPESCRIPT_CONFIG_MESSAGES.generatedScriptsLabel, TYPESCRIPT_CONFIG_MESSAGES.tscBuildDescription, TYPESCRIPT_CONFIG_MESSAGES.tscCheckDescription, "", TYPESCRIPT_CONFIG_MESSAGES.generatedFilesLabel, `• ${TYPESCRIPT_CONFIG_FILE_NAME}`);

		this.CLI_INTERFACE_SERVICE.note(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	/**
	 * Finds existing TypeScript configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of TYPESCRIPT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	/**
	 * Prompts the user for the base URL configuration.
	 * @returns Promise resolving to the base URL
	 */
	private async getBaseUrl(): Promise<string> {
		const initialValue: string = this.config?.baseUrl ?? TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault;

		return await this.CLI_INTERFACE_SERVICE.text(TYPESCRIPT_CONFIG_MESSAGES.baseUrlPrompt, TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault, initialValue, (value: string) => {
			if (!value) {
				return TYPESCRIPT_CONFIG_MESSAGES.baseUrlRequired;
			}

			return !value.startsWith("./") && !value.startsWith("../") && value !== "." ? TYPESCRIPT_CONFIG_MESSAGES.baseUrlValidation : undefined;
		});
	}

	/**
	 * Prompts the user for the output directory configuration.
	 * @returns Promise resolving to the output directory
	 */
	private async getOutDir(): Promise<string> {
		const initialValue: string = this.config?.outputDirectory ?? TYPESCRIPT_CONFIG_SUMMARY.outDirDefault;

		return await this.CLI_INTERFACE_SERVICE.text(TYPESCRIPT_CONFIG_MESSAGES.outDirPrompt, TYPESCRIPT_CONFIG_SUMMARY.outDirDefault, initialValue, (value: string) => {
			if (!value) {
				return TYPESCRIPT_CONFIG_MESSAGES.outDirRequired;
			}

			return !value.startsWith("./") && !value.startsWith("../") && value !== "." ? TYPESCRIPT_CONFIG_MESSAGES.outDirValidation : undefined;
		});
	}

	/**
	 * Prompts the user for the root directory configuration.
	 * @returns Promise resolving to the root directory
	 */
	private async getRootDir(): Promise<string> {
		const initialValue: string = this.config?.rootDirectory ?? TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault;

		return await this.CLI_INTERFACE_SERVICE.text(TYPESCRIPT_CONFIG_MESSAGES.rootDirPrompt, TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault, initialValue, (value: string) => {
			if (!value) {
				return TYPESCRIPT_CONFIG_MESSAGES.rootDirRequired;
			}

			return !value.startsWith("./") && !value.startsWith("../") && value !== "." ? TYPESCRIPT_CONFIG_MESSAGES.rootDirValidation : undefined;
		});
	}

	/**
	 * Prompts the user if they want to use clean architecture.
	 * @returns Promise resolving to true if clean architecture should be enabled
	 */
	private async isCleanArchitectureEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isCleanArchitectureEnabled === true;

		this.CLI_INTERFACE_SERVICE.info(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureInfo);

		return await this.CLI_INTERFACE_SERVICE.confirm(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to enable decorators.
	 * @returns Promise resolving to true if decorators should be enabled
	 */
	private async isDecoratorsEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isDecoratorsEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm(TYPESCRIPT_CONFIG_MESSAGES.confirmDecorators, isConfirmedByDefault);
	}

	/**
	 * Sets up npm scripts for TypeScript.
	 * Adds scripts for building and type checking.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript(TYPESCRIPT_CONFIG_SCRIPTS.buildTypes.name, TYPESCRIPT_CONFIG_SCRIPTS.buildTypes.command);
		await this.PACKAGE_JSON_SERVICE.addScript(TYPESCRIPT_CONFIG_SCRIPTS.lintTypes.name, TYPESCRIPT_CONFIG_SCRIPTS.lintTypes.command);
	}

	/**
	 * Sets up TypeScript configuration.
	 * Collects user input, installs dependencies, creates config file,
	 * and sets up scripts.
	 * @returns Promise resolving to an object containing setup parameters
	 */
	private async setupTypescript(): Promise<Record<string, string>> {
		try {
			const parameters: Record<string, unknown> = {};

			// Get configuration options from user
			const baseUrl: string = await this.getBaseUrl();
			parameters.baseUrl = baseUrl;

			const rootDirectory: string = await this.getRootDir();
			parameters.rootDirectory = rootDirectory;

			const outputDirectory: string = await this.getOutDir();
			parameters.outputDirectory = outputDirectory;

			const isCleanArchitectureEnabled: boolean = await this.isCleanArchitectureEnabled();
			parameters.isCleanArchitectureEnabled = isCleanArchitectureEnabled;

			const isDecoratorsEnabled: boolean = await this.isDecoratorsEnabled();
			parameters.isDecoratorsEnabled = isDecoratorsEnabled;

			// Install and configure
			this.CLI_INTERFACE_SERVICE.startSpinner(TYPESCRIPT_CONFIG_MESSAGES.settingUpSpinner);
			await this.PACKAGE_JSON_SERVICE.installPackages(TYPESCRIPT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfig(baseUrl, rootDirectory, outputDirectory, isCleanArchitectureEnabled, isDecoratorsEnabled);
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteSpinner);
			this.displaySetupSummary(baseUrl, rootDirectory, outputDirectory, isCleanArchitectureEnabled, isDecoratorsEnabled);

			return parameters as Record<string, string>;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(TYPESCRIPT_CONFIG_MESSAGES.failedSetupSpinner);

			throw error;
		}
	}
}
