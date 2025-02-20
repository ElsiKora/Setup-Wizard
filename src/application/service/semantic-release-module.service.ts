import { SEMANTIC_RELEASE_CONFIG_FILE_NAME } from "../constant/semantic-release-config-file-name.constant";
import { SEMANTIC_RELEASE_CONFIG } from "../constant/semantic-release-config.constant";
import { SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES } from "../constant/semantic-release-config-core-dependencies.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAMES } from "../constant/semantic-release-config-file-names.constant";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { PackageJsonService } from "./package-json.service";
import { ICommandService } from "../interface/command-service.interface";
import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
import { ConfigService } from "./config.service";
import { EModule } from "../../domain/enum/module.enum";

export class SemanticReleaseModuleService implements IModuleService {
	readonly packageJsonService: PackageJsonService;
	readonly commandService: ICommandService;
	readonly configService: ConfigService;

	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {
		this.commandService = new NodeCommandService();
		this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
		this.configService = new ConfigService(fileSystemService);
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupParams = await this.setupSemanticRelease();

			return {
				wasInstalled: true,
				customProperties: setupParams,
			};
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete Semantic Release setup", error);
			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to set up Semantic Release for automated versioning and publishing?", true));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines = ["Existing Semantic Release configuration files detected:"];
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
				this.cliInterfaceService.warn("Existing Semantic Release configuration files detected. Setup aborted.");
				return false;
			}
		}

		return true;
	}

	private async findExistingConfigFiles(): Promise<string[]> {
		const existingFiles: string[] = [];

		for (const file of SEMANTIC_RELEASE_CONFIG_FILE_NAMES) {
			if (await this.fileSystemService.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.fileSystemService.isPathExists("docs/CHANGELOG.md")) {
			existingFiles.push("docs/CHANGELOG.md");
		}

		return existingFiles;
	}

	private async getMainBranch(): Promise<string> {
		const savedConfig = await this.getSavedConfig();
		const initialBranch = savedConfig?.mainBranch || "main";

		return await this.cliInterfaceService.text("Enter the name of your main release branch:", "main", initialBranch, (value) => {
			if (!value) {
				return "Main branch name is required";
			}
			return undefined;
		});
	}

	private async needsPreReleaseChannel(): Promise<boolean> {
		const savedConfig = await this.getSavedConfig();
		const initialValue = savedConfig?.needsPreRelease === true ? true : false;

		return !!(await this.cliInterfaceService.confirm("Do you want to configure a pre-release channel for development branches?", initialValue));
	}

	private async getPreReleaseBranch(): Promise<string> {
		const savedConfig = await this.getSavedConfig();
		const initialBranch = savedConfig?.preReleaseBranch || "dev";

		return await this.cliInterfaceService.text("Enter the name of your pre-release branch:", "dev", initialBranch, (value) => {
			if (!value) {
				return "Pre-release branch name is required";
			}
			return undefined;
		});
	}

	private async getPreReleaseChannel(): Promise<string> {
		const savedConfig = await this.getSavedConfig();
		const initialChannel = savedConfig?.preReleaseChannel || "beta";

		return await this.cliInterfaceService.text("Enter the pre-release channel name (e.g., beta, alpha, next):", "beta", initialChannel, (value) => {
			if (!value) {
				return "Pre-release channel name is required";
			}
			return undefined;
		});
	}

	private async getSavedConfig(): Promise<Record<string, any> | null> {
		try {
			if (await this.configService.exists()) {
				const config = await this.configService.get();
				if (config[EModule.SEMANTIC_RELEASE]) {
					return config[EModule.SEMANTIC_RELEASE] as unknown as Record<string, string>;
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	private async setupSemanticRelease(): Promise<Record<string, string>> {
		try {
			const params: Record<string, any> = {};

			const repositoryUrl = await this.getRepositoryUrl();
			params["repositoryUrl"] = repositoryUrl;

			const mainBranch = await this.getMainBranch();
			params["mainBranch"] = mainBranch;

			const needsPreRelease = await this.needsPreReleaseChannel();
			params["needsPreRelease"] = needsPreRelease;

			let preReleaseBranch = undefined;
			let preReleaseChannel = undefined;

			if (needsPreRelease) {
				preReleaseBranch = await this.getPreReleaseBranch();
				params["preReleaseBranch"] = preReleaseBranch;

				preReleaseChannel = await this.getPreReleaseChannel();
				params["preReleaseChannel"] = preReleaseChannel;
			}

			this.cliInterfaceService.startSpinner("Setting up Semantic Release configuration...");
			await this.packageJsonService.installPackages(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
			await this.createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel);
			await this.setupScripts();
			await this.ensureChangelogDirectory();

			this.cliInterfaceService.stopSpinner("Semantic Release configuration completed successfully!");
			this.displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel);

			return params;
		} catch (error) {
			this.cliInterfaceService.stopSpinner("Failed to setup Semantic Release configuration");
			throw error;
		}
	}

	private async getRepositoryUrl(): Promise<string> {
		const savedConfig = await this.getSavedConfig();
		let savedRepoUrl = savedConfig?.repositoryUrl || "";

		if (!savedRepoUrl) {
			const packageJson = await this.packageJsonService.get();
			if (packageJson.repository) {
				savedRepoUrl = typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository.url || "";
			}

			if (savedRepoUrl.startsWith("git+")) {
				savedRepoUrl = savedRepoUrl.substring(4);
			}

			if (savedRepoUrl.endsWith(".git")) {
				savedRepoUrl = savedRepoUrl.substring(0, savedRepoUrl.length - 4);
			}
		}

		if (!savedRepoUrl) {
			savedRepoUrl = await this.cliInterfaceService.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, undefined, (value) => {
				if (!value) {
					return "Repository URL is required";
				}

				if (!value.startsWith("https://") && !value.startsWith("http://")) {
					return "Repository URL must start with 'https://' or 'http://'";
				}

				return undefined;
			});
		} else {
			const confirmUrl = await this.cliInterfaceService.confirm(`Found repository URL: ${savedRepoUrl}\nIs this correct?`, true);

			if (!confirmUrl) {
				savedRepoUrl = await this.cliInterfaceService.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, savedRepoUrl, (value) => {
					if (!value) {
						return "Repository URL is required";
					}

					if (!value.startsWith("https://") && !value.startsWith("http://")) {
						return "Repository URL must start with 'https://' or 'http://'";
					}

					return undefined;
				});
			}
		}

		return savedRepoUrl;
	}

	private async createConfigs(repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string): Promise<void> {
		await this.fileSystemService.writeFile(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel), "utf8");
	}

	private async ensureChangelogDirectory(): Promise<void> {
		if (!(await this.fileSystemService.isPathExists("docs"))) {
			await this.commandService.execute("mkdir -p docs");
		}
	}

	private async setupScripts(): Promise<void> {
		await this.packageJsonService.addScript("semantic-release", "semantic-release");
		await this.packageJsonService.addScript("release", "semantic-release");

		const ciScript = "npm run test && npm run build && npm run semantic-release";
		await this.packageJsonService.addScript("ci", ciScript);
	}

	private displaySetupSummary(mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string): void {
		const summary = ["Semantic Release configuration has been created.", "", "Release branches:", `- Main release branch: ${mainBranch}`];

		if (preReleaseBranch && preReleaseChannel) {
			summary.push(`- Pre-release branch: ${preReleaseBranch} (channel: ${preReleaseChannel})`);
		}

		summary.push(
			"",
			"Generated scripts:",
			"- npm run semantic-release",
			"- npm run release (alias)",
			"- npm run ci (runs tests, build, and release)",
			"",
			"Configuration files:",
			`- ${SEMANTIC_RELEASE_CONFIG_FILE_NAME}`,
			"",
			"Changelog location:",
			"- docs/CHANGELOG.md",
			"",
			"Note: To use Semantic Release effectively, you should:",
			"1. Configure CI/CD in your repository",
			"2. Set up required access tokens (GITHUB_TOKEN, NPM_TOKEN)",
			"3. Use conventional commits (works with the Commitlint setup)",
		);

		this.cliInterfaceService.note("Semantic Release Setup", summary.join("\n"));
	}
}
