import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigBuilder } from "../interface/config/builder.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { BUILDER_CONFIG_FILE_NAME } from "../constant/builder/config-file-name.constant";
import { BUILDER_CONFIG } from "../constant/builder/config.constant";
import { BUILDER_CONFIG_CORE_DEPENDENCIES, BUILDER_CONFIG_OPTIONAL_DEPENDENCIES } from "../constant/builder/core-dependencies.constant";
import { BUILDER_CONFIG_FILE_NAMES } from "../constant/builder/file-names.constant";
import { BUILDER_CONFIG_MESSAGES } from "../constant/builder/messages.constant";
import { BUILDER_CONFIG_SCRIPTS } from "../constant/builder/scripts.constant";
import { BUILDER_CONFIG_SUMMARY } from "../constant/builder/summary.constant";

import { PackageJsonService } from "./package-json.service";

/**
 * Service for setting up and managing build tool configuration.
 * Currently supports Rollup as the build tool.
 */
export class BuilderModuleService implements IModuleService {
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

	/** Cached builder configuration */
	private config: IConfigBuilder | null = null;

	/**
	 * Initializes a new instance of the BuilderModuleService.
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
	 * Handles existing build tool setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [BUILDER_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			for (const file of existingFiles) {
				messageLines.push(`- ${file}`);
			}

			messageLines.push("", BUILDER_CONFIG_MESSAGES.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn(BUILDER_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures the build tool.
	 * Guides the user through setting up build configuration.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigBuilder>(EModule.BUILDER);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupParameters: Record<string, string> = await this.setupBuilder();

			return {
				customProperties: setupParameters,
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(BUILDER_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	/**
	 * Determines if the build tool should be installed.
	 * Asks the user if they want to set up build tool configuration.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.BUILDER));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(BUILDER_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Creates tsconfig.build.json if requested.
	 */
	private async createBuildTsconfig(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile("tsconfig.build.json", BUILDER_CONFIG.buildTsconfigTemplate(), "utf8");
	}

	/**
	 * Creates build tool configuration file.
	 * Generates the rollup.config.js file with user-specified options.
	 * @param entryPoint - The entry point file for the build
	 * @param outputDirectory - The output directory for built files
	 * @param formats - The output formats to generate
	 * @param isSourceMapsEnabled - Whether to generate source maps
	 * @param isMinifyEnabled - Whether to minify the output
	 * @param isCliApp - Whether this is a CLI application
	 * @param isPathAliasEnabled - Whether to use path aliases
	 * @param isDecoratorsEnabled - Whether decorators are used
	 * @param isPackageJsonGenerationEnabled - Whether to generate package.json
	 */
	private async createConfig(entryPoint: string, outputDirectory: string, formats: Array<string>, isSourceMapsEnabled: boolean, isMinifyEnabled: boolean, isCliApp: boolean, isPathAliasEnabled: boolean, isDecoratorsEnabled: boolean, isPackageJsonGenerationEnabled: boolean, isCommonjsEnabled: boolean): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(BUILDER_CONFIG_FILE_NAME, BUILDER_CONFIG.template(entryPoint, outputDirectory, formats, isSourceMapsEnabled, isMinifyEnabled, isCliApp, isPathAliasEnabled, isDecoratorsEnabled, isPackageJsonGenerationEnabled, isCommonjsEnabled), "utf8");
	}

	/**
	 * Displays a summary of the build tool setup results.
	 * Lists configuration options, generated scripts, and files.
	 * @param tool - The selected build tool
	 * @param entryPoint - The configured entry point
	 * @param outputDirectory - The configured output directory
	 * @param formats - The selected output formats
	 * @param isSourceMapsEnabled - Whether source maps are enabled
	 * @param isMinifyEnabled - Whether minification is enabled
	 * @param isCleanEnabled - Whether clean is enabled
	 * @param isCliApp - Whether this is a CLI app
	 * @param isPathAliasEnabled - Whether path aliases are enabled
	 * @param isDecoratorsEnabled - Whether decorators are enabled
	 * @param isPackageJsonGenerationEnabled - Whether package.json generation is enabled
	 * @param isBuildTsconfigEnabled - Whether build tsconfig was created
	 */
	private displaySetupSummary(tool: string, entryPoint: string, outputDirectory: string, formats: Array<string>, isSourceMapsEnabled: boolean, isMinifyEnabled: boolean, isCleanEnabled: boolean, isCliApp: boolean, isPathAliasEnabled: boolean, isDecoratorsEnabled: boolean, isPackageJsonGenerationEnabled: boolean, isBuildTsconfigEnabled: boolean): void {
		const summary: Array<string> = [BUILDER_CONFIG_MESSAGES.configurationCreated, "", BUILDER_CONFIG_MESSAGES.configurationOptionsLabel, BUILDER_CONFIG_MESSAGES.summaryTool(tool), BUILDER_CONFIG_MESSAGES.summaryEntryPoint(entryPoint), BUILDER_CONFIG_MESSAGES.summaryOutputDirectory(outputDirectory), BUILDER_CONFIG_MESSAGES.summaryFormats(formats.join(", "))];

		if (isCliApp) {
			summary.push(BUILDER_CONFIG_MESSAGES.summaryCliApp);
		}

		if (isSourceMapsEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
		}

		if (isMinifyEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.minifyEnabled);
		}

		if (isCleanEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.cleanEnabled);
		}

		if (isPathAliasEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.pathAliasEnabled);
		}

		if (isDecoratorsEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.decoratorsEnabled);
		}

		if (isPackageJsonGenerationEnabled) {
			summary.push(BUILDER_CONFIG_MESSAGES.packageJsonGenerationEnabled);
		}

		summary.push("", BUILDER_CONFIG_MESSAGES.generatedScriptsLabel, BUILDER_CONFIG_MESSAGES.rollupBuildDescription, BUILDER_CONFIG_MESSAGES.rollupWatchDescription, "", BUILDER_CONFIG_MESSAGES.generatedFilesLabel, `• ${BUILDER_CONFIG_FILE_NAME}`);

		if (isBuildTsconfigEnabled) {
			summary.push("• tsconfig.build.json");
		}

		this.CLI_INTERFACE_SERVICE.note(BUILDER_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	/**
	 * Finds existing build tool configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of BUILDER_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	/**
	 * Prompts the user for the entry point configuration.
	 * @returns Promise resolving to the entry point
	 */
	private async getEntryPoint(): Promise<string> {
		const initialValue: string = this.config?.entryPoint ?? BUILDER_CONFIG_SUMMARY.entryPointDefault;

		return await this.CLI_INTERFACE_SERVICE.text(BUILDER_CONFIG_MESSAGES.entryPointPrompt, BUILDER_CONFIG_SUMMARY.entryPointDefault, initialValue, (value: string) => {
			if (!value) {
				return BUILDER_CONFIG_MESSAGES.entryPointRequired;
			}

			return /\.(?:js|mjs|cjs|ts|tsx)$/.test(value) ? undefined : BUILDER_CONFIG_MESSAGES.entryPointValidation;
		});
	}

	/**
	 * Prompts the user for the output directory configuration.
	 * @param isCliApp - Whether this is a CLI application
	 * @returns Promise resolving to the output directory
	 */
	private async getOutputDirectory(isCliApp: boolean): Promise<string> {
		const defaultDirectory: string = isCliApp ? BUILDER_CONFIG_SUMMARY.outputDirDefaultCli : BUILDER_CONFIG_SUMMARY.outputDirDefault;
		const initialValue: string = this.config?.outputDirectory ?? defaultDirectory;

		return await this.CLI_INTERFACE_SERVICE.text(BUILDER_CONFIG_MESSAGES.outputDirPrompt, defaultDirectory, initialValue, (value: string) => {
			if (!value) {
				return BUILDER_CONFIG_MESSAGES.outputDirRequired;
			}

			return !value.startsWith("./") && !value.startsWith("../") && value !== "." ? BUILDER_CONFIG_MESSAGES.outputDirValidation : undefined;
		});
	}

	/**
	 * Prompts the user to select output formats.
	 * @param isCliApp - Whether this is a CLI application
	 * @returns Promise resolving to the selected formats
	 */
	private async getOutputFormats(isCliApp: boolean): Promise<Array<string>> {
		if (isCliApp) {
			// For CLI apps, let them choose a single format
			const formatOptions: Array<{ hint: string; label: string; value: string }> = [
				{ hint: "Modern JavaScript modules", label: "ESM (ECMAScript Modules)", value: "esm" },
				{ hint: "Node.js compatible", label: "CommonJS", value: "cjs" },
			];

			const selected: string = await this.CLI_INTERFACE_SERVICE.select(BUILDER_CONFIG_MESSAGES.formatPromptCli, formatOptions, this.config?.formats?.[0] ?? "esm");

			return [selected];
		}

		const defaultFormats: Array<string> = this.config?.formats ?? BUILDER_CONFIG_SUMMARY.formatsDefault;

		const formatOptions: Array<{ hint: string; label: string; value: string }> = [
			{ hint: "Modern JavaScript modules", label: "ESM (ECMAScript Modules)", value: "esm" },
			{ hint: "Node.js compatible", label: "CommonJS", value: "cjs" },
			{ hint: "Works everywhere", label: "UMD (Universal Module Definition)", value: "umd" },
			{ hint: "For browsers", label: "IIFE (Immediately Invoked Function Expression)", value: "iife" },
		];

		const selected: Array<string> = await this.CLI_INTERFACE_SERVICE.multiselect<string>(BUILDER_CONFIG_MESSAGES.formatsPrompt, formatOptions, true, defaultFormats);

		if (!selected || selected.length === 0) {
			throw new Error(BUILDER_CONFIG_MESSAGES.formatsRequired);
		}

		return selected;
	}

	/**
	 * Prompts the user if they want a separate build tsconfig.
	 * @param entryPoint - The entry point to check if TypeScript
	 * @param isCliApp - Whether this is a CLI application
	 * @returns Promise resolving to true if build tsconfig should be created
	 */
	private async isBuildTsconfigEnabled(entryPoint: string, isCliApp: boolean): Promise<boolean> {
		// Only ask for TypeScript projects that are not CLI apps
		if (isCliApp || (!entryPoint.endsWith(".ts") && !entryPoint.endsWith(".tsx"))) {
			return false;
		}

		const isConfirmedByDefault: boolean = this.config?.isBuildTsconfigEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmBuildTsconfig, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to clean the output directory before build.
	 * @returns Promise resolving to true if output directory should be cleaned
	 */
	private async isCleanEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isCleanEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmClean, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if this is a CLI application.
	 * @returns Promise resolving to true if this is a CLI app
	 */
	private async isCliApp(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isCliApp ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmCliApp, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they need CommonJS plugin support.
	 * @returns Promise resolving to true if CommonJS plugin should be included
	 */
	private async isCommonjsEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isCommonjsEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmCommonjs, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they use decorators.
	 * @returns Promise resolving to true if decorators are used
	 */
	private async isDecoratorsEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isDecoratorsEnabled ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmDecorators, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to minify the output.
	 * @returns Promise resolving to true if output should be minified
	 */
	private async isMinifyEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isMinifyEnabled ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmMinify, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to generate package.json files.
	 * @param isCliApp - Whether this is a CLI application
	 * @returns Promise resolving to true if package.json should be generated
	 */
	private async isPackageJsonGenerationEnabled(isCliApp: boolean): Promise<boolean> {
		if (isCliApp) {
			// CLI apps don't need package.json generation
			return false;
		}

		const isConfirmedByDefault: boolean = this.config?.isPackageJsonGenerationEnabled ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmPackageJsonGeneration, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to use path aliases.
	 * @param entryPoint - The entry point to check if TypeScript
	 * @returns Promise resolving to true if path aliases should be used
	 */
	private async isPathAliasEnabled(entryPoint: string): Promise<boolean> {
		// Only ask for TypeScript projects
		if (!entryPoint.endsWith(".ts") && !entryPoint.endsWith(".tsx")) {
			return false;
		}

		const isConfirmedByDefault: boolean = this.config?.isPathAliasEnabled ?? false;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmPathAlias, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to generate source maps.
	 * @returns Promise resolving to true if source maps should be generated
	 */
	private async isSourceMapsEnabled(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isSourceMapsEnabled ?? true;

		return await this.CLI_INTERFACE_SERVICE.confirm(BUILDER_CONFIG_MESSAGES.confirmSourceMaps, isConfirmedByDefault);
	}

	/**
	 * Sets up build tool configuration.
	 * Collects user input, installs dependencies, creates config file,
	 * and sets up scripts.
	 * @returns Promise resolving to an object containing setup parameters
	 */
	private async setupBuilder(): Promise<Record<string, string>> {
		try {
			const parameters: Record<string, unknown> = {};

			// For now, we only support Rollup
			const tool: string = "rollup";
			parameters.tool = tool;

			// Ask if CLI app first as it affects other prompts
			const isCliApp: boolean = await this.isCliApp();
			parameters.isCliApp = isCliApp;

			// Get configuration options from user
			const entryPoint: string = await this.getEntryPoint();
			parameters.entryPoint = entryPoint;

			const outputDirectory: string = await this.getOutputDirectory(isCliApp);
			parameters.outputDirectory = outputDirectory;

			const formats: Array<string> = await this.getOutputFormats(isCliApp);
			parameters.formats = formats;

			const isSourceMapsEnabled: boolean = await this.isSourceMapsEnabled();
			parameters.isSourceMapsEnabled = isSourceMapsEnabled;

			const isMinifyEnabled: boolean = await this.isMinifyEnabled();
			parameters.isMinifyEnabled = isMinifyEnabled;

			const isCleanEnabled: boolean = await this.isCleanEnabled();
			parameters.isCleanEnabled = isCleanEnabled;

			const isCommonjsEnabled: boolean = await this.isCommonjsEnabled();
			parameters.isCommonjsEnabled = isCommonjsEnabled;

			const isPathAliasEnabled: boolean = await this.isPathAliasEnabled(entryPoint);
			parameters.isPathAliasEnabled = isPathAliasEnabled;

			const isDecoratorsEnabled: boolean = await this.isDecoratorsEnabled();
			parameters.isDecoratorsEnabled = isDecoratorsEnabled;

			const isPackageJsonGenerationEnabled: boolean = await this.isPackageJsonGenerationEnabled(isCliApp);
			parameters.isPackageJsonGenerationEnabled = isPackageJsonGenerationEnabled;

			const isBuildTsconfigEnabled: boolean = await this.isBuildTsconfigEnabled(entryPoint, isCliApp);
			parameters.isBuildTsconfigEnabled = isBuildTsconfigEnabled;

			// Install and configure
			this.CLI_INTERFACE_SERVICE.startSpinner(BUILDER_CONFIG_MESSAGES.settingUpSpinner);

			// Install core dependencies
			await this.PACKAGE_JSON_SERVICE.installPackages([...BUILDER_CONFIG_CORE_DEPENDENCIES], "latest", EPackageJsonDependencyType.DEV);

			// Install optional dependencies
			const optionalDeps: Array<string> = [];

			if (isPathAliasEnabled) {
				optionalDeps.push(BUILDER_CONFIG_OPTIONAL_DEPENDENCIES.pathAlias);
			}

			if (isPackageJsonGenerationEnabled) {
				optionalDeps.push(BUILDER_CONFIG_OPTIONAL_DEPENDENCIES.packageJsonGeneration);
			}

			if (optionalDeps.length > 0) {
				await this.PACKAGE_JSON_SERVICE.installPackages(optionalDeps, "latest", EPackageJsonDependencyType.DEV);
			}

			// Create configuration files
			await this.createConfig(entryPoint, outputDirectory, formats, isSourceMapsEnabled, isMinifyEnabled, isCliApp, isPathAliasEnabled, isDecoratorsEnabled, isPackageJsonGenerationEnabled, isCommonjsEnabled);

			if (isBuildTsconfigEnabled) {
				await this.createBuildTsconfig();
			}

			await this.setupScripts(isCleanEnabled);

			this.CLI_INTERFACE_SERVICE.stopSpinner(BUILDER_CONFIG_MESSAGES.setupCompleteSpinner);
			this.displaySetupSummary(tool, entryPoint, outputDirectory, formats, isSourceMapsEnabled, isMinifyEnabled, isCleanEnabled, isCliApp, isPathAliasEnabled, isDecoratorsEnabled, isPackageJsonGenerationEnabled, isBuildTsconfigEnabled);

			return parameters as Record<string, string>;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(BUILDER_CONFIG_MESSAGES.failedSetupSpinner);

			throw error;
		}
	}

	/**
	 * Sets up npm scripts for the build tool.
	 * Adds scripts for building and watching.
	 * @param isCleanEnabled - Whether to add prebuild clean script
	 */
	private async setupScripts(isCleanEnabled: boolean): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript(BUILDER_CONFIG_SCRIPTS.build.name, BUILDER_CONFIG_SCRIPTS.build.command);
		await this.PACKAGE_JSON_SERVICE.addScript(BUILDER_CONFIG_SCRIPTS.buildWatch.name, BUILDER_CONFIG_SCRIPTS.buildWatch.command);

		if (isCleanEnabled) {
			await this.PACKAGE_JSON_SERVICE.addScript(BUILDER_CONFIG_SCRIPTS.prebuild.name, BUILDER_CONFIG_SCRIPTS.prebuild.command);
		}
	}
}
