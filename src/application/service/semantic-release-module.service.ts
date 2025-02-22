import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES } from "../constant/semantic-release-config-core-dependencies.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAME } from "../constant/semantic-release-config-file-name.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAMES } from "../constant/semantic-release-config-file-names.constant";
import { SEMANTIC_RELEASE_CONFIG } from "../constant/semantic-release-config.constant";

import { ConfigService } from "./config.service";
import { PackageJsonService } from "./package-json.service";

export class SemanticReleaseModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly COMMAND_SERVICE: ICommandService;

	readonly CONFIG_SERVICE: ConfigService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = ["Existing Semantic Release configuration files detected:"];
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
				this.CLI_INTERFACE_SERVICE.warn("Existing Semantic Release configuration files detected. Setup aborted.");

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

			const setupParameters: Record<string, string> = await this.setupSemanticRelease();

			return {
				customProperties: setupParameters,
				wasInstalled: true,
			};
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete Semantic Release setup", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Semantic Release for automated versioning and publishing?", true);
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private async createConfigs(repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel), "utf8");
	}

	private displaySetupSummary(mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string): void {
		const summary: Array<string> = ["Semantic Release configuration has been created.", "", "Release branches:", `- Main release branch: ${mainBranch}`];

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

		this.CLI_INTERFACE_SERVICE.note("Semantic Release Setup", summary.join("\n"));
	}

	private async ensureChangelogDirectory(): Promise<void> {
		if (!(await this.FILE_SYSTEM_SERVICE.isPathExists("docs"))) {
			await this.COMMAND_SERVICE.execute("mkdir -p docs");
		}
	}

	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of SEMANTIC_RELEASE_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		if (await this.FILE_SYSTEM_SERVICE.isPathExists("docs/CHANGELOG.md")) {
			existingFiles.push("docs/CHANGELOG.md");
		}

		return existingFiles;
	}

	private async getMainBranch(): Promise<string> {
		const savedConfig: null | Record<string, any> = await this.getSavedConfig();
		const initialBranch: string = (savedConfig?.mainBranch as string) || "main";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the name of your main release branch:", "main", initialBranch, (value: string) => {
			if (!value) {
				return "Main branch name is required";
			}
		});
	}

	private async getPreReleaseBranch(): Promise<string> {
		const savedConfig: null | Record<string, any> = await this.getSavedConfig();
		const initialBranch: string = (savedConfig?.preReleaseBranch as string) || "dev";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the name of your pre-release branch:", "dev", initialBranch, (value: string) => {
			if (!value) {
				return "Pre-release branch name is required";
			}
		});
	}

	private async getPreReleaseChannel(): Promise<string> {
		const savedConfig: null | Record<string, any> = await this.getSavedConfig();
		const initialChannel: string = (savedConfig?.preReleaseChannel as string) || "beta";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the pre-release channel name (e.g., beta, alpha, next):", "beta", initialChannel, (value: string) => {
			if (!value) {
				return "Pre-release channel name is required";
			}
		});
	}

	private async getRepositoryUrl(): Promise<string> {
		const savedConfig: null | Record<string, any> = await this.getSavedConfig();
		let savedRepoUrl: string = (savedConfig?.repositoryUrl as string) || "";

		if (!savedRepoUrl) {
			const packageJson: IPackageJson = await this.PACKAGE_JSON_SERVICE.get();

			if (packageJson.repository) {
				savedRepoUrl = typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository.url || "";
			}

			if (savedRepoUrl.startsWith("git+")) {
				// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
				savedRepoUrl = savedRepoUrl.slice(4);
			}

			if (savedRepoUrl.endsWith(".git")) {
				// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
				savedRepoUrl = savedRepoUrl.slice(0, Math.max(0, savedRepoUrl.length - 4));
			}
		}

		if (savedRepoUrl) {
			const shouldUseFoundedUrl: boolean = await this.CLI_INTERFACE_SERVICE.confirm(`Found repository URL: ${savedRepoUrl}\nIs this correct?`, true);

			if (!shouldUseFoundedUrl) {
				savedRepoUrl = await this.CLI_INTERFACE_SERVICE.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, savedRepoUrl, (value: string) => {
					if (!value) {
						return "Repository URL is required";
					}

					if (!value.startsWith("https://") && !value.startsWith("http://")) {
						return "Repository URL must start with 'https://' or 'http://'";
					}
				});
			}
		} else {
			savedRepoUrl = await this.CLI_INTERFACE_SERVICE.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, undefined, (value: string) => {
				if (!value) {
					return "Repository URL is required";
				}

				if (!value.startsWith("https://") && !value.startsWith("http://")) {
					return "Repository URL must start with 'https://' or 'http://'";
				}
			});
		}

		return savedRepoUrl;
	}

	private async getSavedConfig(): Promise<null | Record<string, any>> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.SEMANTIC_RELEASE]) {
					return config[EModule.SEMANTIC_RELEASE] as unknown as Record<string, string>;
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	private async isPrereleaseEnabledChannel(): Promise<boolean> {
		const savedConfig: null | Record<string, any> = await this.getSavedConfig();
		const isConfirmedByDefault: boolean = savedConfig?.isPrereleaseEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to configure a pre-release channel for development branches?", isConfirmedByDefault);
	}

	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("semantic-release", "semantic-release");
		await this.PACKAGE_JSON_SERVICE.addScript("release", "semantic-release");

		const ciScript: string = "npm run test && npm run build && npm run semantic-release";
		await this.PACKAGE_JSON_SERVICE.addScript("ci", ciScript);
	}

	private async setupSemanticRelease(): Promise<Record<string, string>> {
		try {
			const parameters: Record<string, any> = {};

			const repositoryUrl: string = await this.getRepositoryUrl();
			parameters.repositoryUrl = repositoryUrl;

			const mainBranch: string = await this.getMainBranch();
			parameters.mainBranch = mainBranch;

			const isPrereleaseEnabled: boolean = await this.isPrereleaseEnabledChannel();
			parameters.isPrereleaseEnabled = isPrereleaseEnabled;

			let preReleaseBranch: string | undefined = undefined;
			let preReleaseChannel: string | undefined = undefined;

			if (isPrereleaseEnabled) {
				preReleaseBranch = await this.getPreReleaseBranch();
				parameters.preReleaseBranch = preReleaseBranch;

				preReleaseChannel = await this.getPreReleaseChannel();
				parameters.preReleaseChannel = preReleaseChannel;
			}

			this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Semantic Release configuration...");
			await this.PACKAGE_JSON_SERVICE.installPackages(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel);
			await this.setupScripts();
			await this.ensureChangelogDirectory();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Semantic Release configuration completed successfully!");
			this.displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel);

			return parameters;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Semantic Release configuration");

			throw error;
		}
	}
}
