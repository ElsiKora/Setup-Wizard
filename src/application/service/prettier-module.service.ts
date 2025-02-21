import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { PRETTIER_CONFIG_CORE_DEPENDENCIES } from "../constant/prettier-config-core-dependencies.constant";
import { PRETTIER_CONFIG_FILE_NAME } from "../constant/prettier-config-file-name.config";
import { PRETTIER_CONFIG_FILE_NAMES } from "../constant/prettier-config-file-names.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../constant/prettier-config-ignore-file-name.constant";
import { PRETTIER_CONFIG_IGNORE_PATHS } from "../constant/prettier-config-ignore-paths.constant";
import { PRETTIER_CONFIG } from "../constant/prettier-config.constant";

import { PackageJsonService } from "./package-json.service";

export class PrettierModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly COMMAND_SERVICE: ICommandService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing Prettier configuration files detected:"];
			messageLines.push("");

			if (existingFiles.length > 0) {
				for (const file of existingFiles) {
					messageLines.push(`- ${file}`);
				}
			}

			messageLines.push("", "Do you want to delete them?");

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn("Existing Prettier configuration files detected. Setup aborted.");

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

			await this.setupPrettier();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Prettier setup", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Prettier for your project?", true));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");

		await this.FILE_SYSTEM_SERVICE.writeFile(PRETTIER_CONFIG_IGNORE_FILE_NAME, PRETTIER_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
	}

	private displaySetupSummary(): void {
		const summary: Array<string> = ["Prettier configuration has been created.", "", "Generated scripts:", "- npm run format", "- npm run format:fix", "", "You can customize the configuration in these files:", `- ${PRETTIER_CONFIG_FILE_NAME}`, `- ${PRETTIER_CONFIG_IGNORE_FILE_NAME}`];

		this.CLI_INTERFACE_SERVICE.note("Prettier Setup", summary.join("\n"));
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of PRETTIER_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private async setupPrettier(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Prettier configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(PRETTIER_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Prettier configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Prettier configuration");

			throw error;
		}
	}

	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("format", "prettier --check .");
		await this.PACKAGE_JSON_SERVICE.addScript("format:fix", "prettier --write .");
	}
}
