import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigSemanticRelease } from "../interface/config/semantic-release.interface";
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

/**
 * Service for setting up and managing semantic-release configuration.
 * Provides functionality to automate version management and package publishing
 * based on commit messages following conventional commits standard.
 */
export class SemanticReleaseModuleService implements IModuleService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Command service for executing shell commands */
	readonly COMMAND_SERVICE: ICommandService;

	/** Configuration service for managing app configuration */
	readonly CONFIG_SERVICE: ConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Cached semantic-release configuration */
	private config: IConfigSemanticRelease | null = null;

	/**
	 * Initializes a new instance of the SemanticReleaseModuleService.
	 *
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	/**
	 * Handles existing semantic-release setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 *
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
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

	/**
	 * Installs and configures semantic-release.
	 * Guides the user through setting up automated versioning and publishing.
	 *
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			this.config = await this.CONFIG_SERVICE.getModuleConfig<IConfigSemanticRelease>(EModule.SEMANTIC_RELEASE);

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

	/**
	 * Determines if semantic-release should be installed.
	 * Asks the user if they want to set up automated versioning and publishing.
	 * Uses the saved config value as default if it exists.
	 *
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to set up Semantic Release for automated versioning and publishing?", await this.CONFIG_SERVICE.isModuleEnabled(EModule.SEMANTIC_RELEASE));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates semantic-release configuration files.
	 * Generates the config file with repository URL and branch settings.
	 *
	 * @param repositoryUrl - The repository URL for semantic-release
	 * @param mainBranch - The main branch for production releases
	 * @param preReleaseBranch - Optional branch for pre-releases
	 * @param preReleaseChannel - Optional channel name for pre-releases
	 * @param isBackmergeEnabled - Optional flag to enable backmerge to development branch
	 * @param developBranch - Optional development branch name for backmerge
	 */
	private async createConfigs(repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string, isBackmergeEnabled: boolean = false, developBranch?: string): Promise<void> {
		await this.FILE_SYSTEM_SERVICE.writeFile(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch), "utf8");
	}

	/**
	 * Displays a summary of the semantic-release setup results.
	 * Lists configured branches, scripts, and usage instructions.
	 *
	 * @param mainBranch - The main branch for production releases
	 * @param preReleaseBranch - Optional branch for pre-releases
	 * @param preReleaseChannel - Optional channel name for pre-releases
	 * @param isBackmergeEnabled - Optional flag indicating if backmerge is enabled
	 * @param developBranch - Optional development branch name for backmerge
	 */
	private displaySetupSummary(mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string, isBackmergeEnabled: boolean = false, developBranch?: string): void {
		const summary: Array<string> = ["Semantic Release configuration has been created.", "", "Release branches:", `- Main release branch: ${mainBranch}`];

		if (preReleaseBranch && preReleaseChannel) {
			summary.push(`- Pre-release branch: ${preReleaseBranch} (channel: ${preReleaseChannel})`);
		}

		if (isBackmergeEnabled && developBranch) {
			summary.push(`- Backmerge enabled: Changes from ${mainBranch} will be automatically merged to ${developBranch} after release`);
		}

		summary.push("", "Generated scripts:", "- npm run release", "", "Configuration files:", `- ${SEMANTIC_RELEASE_CONFIG_FILE_NAME}`, "", "Changelog location:", "- CHANGELOG.md", "", "Note: To use Semantic Release effectively, you should:", "1. Configure CI/CD in your repository", "2. Set up required access tokens (GITHUB_TOKEN, NPM_TOKEN)", "3. Use conventional commits (works with the Commitlint setup)");

		this.CLI_INTERFACE_SERVICE.note("Semantic Release Setup", summary.join("\n"));
	}

	/**
	 * Ensures the changelog directory exists.
	 * Creates any necessary directories for changelog if they don't exist.
	 */
	private async ensureChangelogDirectory(): Promise<void> {
		// The changelog is now in the root directory, so we don't need to create any directories
		// but we keep this method for future flexibility if needed
	}

	/**
	 * Finds existing semantic-release configuration files.
	 *
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of SEMANTIC_RELEASE_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		// Check for CHANGELOG.md in the root directory
		if (await this.FILE_SYSTEM_SERVICE.isPathExists("CHANGELOG.md")) {
			existingFiles.push("CHANGELOG.md");
		}

		// Also check for legacy docs/CHANGELOG.md
		if (await this.FILE_SYSTEM_SERVICE.isPathExists("docs/CHANGELOG.md")) {
			existingFiles.push("docs/CHANGELOG.md");
		}

		return existingFiles;
	}

	/**
	 * Prompts the user for the development branch name for backmerge.
	 *
	 * @returns Promise resolving to the development branch name
	 */
	private async getDevelopBranch(): Promise<string> {
		const initialBranch: string = this.config?.developBranch ?? "dev";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the name of your development branch for backmerge:", "dev", initialBranch, (value: string) => {
			if (!value) {
				return "Development branch name is required";
			}
		});
	}

	/**
	 * Prompts the user for the main release branch name.
	 *
	 * @returns Promise resolving to the main branch name
	 */
	private async getMainBranch(): Promise<string> {
		const initialBranch: string = this.config?.mainBranch ?? "main";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the name of your main release branch:", "main", initialBranch, (value: string) => {
			if (!value) {
				return "Main branch name is required";
			}
		});
	}

	/**
	 * Prompts the user for the pre-release branch name.
	 *
	 * @returns Promise resolving to the pre-release branch name
	 */
	private async getPreReleaseBranch(): Promise<string> {
		const initialBranch: string = this.config?.preReleaseBranch ?? "dev";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the name of your pre-release branch:", "dev", initialBranch, (value: string) => {
			if (!value) {
				return "Pre-release branch name is required";
			}
		});
	}

	/**
	 * Prompts the user for the pre-release channel name.
	 *
	 * @returns Promise resolving to the pre-release channel name
	 */
	private async getPreReleaseChannel(): Promise<string> {
		const initialChannel: string = this.config?.preReleaseChannel ?? "beta";

		return await this.CLI_INTERFACE_SERVICE.text("Enter the pre-release channel name (e.g., beta, alpha, next):", "beta", initialChannel, (value: string) => {
			if (!value) {
				return "Pre-release channel name is required";
			}
		});
	}

	/**
	 * Gets the repository URL for semantic-release.
	 * Attempts to detect URL from package.json before prompting the user.
	 *
	 * @returns Promise resolving to the repository URL
	 */
	private async getRepositoryUrl(): Promise<string> {
		let savedRepoUrl: string = this.config?.repositoryUrl ?? "";

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

	/**
	 * Prompts the user if they want to enable backmerge to development branch.
	 * Only applicable for the main branch.
	 *
	 * @param mainBranch - The main branch name
	 * @returns Promise resolving to true if backmerge should be enabled, false otherwise
	 */
	private async isBackmergeEnabled(mainBranch: string): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isBackmergeEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm(`Do you want to enable automatic backmerge from ${mainBranch} to development branch after release?`, isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to enable pre-release channels.
	 *
	 * @returns Promise resolving to true if pre-release should be enabled, false otherwise
	 */
	private async isPrereleaseEnabledChannel(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isPrereleaseEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to configure a pre-release channel for development branches?", isConfirmedByDefault);
	}

	/**
	 * Sets up npm scripts for semantic-release.
	 * Adds scripts for running semantic-release and CI processes.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript("release", "semantic-release");
	}

	/**
	 * Sets up semantic-release configuration.
	 * Collects user input, installs dependencies, creates config files,
	 * and sets up scripts.
	 *
	 * @returns Promise resolving to an object containing setup parameters
	 */
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

			// Backmerge configuration
			let isBackmergeEnabled: boolean = false;
			let developBranch: string | undefined = undefined;

			// Only ask about backmerge if we're not in a pre-release branch
			isBackmergeEnabled = await this.isBackmergeEnabled(mainBranch);
			parameters.isBackmergeEnabled = isBackmergeEnabled;

			if (isBackmergeEnabled) {
				developBranch = await this.getDevelopBranch();
				parameters.developBranch = developBranch;
			}

			this.CLI_INTERFACE_SERVICE.startSpinner("Setting up Semantic Release configuration...");
			await this.PACKAGE_JSON_SERVICE.installPackages(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch);
			await this.setupScripts();
			await this.ensureChangelogDirectory();

			this.CLI_INTERFACE_SERVICE.stopSpinner("Semantic Release configuration completed successfully!");
			this.displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch);

			return parameters;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner("Failed to setup Semantic Release configuration");

			throw error;
		}
	}
}
