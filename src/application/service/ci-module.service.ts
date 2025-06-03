import type { ICiConfigContent } from "../../domain/interface/ci-config-content.interface";
import type { ICiConfig } from "../../domain/interface/ci-config.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigCi } from "../interface/config/ci.interface";
import type { IConfigSemanticRelease } from "../interface/config/semantic-release.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { CI_CONFIG } from "../../domain/constant/ci-config.constant";
import { ECiModuleType } from "../../domain/enum/ci-module-type.enum";
import { ECiModule } from "../../domain/enum/ci-module.enum";
import { ECiProvider } from "../../domain/enum/ci-provider.enum";
import { EModule } from "../../domain/enum/module.enum";

/**
 * Service for setting up and managing Continuous Integration (CI) modules.
 * Handles the selection, configuration, and setup of CI workflows for different providers.
 */
export class CiModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Configuration service for managing app configuration */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Cached CI configuration */
	private config: IConfigCi | null = null;

	/** Selected CI modules to install */
	private selectedModules: Array<ECiModule> = [];

	/** Selected CI provider (e.g., GitHub) */
	private selectedProvider?: ECiProvider;

	/**
	 * Initializes a new instance of the CiModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 * @param configService - Service for managing app configuration
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Handles existing CI setup files.
	 * Checks for existing CI configuration files and asks for user confirmation if found.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingFiles: Array<string> = await this.findExistingCiFiles();

			if (existingFiles.length === 0) {
				return true;
			}

			this.CLI_INTERFACE_SERVICE.warn("Found existing CI configuration files that might be modified:\n" + existingFiles.map((file: string) => `- ${file}`).join("\n"));

			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to continue? This might overwrite existing files.", false);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to check existing CI setup", error);

			return false;
		}
	}

	/**
	 * Installs and configures selected CI modules.
	 * Guides the user through selecting and configuring CI modules.
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigCi>(EModule.CI);

			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			const moduleType: ECiModuleType = await this.determineModuleType(this.config?.moduleProperties?.[ECiModule.RELEASE_NPM] === true);
			this.selectedProvider = await this.selectProvider(this.config?.provider);
			this.selectedModules = await this.selectCompatibleModules(moduleType, this.config?.modules ?? []);

			if (this.selectedModules.length === 0) {
				this.CLI_INTERFACE_SERVICE.warn("No CI modules selected.");

				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.CLI_INTERFACE_SERVICE.warn("Setup cancelled by user.");

				return { wasInstalled: false };
			}

			const moduleProperties: Record<string, unknown> = await this.setupSelectedModules(this.config?.moduleProperties ?? {});

			const customProperties: Record<string, unknown> = {
				isNpmPackage: moduleType === ECiModuleType.NPM_ONLY,
				moduleProperties,
				modules: this.selectedModules,
				provider: this.selectedProvider,
			};

			return {
				customProperties,
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete CI setup", error);

			throw error;
		}
	}

	/**
	 * Determines if the CI module should be installed.
	 * Asks the user if they want to set up CI workflows.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Would you like to set up CI workflows?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.CI));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Collects module-specific properties from the user.
	 * @param module - The CI module to collect properties for
	 * @param savedProperties - Previously saved properties for this module
	 * @returns Promise resolving to a record of collected properties
	 */
	private async collectModuleProperties(module: ECiModule, savedProperties: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
		const properties: Record<string, unknown> = {};

		if (module === ECiModule.DEPENDABOT) {
			const defaultBranch: string = (savedProperties.devBranchName as string) || "dev";
			properties.devBranchName = await this.CLI_INTERFACE_SERVICE.text("Enter the target branch for Dependabot updates:", "dev", defaultBranch);
		}

		if (module === ECiModule.RELEASE || module === ECiModule.RELEASE_NPM) {
			let mainBranchDefault: string = (savedProperties.mainBranch as string) || "main";
			let isPrereleaseDefault: boolean = (savedProperties.isPrerelease as boolean) ?? false;
			let preReleaseBranchDefault: string = (savedProperties.preReleaseBranch as string) || "dev";

			if (!savedProperties.mainBranch || !Object.prototype.hasOwnProperty.call(savedProperties, "isPrerelease")) {
				// Semantic release config should already be loaded
				const semanticReleaseConfig: IConfigSemanticRelease | null = await this.CONFIG_SERVICE.getModuleConfig<IConfigSemanticRelease>(EModule.SEMANTIC_RELEASE);

				if (semanticReleaseConfig) {
					let usedSemanticReleaseConfig: boolean = false;

					if (!savedProperties.mainBranch && semanticReleaseConfig.mainBranch) {
						mainBranchDefault = semanticReleaseConfig.mainBranch;
						usedSemanticReleaseConfig = true;
					}

					if (!Object.prototype.hasOwnProperty.call(savedProperties, "isPrerelease") && Object.prototype.hasOwnProperty.call(semanticReleaseConfig, "isPrereleaseEnabled")) {
						isPrereleaseDefault = semanticReleaseConfig.isPrereleaseEnabled ?? false;
						usedSemanticReleaseConfig = true;
					}

					if (!savedProperties.preReleaseBranch && semanticReleaseConfig.preReleaseBranch) {
						preReleaseBranchDefault = semanticReleaseConfig.preReleaseBranch;
						usedSemanticReleaseConfig = true;
					}

					if (usedSemanticReleaseConfig) {
						this.CLI_INTERFACE_SERVICE.info("Found semantic-release configuration. Using its values as defaults for release CI setup.");
					}
				}
			}

			properties.mainBranch = await this.CLI_INTERFACE_SERVICE.text("Enter the name of your main release branch:", "main", mainBranchDefault);

			const shouldEnablePrerelease: boolean = await this.CLI_INTERFACE_SERVICE.confirm("Do you want to configure CI for a pre-release branch?", isPrereleaseDefault);

			if (shouldEnablePrerelease) {
				properties.isPrerelease = true;
				properties.preReleaseBranch = await this.CLI_INTERFACE_SERVICE.text("Enter the name of your pre-release branch:", "dev", preReleaseBranchDefault);
			} else {
				properties.isPrerelease = false;
			}
		}

		return properties;
	}

	/**
	 * Determines the type of CI module based on whether it's an NPM package.
	 * @param isSavedNpmPackage - Whether the package was previously saved as an NPM package
	 * @returns Promise resolving to the determined module type
	 */
	private async determineModuleType(isSavedNpmPackage: boolean = false): Promise<ECiModuleType> {
		const isConfirmedByDefault: boolean = isSavedNpmPackage ?? false;
		const isNpmPackage: boolean = await this.CLI_INTERFACE_SERVICE.confirm("Is this package going to be published to NPM?", isConfirmedByDefault);

		return isNpmPackage ? ECiModuleType.NPM_ONLY : ECiModuleType.NON_NPM;
	}

	/**
	 * Displays a summary of successful and failed CI module setups.
	 * @param successful - Array of successfully set up modules
	 * @param failed - Array of modules that failed to set up
	 */
	private displaySetupSummary(successful: Array<{ module: ECiModule }>, failed: Array<{ error?: Error; module: ECiModule }>): void {
		const summary: Array<string> = ["Successfully created configurations:", ...successful.map(({ module }: { module: ECiModule }) => `✓ ${CI_CONFIG[module].name}`)];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ error, module }: { error?: Error; module: ECiModule }) => `✗ ${CI_CONFIG[module].name} - ${error?.message ?? "Unknown error"}`));
		}

		summary.push("", "The workflows will be activated when you push to the repository.", "", "Note: Make sure to set up required secrets in your CI provider.");

		this.CLI_INTERFACE_SERVICE.note("CI Setup Summary", summary.join("\n"));
	}

	/**
	 * Extracts module-specific properties from a module configuration.
	 * @param moduleConfig - The module configuration object or boolean
	 * @returns Record of module properties, or empty object if none found
	 */
	private extractModuleProperties(moduleConfig: boolean | Record<string, unknown> | undefined): Record<string, unknown> {
		if (!moduleConfig) {
			return {};
		}

		if (typeof moduleConfig === "boolean") {
			return {};
		}

		if (typeof moduleConfig === "object" && "isEnabled" in moduleConfig) {
			const { isEnabled, ...properties }: Record<string, unknown> = moduleConfig;

			return properties;
		}

		return moduleConfig;
	}

	/**
	 * Finds existing CI configuration files that might be overwritten.
	 * @returns Promise resolving to an array of file paths for existing CI configurations
	 */
	private async findExistingCiFiles(): Promise<Array<string>> {
		if (!this.selectedProvider || !this.selectedModules || this.selectedModules.length === 0) {
			return [];
		}

		const existingFiles: Array<string> = [];

		for (const module of this.selectedModules) {
			const config: ICiConfig = CI_CONFIG[module];
			const providerConfig: ICiConfigContent = config.content[this.selectedProvider];

			if (providerConfig && (await this.FILE_SYSTEM_SERVICE.isPathExists(providerConfig.filePath))) {
				existingFiles.push(providerConfig.filePath);
			}
		}

		return existingFiles;
	}

	/**
	 * Gets a human-readable description for a CI provider.
	 * @param provider - The CI provider to get a description for
	 * @returns Description string for the provider
	 */
	private getProviderDescription(provider: ECiProvider): string {
		const descriptions: Record<ECiProvider, string> = {
			[ECiProvider.GITHUB]: "GitHub Actions - Cloud-based CI/CD",
		};

		return descriptions[provider] || provider;
	}

	/**
	 * Selects compatible CI modules based on the module type and saved configuration.
	 * @param moduleType - The type of CI module (NPM or non-NPM)
	 * @param savedModules - Previously saved modules
	 * @returns Promise resolving to an array of selected CI module enum values
	 */
	private async selectCompatibleModules(moduleType: ECiModuleType, savedModules: Array<ECiModule>): Promise<Array<ECiModule>> {
		const compatibleModules: Array<{ description: string; label: string; value: ECiModule }> = Object.entries(CI_CONFIG)
			.filter(([, config]: [string, ICiConfig]) => {
				return config.type === ECiModuleType.UNIVERSAL || config.type === moduleType;
			})
			.map(([key, config]: [string, ICiConfig]) => ({
				description: config.description,
				label: config.name,
				value: key as ECiModule,
			}));

		const compatibleValues: Set<ECiModule> = new Set<ECiModule>(compatibleModules.map((module: { description: string; label: string; value: ECiModule }) => module.value));
		const validSavedModules: Array<ECiModule> = savedModules.filter((module: ECiModule) => compatibleValues.has(module));

		return await this.CLI_INTERFACE_SERVICE.multiselect<ECiModule>("Select the CI modules you want to set up:", compatibleModules, false, validSavedModules);
	}

	/**
	 * Prompts the user to select a CI provider.
	 * @param savedProvider - Previously saved provider
	 * @returns Promise resolving to the selected CI provider
	 */
	private async selectProvider(savedProvider?: ECiProvider): Promise<ECiProvider> {
		const providers: Array<{
			description: string;
			label: string;
			value: string;
		}> = Object.values(ECiProvider).map((provider: ECiProvider) => ({
			description: this.getProviderDescription(provider),
			label: provider,
			value: provider,
		}));

		const initialProvider: ECiProvider | undefined = savedProvider ?? undefined;

		return await this.CLI_INTERFACE_SERVICE.select<ECiProvider>("Select CI provider:", providers, initialProvider);
	}

	/**
	 * Sets up a specific CI module.
	 * Creates necessary directories and configuration files.
	 * @param module - The CI module to set up
	 * @param properties - Module-specific properties to use in configuration
	 * @returns Promise resolving to an object indicating success or failure
	 */
	private async setupModule(module: ECiModule, properties: Record<string, unknown>): Promise<{ error?: Error; isSuccess: boolean; module: ECiModule }> {
		try {
			const config: ICiConfig = CI_CONFIG[module];
			// eslint-disable-next-line @elsikora/typescript/no-non-null-assertion
			const providerConfig: ICiConfigContent = config.content[this.selectedProvider!];

			if (!providerConfig) {
				throw new Error(`Provider ${this.selectedProvider} is not supported for ${config.name}`);
			}

			const directionPath: string = providerConfig.filePath.split("/").slice(0, -1).join("/");

			if (directionPath) {
				await this.FILE_SYSTEM_SERVICE.createDirectory(directionPath, {
					isRecursive: true,
				});
			}

			const content: string = providerConfig.template(properties as Record<string, string>);
			await this.FILE_SYSTEM_SERVICE.writeFile(providerConfig.filePath, content);

			return { isSuccess: true, module };
		} catch (error) {
			const formattedError: Error = error as Error;

			return { error: formattedError, isSuccess: false, module };
		}
	}

	/**
	 * Sets up all selected CI modules.
	 * Collects module properties and creates configuration files.
	 * @param savedProperties - Previously saved module properties
	 * @returns Promise resolving to a record of module properties
	 */
	private async setupSelectedModules(savedProperties: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
		if (!this.selectedProvider) {
			throw new Error("Provider not selected");
		}

		try {
			const moduleProperties: Record<string, unknown> = {};

			for (const module of this.selectedModules) {
				const savedModuleProperties: Record<string, unknown> = this.extractModuleProperties(savedProperties[module] as boolean | Record<string, unknown> | undefined);
				const properties: Record<string, unknown> = await this.collectModuleProperties(module, savedModuleProperties);

				if (Object.keys(properties).length > 0) {
					moduleProperties[module] = properties;
				}
			}

			this.CLI_INTERFACE_SERVICE.startSpinner("Setting up CI configuration...");

			const results: Array<Awaited<{ error?: Error; isSuccess: boolean; module: ECiModule }>> = await Promise.all(
				this.selectedModules.map((module: ECiModule) => {
					const setupProperties: Record<string, unknown> = (moduleProperties[module] ?? {}) as Record<string, unknown>;

					return this.setupModule(module, setupProperties);
				}),
			);

			this.CLI_INTERFACE_SERVICE.stopSpinner("CI configuration completed successfully!");

			const successfulSetups: Array<
				Awaited<{
					error?: Error;
					isSuccess: boolean;
					module: ECiModule;
				}>
			> = results.filter((r: Awaited<{ error?: Error; isSuccess: boolean; module: ECiModule }>) => r.isSuccess);

			const failedSetups: Array<Awaited<{ error?: Error; isSuccess: boolean; module: ECiModule }>> = results.filter(
				(
					r: Awaited<{
						error?: Error;
						isSuccess: boolean;
						module: ECiModule;
					}>,
				) => !r.isSuccess,
			);

			this.displaySetupSummary(successfulSetups, failedSetups);

			return moduleProperties;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			throw error;
		}
	}
}
