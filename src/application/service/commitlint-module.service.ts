import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { PackageJsonService } from "./package-json.service";
import { ICommandService } from "../interface/command-service.interface";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { COMMITLINT_CONFIG_FILE_NAMES } from "../constant/commitlint-config-file-names.constant";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../constant/commitlint-config-core-dependencies.constant";
import { COMMITLINT_CONFIG } from "../constant/commitlint-config.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../constant/commitlint-config-husky-commit-msg-script.constant";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";

export class CommitlintModuleService implements IModuleService {
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

			await this.setupCommitlint();

			return { wasInstalled: true };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete Commitlint setup", error);
			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to set up Commitlint and Commitizen for your project?", true));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines = ["Existing Commitlint/Commitizen configuration files detected:"];
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
				this.cliInterfaceService.warn("Existing Commitlint/Commitizen configuration files detected. Setup aborted.");
				return false;
			}
		}

		return true;
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const file of COMMITLINT_CONFIG_FILE_NAMES) {
			if (await this.fileSystemService.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		// Check for husky commit-msg hook
		if (await this.fileSystemService.isPathExists(".husky/commit-msg")) {
			existingFiles.push(".husky/commit-msg");
		}

		return existingFiles;
	}

	private async setupCommitlint(): Promise<void> {
		this.cliInterfaceService.startSpinner("Setting up Commitlint and Commitizen configuration...");

		try {
			await this.packageJsonService.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
			await this.createConfigs();
			await this.setupHusky();
			await this.setupPackageJsonConfigs();
			await this.setupScripts();

			this.cliInterfaceService.stopSpinner("Commitlint and Commitizen configuration completed successfully!");
			this.displaySetupSummary();
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to setup Commitlint and Commitizen configuration");
			throw error;
		}
	}

	private async createConfigs(): Promise<void> {
		// Create commitlint.config.js
		await this.fileSystemService.writeFile("commitlint.config.js", COMMITLINT_CONFIG, "utf8");
	}

	private async setupHusky(): Promise<void> {
		// Initialize husky
		await this.commandService.execute("npx husky install");

		// Add prepare script if it doesn't exist
		await this.packageJsonService.addScript("prepare", "husky install");

		// Create commit-msg hook
		await this.commandService.execute("mkdir -p .husky");
		await this.fileSystemService.writeFile(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
		await this.commandService.execute("chmod +x .husky/commit-msg");
	}

	private async setupPackageJsonConfigs(): Promise<void> {
		const packageJson = await this.packageJsonService.get();

		if (!packageJson.config) {
			packageJson.config = {};
		}
		packageJson.config.commitizen = {
			path: "@commitlint/cz-commitlint",
		};

		await this.packageJsonService.set(packageJson);
	}

	private async setupScripts(): Promise<void> {
		await this.packageJsonService.addScript("commit", "cz");
	}

	private displaySetupSummary(): void {
		const summary = ["Commitlint and Commitizen configuration has been created.", "", "Generated scripts:", "- npm run commit (for commitizen)", "", "Configuration files:", "- commitlint.config.js", "- .husky/commit-msg", "", "Husky git hooks have been set up to validate your commits.", "Use 'npm run commit' to create commits using the interactive commitizen interface."];

		this.cliInterfaceService.note("Commitlint Setup", summary.join("\n"));
	}
}
