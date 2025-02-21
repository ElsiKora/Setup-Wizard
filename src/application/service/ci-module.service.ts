import type { ICiConfigContent } from "../../domain/interface/ci-config-content.interface";
import type { ICiConfig } from "../../domain/interface/ci-config.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { CI_CONFIG } from "../../domain/constant/ci-config.constant";
import { ECiModuleType } from "../../domain/enum/ci-module-type.enum";
import { ECiModule } from "../../domain/enum/ci-module.enum";
import { ECiProvider } from "../../domain/enum/ci-provider.enum";
import { EModule } from "../../domain/enum/module.enum";

import { ConfigService } from "./config.service";

export class CiModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	private readonly CONFIG_SERVICE: ConfigService;

	private selectedModules: Array<ECiModule> = [];

	private selectedProvider?: ECiProvider;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

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

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			const savedConfig: {
				isNpmPackage?: boolean;
				moduleProperties?: Record<string, any>;
				modules?: Array<ECiModule>;
				provider?: ECiProvider;
			} | null = await this.getSavedConfig();

			const moduleType: ECiModuleType = await this.determineModuleType(savedConfig?.isNpmPackage);
			this.selectedProvider = await this.selectProvider(savedConfig?.provider);
			this.selectedModules = await this.selectCompatibleModules(moduleType, savedConfig?.modules ?? []);

			if (this.selectedModules.length === 0) {
				this.CLI_INTERFACE_SERVICE.warn("No CI modules selected.");

				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.CLI_INTERFACE_SERVICE.warn("Setup cancelled by user.");

				return { wasInstalled: false };
			}

			const moduleProperties: Record<string, any> = await this.setupSelectedModules(savedConfig?.moduleProperties ?? {});

			const customProperties: Record<string, any> = {
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

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Would you like to set up CI workflows?");
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private async collectModuleProperties(module: ECiModule, savedProperties: Record<string, any> = {}): Promise<Record<string, string>> {
		const properties: Record<string, string> = {};

		if (module === ECiModule.DEPENDABOT) {
			const defaultBranch: string = (savedProperties.devBranchName as string) || "dev";
			properties.devBranchName = await this.CLI_INTERFACE_SERVICE.text("Enter the target branch for Dependabot updates:", "dev", defaultBranch);
		}

		return properties;
	}

	private async determineModuleType(isSavedNpmPackage: boolean = false): Promise<ECiModuleType> {
		const isConfirmedByDefault: boolean = isSavedNpmPackage ?? false;
		const isNpmPackage: boolean = await this.CLI_INTERFACE_SERVICE.confirm("Is this package going to be published to NPM?", isConfirmedByDefault);

		return isNpmPackage ? ECiModuleType.NPM_ONLY : ECiModuleType.NON_NPM;
	}

	private displaySetupSummary(successful: Array<{ module: ECiModule }>, failed: Array<{ error?: Error; module: ECiModule }>): void {
		const summary: Array<string> = ["Successfully created configurations:", ...successful.map(({ module }: { module: ECiModule }) => `✓ ${CI_CONFIG[module].name}`)];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ error, module }: { error?: Error; module: ECiModule }) => `✗ ${CI_CONFIG[module].name} - ${error?.message ?? "Unknown error"}`));
		}

		summary.push("", "The workflows will be activated when you push to the repository.", "", "Note: Make sure to set up required secrets in your CI provider.");

		this.CLI_INTERFACE_SERVICE.note("CI Setup Summary", summary.join("\n"));
	}

	private extractModuleProperties(moduleConfig: boolean | Record<string, any> | undefined): Record<string, any> {
		if (!moduleConfig) {
			return {};
		}

		if (typeof moduleConfig === "boolean") {
			return {};
		}

		if (typeof moduleConfig === "object" && "isEnabled" in moduleConfig) {
			const { isEnabled, ...properties }: Record<string, any> = moduleConfig;

			return properties;
		}

		return moduleConfig;
	}

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

	private getProviderDescription(provider: ECiProvider): string {
		const descriptions: Record<ECiProvider, string> = {
			[ECiProvider.GITHUB]: "GitHub Actions - Cloud-based CI/CD",
		};

		return descriptions[provider] || provider;
	}

	private async getSavedConfig(): Promise<{
		isNpmPackage?: boolean;
		moduleProperties?: Record<string, any>;
		modules?: Array<ECiModule>;
		provider?: ECiProvider;
	} | null> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.CI]) {
					const ciConfig: Record<string, any> = config[EModule.CI] as Record<string, any>;

					if (ciConfig.moduleProperties) {
						const standardizedProperties: Record<string, any> = {};

						// eslint-disable-next-line @elsikora-typescript/no-unsafe-argument
						for (const [moduleKey, moduleValue] of Object.entries(ciConfig.moduleProperties)) {
							// @ts-ignore
							standardizedProperties[moduleKey] = this.extractModuleProperties(moduleValue);
						}

						ciConfig.moduleProperties = standardizedProperties;
					}

					return ciConfig;
				}
			}

			return null;
		} catch {
			return null;
		}
	}

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

	private async setupModule(module: ECiModule, properties: Record<string, any>): Promise<{ error?: Error; isSuccess: boolean; module: ECiModule }> {
		try {
			const config: ICiConfig = CI_CONFIG[module];
			// eslint-disable-next-line @elsikora-typescript/no-non-null-assertion
			const providerConfig: ICiConfigContent = config.content[this.selectedProvider!];

			if (!providerConfig) {
				// eslint-disable-next-line @elsikora-typescript/restrict-template-expressions
				throw new Error(`Provider ${this.selectedProvider} is not supported for ${config.name}`);
			}

			const directionPath: string = providerConfig.filePath.split("/").slice(0, -1).join("/");

			if (directionPath) {
				await this.FILE_SYSTEM_SERVICE.createDirectory(directionPath, {
					isRecursive: true,
				});
			}

			const content: string = providerConfig.template(properties);
			await this.FILE_SYSTEM_SERVICE.writeFile(providerConfig.filePath, content);

			return { isSuccess: true, module };
		} catch (error) {
			const formattedError: Error = error as Error;

			return { error: formattedError, isSuccess: false, module };
		}
	}

	private async setupSelectedModules(savedProperties: Record<string, any> = {}): Promise<Record<string, any>> {
		if (!this.selectedProvider) {
			throw new Error("Provider not selected");
		}

		try {
			const moduleProperties: Record<string, any> = {};

			for (const module of this.selectedModules) {
				// eslint-disable-next-line @elsikora-typescript/no-unsafe-argument
				const savedModuleProperties: Record<string, any> = this.extractModuleProperties(savedProperties[module]);
				const properties: Record<string, string> = await this.collectModuleProperties(module, savedModuleProperties);

				if (Object.keys(properties).length > 0) {
					moduleProperties[module] = properties;
				}
			}

			this.CLI_INTERFACE_SERVICE.startSpinner("Setting up CI configuration...");

			const results: Array<Awaited<{ error?: Error; isSuccess: boolean; module: ECiModule }>> = await Promise.all(
				this.selectedModules.map((module: ECiModule) => {
					// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
					const setupProperties: Record<string, any> = moduleProperties[module] || {};

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
