import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/commitlint-config-core-dependencies.constant";
import { COMMITLINT_CONFIG_FILE_NAMES } from "../constant/commitlint-config-file-names.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../constant/commitlint-config-husky-commit-msg-script.constant";
import { COMMITLINT_CONFIG } from "../constant/commitlint-config.constant";

import { PackageJsonService } from "./package-json.service";

export class CommitlintModuleService implements IModuleService {
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
			const messageLines: Array<string> = ["Existing Commitlint/Commitizen configuration files detected:"];
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
				this.CLI_INTERFACE_SERVICE.warn("Existing Commitlint/Commitizen configuration files detected. Setup aborted.");

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

			await this.setupCommitlint();

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Commitlint setup", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Commitlint and Commitizen for your project?", true);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private async createConfigs(): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile("commitlint.config.js", COMMITLINT_CONFIG, "utf8");
	}

	private displaySetupSummary(): void {
		const summary: Array<string> = ["Commitlint and Commitizen configuration has been created.", "", "Generated scripts:", "- npm run commit (for commitizen)", "", "Configuration files:", "- commitlint.config.js", "- .husky/commit-msg", "", "Husky git hooks have been set up to validate your commits.", "Use 'npm run commit' to create commits using the interactive commitizen interface."];

		this.CLI_INTERFACE_SERVICE.note("Commitlint Setup", summary.join("\n"));
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of COMMITLINT_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists(".husky/commit-msg")) {
			existingFiles.push(".husky/commit-msg");
		}

		return existingFiles;
	}

	private async setupCommitlint(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Commitlint and Commitizen configuration...");

		try {
			await this.PACKAGE_JSON_SERVICE.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs();
			await this.setupHusky();
			await this.setupPackageJsonConfigs();
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Commitlint and Commitizen configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Commitlint and Commitizen configuration");

			throw error;
		}
	}

	private async setupHusky(): Promise<void> {
		// Initialize husky
		await this.COMMAND_SERVICE.execute("npx husky install");

		// Add prepare script if it doesn't exist
		await this.PACKAGE_JSON_SERVICE.addScript("prepare", "husky install");

		// Create commit-msg hook
		await this.COMMAND_SERVICE.execute("mkdir -p .husky");
		await this.FILE_SYSTEM_SERVICE.writeFile(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
		await this.COMMAND_SERVICE.execute("chmod +x .husky/commit-msg");
	}

	private async setupPackageJsonConfigs(): Promise<void> {
		const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

		if (!packageJson.config) {
			packageJson.config = {};
		}
		packageJson.config.commitizen = {
			path: "@commitlint/cz-commitlint",
		};

		await this.PACKAGE_JSON_SERVICE.set(packageJson);
	}

	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("commit", "cz");
	}
}
