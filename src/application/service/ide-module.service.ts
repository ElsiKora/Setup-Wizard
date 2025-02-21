import type { IIdeConfigContent } from "../../domain/interface/ide-config-content.interface";
import type { IIdeConfig } from "../../domain/interface/ide-config.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { IDE_CONFIG } from "../../domain/constant/ide-config.constant";
import { EIde } from "../../domain/enum/ide.enum";
import { EModule } from "../../domain/enum/module.enum";

import { ConfigService } from "./config.service";

export class IdeModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	private readonly CONFIG_SERVICE: ConfigService;

	private selectedIdes: Array<EIde> = [];

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length === 0) {
			return true;
		}

		this.CLI_INTERFACE_SERVICE.warn("Found existing IDE configuration files that might be modified:\n" + existingFiles.map((file: string) => `- ${file}`).join("\n"));

		return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to continue? This might overwrite existing files.", false);
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			const savedConfig: { ides?: Array<EIde> } | null = await this.getSavedConfig();

			this.selectedIdes = await this.selectIdes(savedConfig?.ides ?? []);

			if (this.selectedIdes.length === 0) {
				this.CLI_INTERFACE_SERVICE.warn("No IDEs selected.");

				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.CLI_INTERFACE_SERVICE.warn("Setup cancelled by user.");

				return { wasInstalled: false };
			}

			await this.setupSelectedIdes();

			return {
				customProperties: {
					ides: this.selectedIdes,
				},
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete IDE setup", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		return await this.CLI_INTERFACE_SERVICE.confirm("Would you like to set up ESLint and Prettier configurations for your code editors?", true);
	}

	private displaySetupSummary(successful: Array<{ ide: EIde }>, failed: Array<{ error?: Error; ide: EIde }>): void {
		const summary: Array<string> = [
			"Successfully created configurations:",
			...successful.map(({ ide }: { ide: EIde }) => {
				const files: string = IDE_CONFIG[ide].content.map((config: IIdeConfigContent) => `  - ${config.filePath}`).join("\n");

				return `✓ ${IDE_CONFIG[ide].name}:\n${files}`;
			}),
		];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ error, ide }: { error?: Error; ide: EIde }) => `✗ ${IDE_CONFIG[ide].name} - ${error?.message ?? "Unknown error"}`));
		}

		this.CLI_INTERFACE_SERVICE.note("IDE Setup Summary", summary.join("\n"));
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const ide of this.selectedIdes) {
			const configContent: Array<IIdeConfigContent> = IDE_CONFIG[ide].content;

			for (const config of configContent) {
				if (await this.FILE_SYSTEM_SERVICE.isPathExists(config.filePath)) {
					existingFiles.push(config.filePath);
				}
			}
		}

		return existingFiles;
	}

	private async getSavedConfig(): Promise<{ ides?: Array<EIde> } | null> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.IDE]) {
					return config[EModule.IDE] as { ides?: Array<EIde> };
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	private async selectIdes(savedIdes: Array<EIde> = []): Promise<Array<EIde>> {
		const choices: Array<{ description: string; label: string; value: string }> = Object.entries(IDE_CONFIG).map(([ide, config]: [string, IIdeConfig]) => ({
			description: config.description,
			label: config.name,
			value: ide,
		}));

		const validSavedIdes: Array<EIde> = savedIdes.filter((ide: EIde) => Object.values(EIde).includes(ide));

		const initialSelection: Array<EIde> | undefined = validSavedIdes.length > 0 ? validSavedIdes : undefined;

		return await this.CLI_INTERFACE_SERVICE.multiselect<EIde>("Select your code editor(s):", choices, true, initialSelection);
	}

	private async setupIde(ide: EIde): Promise<{ error?: Error; ide: EIde; isSuccess: boolean }> {
		try {
			const configContent: Array<IIdeConfigContent> = IDE_CONFIG[ide].content;

			for (const config of configContent) {
				await this.FILE_SYSTEM_SERVICE.createDirectory(config.filePath, { isRecursive: true });
				await this.FILE_SYSTEM_SERVICE.writeFile(config.filePath, config.template());
			}

			return { ide, isSuccess: true };
		} catch (error) {
			return { error: error as Error, ide, isSuccess: false };
		}
	}

	private async setupSelectedIdes(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up IDE configurations...");

		try {
			const results: Array<
				Awaited<{
					error?: Error;
					ide: EIde;
					isSuccess: boolean;
				}>
			> = await Promise.all(this.selectedIdes.map((ide: EIde) => this.setupIde(ide)));

			this.CLI_INTERFACE_SERVICE.stopSpinner("IDE configuration completed successfully!");

			const successfulSetups: Array<Awaited<{ error?: Error; ide: EIde; isSuccess: boolean }>> = results.filter(
				(
					r: Awaited<{
						error?: Error;
						ide: EIde;
						isSuccess: boolean;
					}>,
				) => r.isSuccess,
			);

			const failedSetups: Array<Awaited<{ error?: Error; ide: EIde; isSuccess: boolean }>> = results.filter(
				(
					r: Awaited<{
						error?: Error;
						ide: EIde;
						isSuccess: boolean;
					}>,
				) => !r.isSuccess,
			);

			this.displaySetupSummary(successfulSetups, failedSetups);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			throw error;
		}
	}
}
