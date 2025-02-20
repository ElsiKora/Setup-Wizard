import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { ECiProvider } from "../../domain/enum/ci-provider.enum";
import { ECiModule } from "../../domain/enum/ci-module.enum";
import { CI_CONFIG } from "../../domain/constant/ci-config.constant";
import { ECiModuleType } from "../../domain/enum/ci-module-type.enum";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
import { ConfigService } from "./config.service";
import { EModule } from "../../domain/enum/module.enum";

export class CiModuleService implements IModuleService {
	private selectedProvider?: ECiProvider;
	private selectedModules: ECiModule[] = [];
	private readonly configService: ConfigService;

	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {
		this.configService = new ConfigService(fileSystemService);
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			const savedConfig = await this.getSavedConfig();

			const moduleType = await this.determineModuleType(savedConfig?.isNpmPackage);
			this.selectedProvider = await this.selectProvider(savedConfig?.provider);
			this.selectedModules = await this.selectCompatibleModules(moduleType, savedConfig?.modules || []);

			if (this.selectedModules.length === 0) {
				this.cliInterfaceService.warn("No CI modules selected.");
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.cliInterfaceService.warn("Setup cancelled by user.");
				return { wasInstalled: false };
			}

			const moduleProperties = await this.setupSelectedModules(savedConfig?.moduleProperties || {});

			const customProperties: Record<string, any> = {
				provider: this.selectedProvider,
				modules: this.selectedModules,
				moduleProperties,
				isNpmPackage: moduleType === ECiModuleType.NPM_ONLY,
			};

			return {
				wasInstalled: true,
				customProperties,
			};
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete CI setup", error);
			throw error;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingFiles = await this.findExistingCiFiles();

			if (existingFiles.length === 0) {
				return true;
			}

			this.cliInterfaceService.warn("Found existing CI configuration files that might be modified:\n" + existingFiles.map((file) => `- ${file}`).join("\n"));

			return await this.cliInterfaceService.confirm("Do you want to continue? This might overwrite existing files.", false);
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to check existing CI setup", error);
			return false;
		}
	}

	private async findExistingCiFiles(): Promise<string[]> {
		if (!this.selectedProvider || !this.selectedModules || this.selectedModules.length === 0) {
			return [];
		}

		const existingFiles: string[] = [];

		for (const module of this.selectedModules) {
			const config = CI_CONFIG[module];
			const providerConfig = config.content[this.selectedProvider];

			if (providerConfig && (await this.fileSystemService.isPathExists(providerConfig.filePath))) {
				existingFiles.push(providerConfig.filePath);
			}
		}

		return existingFiles;
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.cliInterfaceService.confirm("Would you like to set up CI workflows?");
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	private async determineModuleType(savedIsNpmPackage?: boolean): Promise<ECiModuleType> {
		const defaultValue = savedIsNpmPackage !== undefined ? savedIsNpmPackage : false;
		const isNpmPackage = await this.cliInterfaceService.confirm("Is this package going to be published to NPM?", defaultValue);

		return isNpmPackage ? ECiModuleType.NPM_ONLY : ECiModuleType.NON_NPM;
	}

	private async selectProvider(savedProvider?: ECiProvider): Promise<ECiProvider> {
		const providers = Object.values(ECiProvider).map((provider) => ({
			label: provider,
			value: provider,
			description: this.getProviderDescription(provider),
		}));

		const initialProvider = savedProvider || undefined;
		return await this.cliInterfaceService.select<ECiProvider>("Select CI provider:", providers, initialProvider);
	}

	private getProviderDescription(provider: ECiProvider): string {
		const descriptions: Record<ECiProvider, string> = {
			[ECiProvider.GITHUB]: "GitHub Actions - Cloud-based CI/CD",
		};
		return descriptions[provider] || provider;
	}

	private async selectCompatibleModules(moduleType: ECiModuleType, savedModules: ECiModule[]): Promise<ECiModule[]> {
		const compatibleModules = Object.entries(CI_CONFIG)
			.filter(([_, config]) => {
				return config.type === ECiModuleType.UNIVERSAL || config.type === moduleType;
			})
			.map(([key, config]) => ({
				label: config.name,
				value: key as ECiModule,
				description: config.description,
			}));

		const compatibleValues = compatibleModules.map((module) => module.value);
		const validSavedModules = savedModules.filter((module) => compatibleValues.includes(module));

		return await this.cliInterfaceService.multiselect<ECiModule>("Select the CI modules you want to set up:", compatibleModules, false, validSavedModules);
	}

	private async setupSelectedModules(savedProperties: Record<string, any> = {}): Promise<Record<string, any>> {
		if (!this.selectedProvider) {
			throw new Error("Provider not selected");
		}

		try {
			const moduleProperties: Record<string, any> = {};

			for (const module of this.selectedModules) {
				// Get only actual properties, not the isEnabled flag
				const savedModuleProps = this.extractModuleProperties(savedProperties[module]);
				const properties = await this.collectModuleProperties(module, savedModuleProps);

				// Only store properties if they exist, don't use boolean flags
				if (Object.keys(properties).length > 0) {
					moduleProperties[module] = properties;
				}
			}

			this.cliInterfaceService.startSpinner("Setting up CI configuration...");

			const results = await Promise.all(
				this.selectedModules.map((module) => {
					const setupProps = moduleProperties[module] || {};
					return this.setupModule(module, setupProps);
				}),
			);

			this.cliInterfaceService.stopSpinner("CI configuration completed successfully!");

			const successfulSetups = results.filter((r) => r.success);
			const failedSetups = results.filter((r) => !r.success);

			this.displaySetupSummary(successfulSetups, failedSetups);

			return moduleProperties;
		} catch (error) {
			this.cliInterfaceService.stopSpinner();
			throw error;
		}
	}

	private extractModuleProperties(moduleConfig: any): Record<string, any> {
		if (!moduleConfig) {
			return {};
		}

		if (typeof moduleConfig === "boolean") {
			return {};
		}

		if (typeof moduleConfig === "object" && moduleConfig !== null && "isEnabled" in moduleConfig) {
			// Remove isEnabled flag and return actual properties
			const { isEnabled, ...properties } = moduleConfig;
			return properties;
		}

		return moduleConfig;
	}

	private async setupModule(module: ECiModule, properties: Record<string, any>): Promise<{ module: ECiModule; success: boolean; error?: Error }> {
		try {
			const config = CI_CONFIG[module];
			const providerConfig = config.content[this.selectedProvider!];

			if (!providerConfig) {
				throw new Error(`Provider ${this.selectedProvider} is not supported for ${config.name}`);
			}

			const dirPath = providerConfig.filePath.split("/").slice(0, -1).join("/");
			if (dirPath) {
				await this.fileSystemService.createDirectory(dirPath, {
					recursive: true,
				});
			}

			const content = providerConfig.template(properties);
			await this.fileSystemService.writeFile(providerConfig.filePath, content);

			return { module, success: true };
		} catch (error) {
			const formattedError: Error = error as Error;
			return { module, success: false, error: formattedError };
		}
	}

	private async collectModuleProperties(module: ECiModule, savedProperties: Record<string, any> = {}): Promise<Record<string, string>> {
		const properties: Record<string, string> = {};

		if (module === ECiModule.DEPENDABOT) {
			const defaultBranch = savedProperties.devBranchName || "dev";
			properties.devBranchName = await this.cliInterfaceService.text("Enter the target branch for Dependabot updates:", "dev", defaultBranch);
		}

		return properties;
	}

	private async getSavedConfig(): Promise<{
		provider?: ECiProvider;
		modules?: ECiModule[];
		moduleProperties?: Record<string, any>;
		isNpmPackage?: boolean;
	} | null> {
		try {
			if (await this.configService.exists()) {
				const config = await this.configService.get();
				if (config[EModule.CI]) {
					const ciConfig = config[EModule.CI] as any;

					// Standardize the moduleProperties format
					if (ciConfig.moduleProperties) {
						const standardizedProps: Record<string, any> = {};

						Object.entries(ciConfig.moduleProperties).forEach(([moduleKey, moduleValue]) => {
							standardizedProps[moduleKey] = this.extractModuleProperties(moduleValue);
						});

						ciConfig.moduleProperties = standardizedProps;
					}

					return ciConfig;
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	private displaySetupSummary(successful: Array<{ module: ECiModule }>, failed: Array<{ module: ECiModule; error?: Error }>): void {
		const summary = ["Successfully created configurations:", ...successful.map(({ module }) => `✓ ${CI_CONFIG[module].name}`)];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ module, error }) => `✗ ${CI_CONFIG[module].name} - ${error?.message || "Unknown error"}`));
		}

		summary.push("", "The workflows will be activated when you push to the repository.", "", "Note: Make sure to set up required secrets in your CI provider.");

		this.cliInterfaceService.note("CI Setup Summary", summary.join("\n"));
	}
}
