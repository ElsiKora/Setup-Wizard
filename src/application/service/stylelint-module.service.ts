import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { PackageJsonService } from "./package-json.service";
import { ICommandService } from "../interface/command-service.interface";
import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { STYLELINT_CONFIG_CORE_DEPENDENCIES } from "../constant/stylelint-config-core-dependencies.constant";
import { STYLELINT_CONFIG_FILE_NAME } from "../constant/stylelint-config-file-name.constant";
import { STYLELINT_CONFIG } from "../constant/stylelint-config.constant";
import { STYLELINT_CONFIG_IGNORE_FILE_NAME } from "../constant/stylelint-config-ignore-file-name.constant";
import { STYLELINT_CONFIG_IGNORE_PATHS } from "../constant/stylelint-config-ignore-paths.constant";
import { STYLELINT_CONFIG_FILE_NAMES } from "../constant/stylelint-config-file-names.constant";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
export class StylelintModuleService implements IModuleService {
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

			await this.setupStylelint();

			return { wasInstalled: true };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete Stylelint setup", error);
			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to set up Stylelint for your project?", true));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines = ["Existing Stylelint configuration files detected:"];
			messageLines.push("");

			if (existingFiles.length > 0) {
				existingFiles.forEach((file) => {
					messageLines.push(`- ${file}`);
				});
			}

			messageLines.push("", "Do you want to delete them?");

			const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all([...existingFiles.map((file) => this.fileSystemService.deleteFile(file))]);
			} else {
				this.cliInterfaceService.warn("Existing Stylelint configuration files detected. Setup aborted.");
				return false;
			}
		}

		return true;
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const file of STYLELINT_CONFIG_FILE_NAMES) {
			if (await this.fileSystemService.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		return existingFiles;
	}

	private async setupStylelint(): Promise<void> {
		this.cliInterfaceService.startSpinner("Setting up Stylelint configuration...");

		try {
			await this.packageJsonService.installPackages(STYLELINT_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
			await this.createConfigs();
			await this.setupScripts();

			this.cliInterfaceService.stopSpinner("Stylelint configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to setup Stylelint configuration");
			throw error;
		}
	}

	private async createConfigs(): Promise<void> {
		await this.fileSystemService.writeFile(STYLELINT_CONFIG_FILE_NAME, STYLELINT_CONFIG, "utf8");

		await this.fileSystemService.writeFile(STYLELINT_CONFIG_IGNORE_FILE_NAME, STYLELINT_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
	}

	private async setupScripts(): Promise<void> {
		await this.packageJsonService.addScript("lint:style", 'stylelint "**/*.{css,scss}"');
		await this.packageJsonService.addScript("lint:style:fix", 'stylelint "**/*.{css,scss}" --fix');
	}

	private displaySetupSummary(): void {
		const summary = ["Stylelint configuration has been created.", "", "Generated scripts:", "- npm run lint:style", "- npm run lint:style:fix", "", "You can customize the configuration in these files:", `- ${STYLELINT_CONFIG_FILE_NAME}`, `- ${STYLELINT_CONFIG_IGNORE_FILE_NAME}`];

		this.cliInterfaceService.note("Stylelint Setup", summary.join("\n"));
	}
}
