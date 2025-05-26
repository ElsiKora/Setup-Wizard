import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfigSemanticRelease } from "../interface/config/semantic-release.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { EModule } from "../../domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { SEMANTIC_RELEASE_CONFIG_CHANGELOG_PATHS } from "../constant/semantic-release/changelog-paths.constant";
import { SEMANTIC_RELEASE_CONFIG } from "../constant/semantic-release/config.constant";
import { SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES } from "../constant/semantic-release/core-dependencies.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAME } from "../constant/semantic-release/file-name.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAMES } from "../constant/semantic-release/file-names.constant";
import { SEMANTIC_RELEASE_CONFIG_MESSAGES } from "../constant/semantic-release/messages.constant";
import { SEMANTIC_RELEASE_CONFIG_SCRIPTS } from "../constant/semantic-release/scripts.constant";
import { SEMANTIC_RELEASE_CONFIG_SUMMARY } from "../constant/semantic-release/summary.constant";

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
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for managing package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/** Cached semantic-release configuration */
	private config: IConfigSemanticRelease | null = null;

	/**
	 * Initializes a new instance of the SemanticReleaseModuleService.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 * @param configService - Service for managing app configuration
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService, configService: IConfigService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService(cliInterfaceService);
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Handles existing semantic-release setup.
	 * Checks for existing configuration files and asks if user wants to remove them.
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		const existingFiles: Array<string> = await this.findExistingConfigFiles();

		if (existingFiles.length > 0) {
			const messageLines: Array<string> = [SEMANTIC_RELEASE_CONFIG_MESSAGES.existingFilesDetected];
			messageLines.push("");

			if (existingFiles.length > 0) {
				for (const file of existingFiles) {
					messageLines.push(`- ${file}`);
				}
			}

			messageLines.push("", SEMANTIC_RELEASE_CONFIG_MESSAGES.deleteFilesQuestion);

			const shouldDelete: boolean = await this.CLI_INTERFACE_SERVICE.confirm(messageLines.join("\n"), true);

			if (shouldDelete) {
				await Promise.all(existingFiles.map((file: string) => this.FILE_SYSTEM_SERVICE.deleteFile(file)));
			} else {
				this.CLI_INTERFACE_SERVICE.warn(SEMANTIC_RELEASE_CONFIG_MESSAGES.existingFilesAborted);

				return false;
			}
		}

		return true;
	}

	/**
	 * Installs and configures semantic-release.
	 * Guides the user through setting up automated versioning and publishing.
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
			this.CLI_INTERFACE_SERVICE.handleError(SEMANTIC_RELEASE_CONFIG_MESSAGES.failedSetupError, error);

			throw error;
		}
	}

	/**
	 * Determines if semantic-release should be installed.
	 * Asks the user if they want to set up automated versioning and publishing.
	 * Uses the saved config value as default if it exists.
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm(SEMANTIC_RELEASE_CONFIG_MESSAGES.confirmSetup, await this.CONFIG_SERVICE.isModuleEnabled(EModule.SEMANTIC_RELEASE));
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError(SEMANTIC_RELEASE_CONFIG_MESSAGES.failedConfirmation, error);

			return false;
		}
	}

	/**
	 * Creates semantic-release configuration files.
	 * Generates the config file with repository URL and branch settings.
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
	 * @param mainBranch - The main branch for production releases
	 * @param preReleaseBranch - Optional branch for pre-releases
	 * @param preReleaseChannel - Optional channel name for pre-releases
	 * @param isBackmergeEnabled - Optional flag indicating if backmerge is enabled
	 * @param developBranch - Optional development branch name for backmerge
	 */
	private displaySetupSummary(mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string, isBackmergeEnabled: boolean = false, developBranch?: string): void {
		const summary: Array<string> = [SEMANTIC_RELEASE_CONFIG_MESSAGES.configurationCreated, "", SEMANTIC_RELEASE_CONFIG_MESSAGES.releaseBranchesLabel, `${SEMANTIC_RELEASE_CONFIG_MESSAGES.mainReleaseBranchLabel} ${mainBranch}`];

		if (preReleaseBranch && preReleaseChannel) {
			summary.push(SEMANTIC_RELEASE_CONFIG_MESSAGES.preReleaseBranchLabel(preReleaseBranch, preReleaseChannel));
		}

		if (isBackmergeEnabled && developBranch) {
			summary.push(SEMANTIC_RELEASE_CONFIG_MESSAGES.backmergeEnabledInfo(mainBranch, developBranch));
		}

		summary.push(
			"",
			SEMANTIC_RELEASE_CONFIG_MESSAGES.generatedScriptsLabel,
			SEMANTIC_RELEASE_CONFIG_MESSAGES.releaseScriptDescription,
			"",
			SEMANTIC_RELEASE_CONFIG_MESSAGES.configurationFilesLabel,
			`- ${SEMANTIC_RELEASE_CONFIG_FILE_NAME}`,
			"",
			SEMANTIC_RELEASE_CONFIG_MESSAGES.changelogLocationLabel,
			`- ${SEMANTIC_RELEASE_CONFIG_MESSAGES.changelogLocation}`,
			"",
			SEMANTIC_RELEASE_CONFIG_MESSAGES.noteEffectiveUsage,
			SEMANTIC_RELEASE_CONFIG_MESSAGES.noteInstruction1,
			SEMANTIC_RELEASE_CONFIG_MESSAGES.noteInstruction2,
			SEMANTIC_RELEASE_CONFIG_MESSAGES.noteInstruction3,
		);

		this.CLI_INTERFACE_SERVICE.note(SEMANTIC_RELEASE_CONFIG_MESSAGES.setupCompleteTitle, summary.join("\n"));
	}

	/**
	 * Finds existing semantic-release configuration files.
	 * @returns Promise resolving to an array of file paths for existing configuration files
	 */
	private async findExistingConfigFiles(): Promise<Array<string>> {
		const existingFiles: Array<string> = [];

		for (const file of SEMANTIC_RELEASE_CONFIG_FILE_NAMES) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(file)) {
				existingFiles.push(file);
			}
		}

		// Check for CHANGELOG paths
		for (const changelogPath of SEMANTIC_RELEASE_CONFIG_CHANGELOG_PATHS) {
			if (await this.FILE_SYSTEM_SERVICE.isPathExists(changelogPath)) {
				existingFiles.push(changelogPath);
			}
		}

		return existingFiles;
	}

	/**
	 * Prompts the user for the development branch name for backmerge.
	 * @returns Promise resolving to the development branch name
	 */
	private async getDevelopBranch(): Promise<string> {
		const initialBranch: string = this.config?.developBranch ?? SEMANTIC_RELEASE_CONFIG_SUMMARY.devBranchDefault;

		return await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.developBranchPrompt, SEMANTIC_RELEASE_CONFIG_SUMMARY.devBranchDefault, initialBranch, (value: string) => {
			if (!value) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameRequired;
			}

			if (value.includes(" ")) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameSpacesError;
			}
		});
	}

	/**
	 * Prompts the user for the main release branch name.
	 * @returns Promise resolving to the main branch name
	 */
	private async getMainBranch(): Promise<string> {
		const initialBranch: string = this.config?.mainBranch ?? SEMANTIC_RELEASE_CONFIG_SUMMARY.mainBranchDefault;

		return await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.mainBranchPrompt, SEMANTIC_RELEASE_CONFIG_SUMMARY.mainBranchDefault, initialBranch, (value: string) => {
			if (!value) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameRequired;
			}

			if (value.includes(" ")) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameSpacesError;
			}
		});
	}

	/**
	 * Prompts the user for the pre-release branch name.
	 * @returns Promise resolving to the pre-release branch name
	 */
	private async getPreReleaseBranch(): Promise<string> {
		const initialBranch: string = this.config?.preReleaseBranch ?? SEMANTIC_RELEASE_CONFIG_SUMMARY.devBranchDefault;

		return await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.preReleaseBranchPrompt, SEMANTIC_RELEASE_CONFIG_SUMMARY.devBranchDefault, initialBranch, (value: string) => {
			if (!value) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameRequired;
			}

			if (value.includes(" ")) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.branchNameSpacesError;
			}
		});
	}

	/**
	 * Prompts the user for the pre-release channel name.
	 * @returns Promise resolving to the pre-release channel name
	 */
	private async getPreReleaseChannel(): Promise<string> {
		const initialChannel: string = this.config?.preReleaseChannel ?? SEMANTIC_RELEASE_CONFIG_SUMMARY.preReleaseChannelDefault;

		return await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.preReleaseChannelPrompt, SEMANTIC_RELEASE_CONFIG_SUMMARY.preReleaseChannelDefault, initialChannel, (value: string) => {
			if (!value) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.channelNameRequired;
			}

			if (value.includes(" ")) {
				return SEMANTIC_RELEASE_CONFIG_MESSAGES.channelNameSpacesError;
			}
		});
	}

	/**
	 * Gets the repository URL for semantic-release.
	 * Attempts to detect URL from package.json before prompting the user.
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
				// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
				savedRepoUrl = savedRepoUrl.slice(4);
			}

			if (savedRepoUrl.endsWith(".git")) {
				// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
				savedRepoUrl = savedRepoUrl.slice(0, Math.max(0, savedRepoUrl.length - 4));
			}
		}

		if (savedRepoUrl) {
			const shouldUseFoundedUrl: boolean = await this.CLI_INTERFACE_SERVICE.confirm(SEMANTIC_RELEASE_CONFIG_MESSAGES.foundRepositoryUrl(savedRepoUrl), true);

			if (!shouldUseFoundedUrl) {
				savedRepoUrl = await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.enterRepositoryUrl, undefined, savedRepoUrl, (value: string) => {
					if (!value) {
						return SEMANTIC_RELEASE_CONFIG_MESSAGES.repositoryUrlRequired;
					}

					if (!value.startsWith("https://") && !value.startsWith("http://")) {
						return SEMANTIC_RELEASE_CONFIG_MESSAGES.repositoryUrlStartError;
					}
				});
			}
		} else {
			savedRepoUrl = await this.CLI_INTERFACE_SERVICE.text(SEMANTIC_RELEASE_CONFIG_MESSAGES.enterRepositoryUrl, undefined, undefined, (value: string) => {
				if (!value) {
					return SEMANTIC_RELEASE_CONFIG_MESSAGES.repositoryUrlRequired;
				}

				if (!value.startsWith("https://") && !value.startsWith("http://")) {
					return SEMANTIC_RELEASE_CONFIG_MESSAGES.repositoryUrlStartError;
				}
			});
		}

		return savedRepoUrl;
	}

	/**
	 * Prompts the user if they want to enable backmerge to development branch.
	 * Only applicable for the main branch.
	 * @param mainBranch - The main branch name
	 * @returns Promise resolving to true if backmerge should be enabled, false otherwise
	 */
	private async isBackmergeEnabled(mainBranch: string): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isBackmergeEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm(SEMANTIC_RELEASE_CONFIG_MESSAGES.confirmBackmerge(mainBranch), isConfirmedByDefault);
	}

	/**
	 * Prompts the user if they want to enable pre-release channels.
	 * @returns Promise resolving to true if pre-release should be enabled, false otherwise
	 */
	private async isPrereleaseEnabledChannel(): Promise<boolean> {
		const isConfirmedByDefault: boolean = this.config?.isPrereleaseEnabled === true;

		return await this.CLI_INTERFACE_SERVICE.confirm(SEMANTIC_RELEASE_CONFIG_MESSAGES.confirmPrereleaseChannel, isConfirmedByDefault);
	}

	/**
	 * Sets up npm scripts for semantic-release.
	 * Adds scripts for running semantic-release and CI processes.
	 */
	private async setupScripts(): Promise<void> {
		await this.PACKAGE_JSON_SERVICE.addScript(SEMANTIC_RELEASE_CONFIG_SCRIPTS.release.name, SEMANTIC_RELEASE_CONFIG_SCRIPTS.release.command);
	}

	/**
	 * Sets up semantic-release configuration.
	 * Collects user input, installs dependencies, creates config files,
	 * and sets up scripts.
	 * @returns Promise resolving to an object containing setup parameters
	 */
	private async setupSemanticRelease(): Promise<Record<string, string>> {
		try {
			const parameters: Record<string, unknown> = {};

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
			let developBranch: string | undefined = undefined;

			// Only ask about backmerge if we're not in a pre-release branch
			const isBackmergeEnabled: boolean = await this.isBackmergeEnabled(mainBranch);
			parameters.isBackmergeEnabled = isBackmergeEnabled;

			if (isBackmergeEnabled) {
				developBranch = await this.getDevelopBranch();
				parameters.developBranch = developBranch;
			}

			this.CLI_INTERFACE_SERVICE.startSpinner(SEMANTIC_RELEASE_CONFIG_MESSAGES.settingUpSpinner);
			await this.PACKAGE_JSON_SERVICE.installPackages(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			await this.createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch);
			await this.setupScripts();

			this.CLI_INTERFACE_SERVICE.stopSpinner(SEMANTIC_RELEASE_CONFIG_MESSAGES.configurationCompleted);
			this.displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch);

			return parameters as Record<string, string>;
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner(SEMANTIC_RELEASE_CONFIG_MESSAGES.failedSetupConfiguration);

			throw error;
		}
	}
}
