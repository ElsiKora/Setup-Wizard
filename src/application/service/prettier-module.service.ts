import { PackageJsonService } from "./package-json.service";
import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { ICommandService } from "../interface/command-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { PRETTIER_CONFIG_FILE_NAMES } from "../constant/prettier-config-file-names.constant";
import { PRETTIER_CONFIG_CORE_DEPENDENCIES } from "../constant/prettier-config-core-dependencies.constant";
import { PRETTIER_CONFIG } from "../constant/prettier-config.constant";
import { PRETTIER_CONFIG_IGNORE_PATHS } from "../constant/prettier-config-ignore-paths.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../constant/prettier-config-ignore-file-name.constant";
import { PRETTIER_CONFIG_FILE_NAME } from "../constant/prettier-config-file-name.config";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";

export class PrettierModuleService implements IModuleService {
	readonly packageJsonService: PackageJsonService;
	readonly commandService: ICommandService;

	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {
		this.commandService = new NodeCommandService();
		this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			await this.setupPrettier();

			return { wasInstalled: true };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete Prettier setup", error);
			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to set up Prettier for your project?", true));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines = ["Existing Prettier configuration files detected:"];
			messageLines.push("");

			if (existingFiles.length > 0) {
				existingFiles.forEach((file) => {
					messageLines.push(`- ${file}`);
				});
			}

			messageLines.push("", "Do you want to delete them?");

			const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file) => this.fileSystemService.deleteFile(file)));
			} else {
				this.cliInterfaceService.warn("Existing Prettier configuration files detected. Setup aborted.");
				return false;
			}
		}

		return true;
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const file of PRETTIER_CONFIG_FILE_NAMES) {
			if (await this.fileSystemService.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private async setupPrettier(): Promise<void> {
		this.cliInterfaceService.startSpinner("Setting up Prettier configuration...");

		try {
			await this.packageJsonService.installPackages(PRETTIER_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
			await this.createConfigs();
			await this.setupScripts();

			this.cliInterfaceService.stopSpinner("Prettier configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to setup Prettier configuration");
			throw error;
		}
	}

	private async createConfigs(): Promise<void> {
		await this.fileSystemService.writeFile(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");

		await this.fileSystemService.writeFile(PRETTIER_CONFIG_IGNORE_FILE_NAME, PRETTIER_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
	}

	private async setupScripts(): Promise<void> {
		await this.packageJsonService.addScript("format", "prettier --check .");
		await this.packageJsonService.addScript("format:fix", "prettier --write .");
	}

	private displaySetupSummary(): void {
		const summary = ["Prettier configuration has been created.", "", "Generated scripts:", "- npm run format", "- npm run format:fix", "", "You can customize the configuration in these files:", `- ${PRETTIER_CONFIG_FILE_NAME}`, `- ${PRETTIER_CONFIG_IGNORE_FILE_NAME}`];

		this.cliInterfaceService.note("Prettier Setup", summary.join("\n"));
	}
}
