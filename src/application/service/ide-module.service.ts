import { EIde } from "../../domain/enum/ide.enum";
import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { IDE_CONFIG } from "../../domain/constant/ide-config.constant";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
import { ConfigService } from "./config.service";
import { EModule } from "../../domain/enum/module.enum";

export class IdeModuleService implements IModuleService {
	private selectedIdes: EIde[] = [];
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

			this.selectedIdes = await this.selectIdes(savedConfig?.ides || []);

			if (this.selectedIdes.length === 0) {
				this.cliInterfaceService.warn("No IDEs selected.");
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				this.cliInterfaceService.warn("Setup cancelled by user.");
				return { wasInstalled: false };
			}

			await this.setupSelectedIdes();

			return {
				wasInstalled: true,
				customProperties: {
					ides: this.selectedIdes,
				},
			};
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete IDE setup", error);
			throw error;
		}
	}

	private async getSavedConfig(): Promise<{ ides?: EIde[] } | null> {
		try {
			if (await this.configService.exists()) {
				const config = await this.configService.get();
				if (config[EModule.IDE]) {
					return config[EModule.IDE] as { ides?: EIde[] };
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	async shouldInstall(): Promise<boolean> {
		return await this.cliInterfaceService.confirm("Would you like to set up ESLint and Prettier configurations for your code editors?", true);
	}

	private async selectIdes(savedIdes: EIde[] = []): Promise<EIde[]> {
		const choices = Object.entries(IDE_CONFIG).map(([ide, config]) => ({
			label: config.name,
			value: ide as EIde,
			description: config.description,
		}));

		const validSavedIdes = savedIdes.filter((ide) => Object.values(EIde).includes(ide));

		const initialSelection = validSavedIdes.length > 0 ? validSavedIdes : undefined;

		return await this.cliInterfaceService.multiselect<EIde>("Select your code editor(s):", choices, true, initialSelection);
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles = await this.findExistingConfigFiles();

		if (existingFiles.length === 0) {
			return true;
		}

		this.cliInterfaceService.warn("Found existing IDE configuration files that might be modified:\n" + existingFiles.map((file) => `- ${file}`).join("\n"));

		return await this.cliInterfaceService.confirm("Do you want to continue? This might overwrite existing files.", false);
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const ide of this.selectedIdes) {
			const configContent = IDE_CONFIG[ide].content;
			for (const config of configContent) {
				if (await this.fileSystemService.isPathExists(config.filePath)) {
					existingFiles.push(config.filePath);
				}
			}
		}

		return existingFiles;
	}

	private async setupSelectedIdes(): Promise<void> {
		this.cliInterfaceService.startSpinner("Setting up IDE configurations...");

		try {
			const results = await Promise.all(this.selectedIdes.map((ide) => this.setupIde(ide)));

			this.cliInterfaceService.stopSpinner("IDE configuration completed successfully!");

			const successfulSetups = results.filter((r) => r.success);
			const failedSetups = results.filter((r) => !r.success);

			this.displaySetupSummary(successfulSetups, failedSetups);
		} catch (error) {
			this.cliInterfaceService.stopSpinner();
			throw error;
		}
	}

	private async setupIde(ide: EIde): Promise<{ ide: EIde; success: boolean; error?: Error }> {
		try {
			const configContent = IDE_CONFIG[ide].content;

			for (const config of configContent) {
				await this.fileSystemService.createDirectory(config.filePath, { recursive: true });
				await this.fileSystemService.writeFile(config.filePath, config.template());
			}

			return { ide, success: true };
		} catch (error) {
			return { ide, success: false, error: error as Error };
		}
	}

	private displaySetupSummary(successful: Array<{ ide: EIde }>, failed: Array<{ ide: EIde; error?: Error }>): void {
		const summary = [
			"Successfully created configurations:",
			...successful.map(({ ide }) => {
				const files = IDE_CONFIG[ide].content.map((config) => `  - ${config.filePath}`).join("\n");
				return `✓ ${IDE_CONFIG[ide].name}:\n${files}`;
			}),
		];

		if (failed.length > 0) {
			summary.push("Failed configurations:", ...failed.map(({ ide, error }) => `✗ ${IDE_CONFIG[ide].name} - ${error?.message || "Unknown error"}`));
		}

		this.cliInterfaceService.note("IDE Setup Summary", summary.join("\n"));
	}
}
