import type { ELicense } from "../../domain/enum/license.enum";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { IPackageJsonAuthor } from "../../domain/interface/package-json-author.interface";
import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IConfig } from "../interface/config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { LICENSE_CONFIG } from "../../domain/constant/license-config.constant";
import { EModule } from "../../domain/enum/module.enum";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { LICENSE_FILE_NAMES } from "../constant/license-file-names.constant";
import { CliInterfaceServiceMapper } from "../mapper/cli-interface-service.mapper";

import { ConfigService } from "./config.service";
import { PackageJsonService } from "./package-json.service";

/**
 * Service for generating and managing LICENSE files for projects.
 * Provides functionality to select a license type, generate the LICENSE file,
 * and update the package.json with license information.
 */
export class LicenseModuleService implements IModuleService {
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

	/**
	 * Initializes a new instance of the LicenseModuleService.
	 *
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = new NodeCommandService();
		this.PACKAGE_JSON_SERVICE = new PackageJsonService(fileSystemService, this.COMMAND_SERVICE);
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	/**
	 * Handles existing license setup.
	 * Checks for existing license files and asks if user wants to replace them.
	 *
	 * @returns Promise resolving to true if setup should proceed, false otherwise
	 */
	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingLicense: string | undefined = await this.fileSystemService.isOneOfPathsExists(LICENSE_FILE_NAMES);

			if (!existingLicense) {
				return true;
			}

			const shouldReplace: boolean = await this.cliInterfaceService.confirm(`An existing license file was found (${existingLicense}). Would you like to replace it?`);

			if (!shouldReplace) {
				this.cliInterfaceService.warn("Keeping existing license file.");

				return false;
			}

			try {
				await this.fileSystemService.deleteFile(existingLicense);
				this.cliInterfaceService.success("Deleted existing license file.");

				return true;
			} catch (error) {
				this.cliInterfaceService.handleError("Failed to delete existing license file", error);

				return false;
			}
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to check existing license setup", error);

			return false;
		}
	}

	/**
	 * Installs and configures a LICENSE file.
	 * Guides the user through selecting a license type and generating the file.
	 *
	 * @returns Promise resolving to the module setup result
	 */
	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const savedConfig: { author?: string; license?: ELicense; year?: number } | null = await this.getSavedConfig();

			const setupResult: { author?: string; error?: Error; isSuccess: boolean; license?: ELicense } = await this.generateNewLicense(savedConfig);
			this.displaySetupSummary(setupResult.isSuccess, setupResult.license, setupResult.author, setupResult.error);

			if (setupResult.isSuccess && setupResult.license) {
				return {
					customProperties: {
						author: setupResult.author,
						license: setupResult.license,
						year: new Date().getFullYear(),
					},
					wasInstalled: true,
				};
			}

			return { wasInstalled: setupResult.isSuccess };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete license installation", error);

			throw error;
		}
	}

	/**
	 * Determines if the LICENSE module should be installed.
	 * Asks the user if they want to generate a LICENSE file for their project.
	 *
	 * @returns Promise resolving to true if the module should be installed, false otherwise
	 */
	async shouldInstall(): Promise<boolean> {
		try {
			return await this.cliInterfaceService.confirm("Do you want to generate LICENSE for your project?");
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	/**
	 * Creates a LICENSE file with the selected license type and author information.
	 * Also updates the package.json license field.
	 *
	 * @param license - The selected license type
	 * @param savedAuthor - Previously saved author name, if any
	 * @returns Promise resolving to an object containing the author name
	 */
	private async createLicenseFile(license: ELicense, savedAuthor?: string): Promise<{ author: string }> {
		try {
			let packageAuthor: IPackageJsonAuthor | string | undefined;

			try {
				packageAuthor = await this.PACKAGE_JSON_SERVICE.getProperty("author");
			} catch {
				this.cliInterfaceService.warn("Failed to get author from package.json, using saved or default");
				packageAuthor = undefined;
			}

			let authorName: string;

			if (savedAuthor) {
				authorName = savedAuthor;
			} else if (packageAuthor) {
				if (typeof packageAuthor === "object" && "name" in packageAuthor) {
					authorName = packageAuthor.name;
				} else if (typeof packageAuthor === "string" && packageAuthor.length > 0) {
					authorName = packageAuthor;
				} else {
					authorName = "Your Name";
				}
			} else {
				authorName = "Your Name";
			}

			authorName = await this.cliInterfaceService.text("Enter the copyright holder's name:", "Your Name", authorName);

			this.cliInterfaceService.startSpinner("Generating license file...");
			const year: string = new Date().getFullYear().toString();
			const licenseFileContent: string = LICENSE_CONFIG[license].template(year, authorName);

			await this.fileSystemService.writeFile("LICENSE", licenseFileContent);
			await this.PACKAGE_JSON_SERVICE.setProperty("license", license);
			this.cliInterfaceService.stopSpinner("License file generated");

			return { author: authorName };
		} catch (error) {
			this.cliInterfaceService.stopSpinner();

			throw error;
		}
	}

	/**
	 * Displays a summary of the LICENSE setup results.
	 * Lists details about the generated license file.
	 *
	 * @param isSuccess - Whether the setup was successful
	 * @param license - The selected license type, if successful
	 * @param author - The copyright holder's name, if successful
	 * @param error - Optional error if setup failed
	 */
	private displaySetupSummary(isSuccess: boolean, license?: ELicense, author?: string, error?: Error): void {
		const summary: Array<string> = [];
		const year: string = new Date().getFullYear().toString();

		if (isSuccess && license) {
			summary.push("Successfully created configuration:", `✓ LICENSE file (${LICENSE_CONFIG[license].name})`, ``, `Updated package.json "license" field`, "", "License details:", `- Type: ${LICENSE_CONFIG[license].name}`, `- Author: ${author ?? "Your Name"}`, `- Year: ${year}`, "");
		} else {
			summary.push("Failed configuration:", `✗ LICENSE - ${error?.message ?? "Unknown error"}`);
		}

		summary.push("", "Remember to:", "- Review the generated LICENSE file", "- Include license information in your documentation");

		this.cliInterfaceService.note("License Setup Summary", summary.join("\n"));
	}

	/**
	 * Generates a new LICENSE file.
	 *
	 * @param savedConfig - Previously saved license configuration, if any
	 * @returns Promise resolving to an object indicating success or failure with optional license, author, and error details
	 */
	private async generateNewLicense(
		savedConfig?: {
			author?: string;
			license?: ELicense;
			year?: number;
		} | null,
	): Promise<{
		author?: string;
		error?: Error;
		isSuccess: boolean;
		license?: ELicense;
	}> {
		try {
			const license: ELicense = await this.selectLicense(savedConfig?.license);
			const result: { author: string } = await this.createLicenseFile(license, savedConfig?.author);

			return {
				author: result.author,
				isSuccess: true,
				license,
			};
		} catch (error) {
			return {
				error: error as Error,
				isSuccess: false,
			};
		}
	}

	/**
	 * Gets the saved license configuration from the config file.
	 *
	 * @returns Promise resolving to the saved license configuration or null if not found
	 */
	private async getSavedConfig(): Promise<{
		author?: string;
		license?: ELicense;
		year?: number;
	} | null> {
		try {
			if (await this.CONFIG_SERVICE.exists()) {
				const config: IConfig = await this.CONFIG_SERVICE.get();

				if (config[EModule.LICENSE]) {
					return config[EModule.LICENSE] as {
						author?: string;
						license?: ELicense;
						year?: number;
					};
				}
			}

			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Prompts the user to select a license type for their project.
	 *
	 * @param savedLicense - Previously saved license type, if any
	 * @returns Promise resolving to the selected license enum value
	 */
	private async selectLicense(savedLicense?: ELicense): Promise<ELicense> {
		try {
			const options: Array<ICliInterfaceServiceSelectOptions> = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(LICENSE_CONFIG);
			const initialValue: ELicense | undefined = savedLicense ?? undefined;

			return await this.cliInterfaceService.select("Select a license for your project:", options, initialValue);
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to select license", error);

			throw error;
		}
	}
}
