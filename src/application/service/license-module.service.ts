import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { LICENSE_FILE_NAMES } from "../constant/license-file-names.constant";
import { CliInterfaceServiceMapper } from "../mapper/cli-interface-service.mapper";
import { LICENSE_CONFIG } from "../../domain/constant/license-config.constant";
import { PackageJsonService } from "./package-json.service";
import { ELicense } from "../../domain/enum/license.enum";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { NodeCommandService } from "../../infrastructure/service/node-command.service";
import { ICommandService } from "../interface/command-service.interface";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";
import { ConfigService } from "./config.service";
import { EModule } from "../../domain/enum/module.enum";

export class LicenseModuleService implements IModuleService {
	readonly packageJsonService: PackageJsonService;
	readonly commandService: ICommandService;
	private readonly configService: ConfigService;

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

			// Get saved config if available
			const savedConfig = await this.getSavedConfig();

			const setupResult = await this.generateNewLicense(savedConfig);
			this.displaySetupSummary(setupResult.success, setupResult.license, setupResult.author, setupResult.error);

			// Return the license configuration in customProperties
			if (setupResult.success && setupResult.license) {
				return {
					wasInstalled: true,
					customProperties: {
						year: new Date().getFullYear(),
						author: setupResult.author,
						license: setupResult.license,
					},
				};
			}

			return { wasInstalled: setupResult.success };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete license installation", error);
			throw error;
		}
	}

	private async getSavedConfig(): Promise<{
		year?: number;
		author?: string;
		license?: ELicense;
	} | null> {
		try {
			if (await this.configService.exists()) {
				const config = await this.configService.get();

				if (config[EModule.LICENSE]) {
					return config[EModule.LICENSE] as {
						year?: number;
						author?: string;
						license?: ELicense;
					};
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingLicense: string | undefined = await this.fileSystemService.isOneOfPathsExists(LICENSE_FILE_NAMES);

			if (!existingLicense) {
				return true;
			}

			const shouldReplace = !!(await this.cliInterfaceService.confirm(`An existing license file was found (${existingLicense}). Would you like to replace it?`));

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

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to generate LICENSE for your project?"));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	private async selectLicense(savedLicense?: ELicense): Promise<ELicense> {
		try {
			const options = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(LICENSE_CONFIG);
			const initialValue = savedLicense || undefined;
			return (await this.cliInterfaceService.select("Select a license for your project:", options, initialValue)) as ELicense;
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to select license", error);
			throw error;
		}
	}

	private async generateNewLicense(
		savedConfig?: {
			year?: number;
			author?: string;
			license?: ELicense;
		} | null,
	): Promise<{
		success: boolean;
		license?: ELicense;
		author?: string;
		error?: Error;
	}> {
		try {
			const license = await this.selectLicense(savedConfig?.license);
			const result = await this.createLicenseFile(license, savedConfig?.author);
			return {
				success: true,
				license,
				author: result.author,
			};
		} catch (error) {
			return {
				success: false,
				error: error as Error,
			};
		}
	}

	private async createLicenseFile(license: ELicense, savedAuthor?: string): Promise<{ author: string }> {
		this.cliInterfaceService.startSpinner("Generating license file...");

		try {
			let packageAuthor;
			try {
				packageAuthor = await this.packageJsonService.getProperty("author");
			} catch (error) {
				this.cliInterfaceService.warn("Failed to get author from package.json, using saved or default");
				packageAuthor = null;
			}

			// Determine author name with priority: saved > package.json > default
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

			// Confirm or modify the author name
			authorName = await this.cliInterfaceService.text("Enter the copyright holder's name:", "Your Name", authorName);

			const year = new Date().getFullYear().toString();
			const licenseFileContent = LICENSE_CONFIG[license].template(year, authorName);

			await this.fileSystemService.writeFile("LICENSE", licenseFileContent);
			await this.packageJsonService.setProperty("license", license);
			this.cliInterfaceService.stopSpinner("License file generated");

			return { author: authorName };
		} catch (error) {
			this.cliInterfaceService.stopSpinner();
			throw error;
		}
	}

	private displaySetupSummary(success: boolean, license?: ELicense, author?: string, error?: Error): void {
		const summary = [];
		const year = new Date().getFullYear().toString();

		if (success && license) {
			summary.push("Successfully created configuration:", `✓ LICENSE file (${LICENSE_CONFIG[license].name})`, ``, `Updated package.json "license" field`, "", "License details:", `- Type: ${LICENSE_CONFIG[license].name}`, `- Author: ${author}`, `- Year: ${year}`, "");
		} else {
			summary.push("Failed configuration:", `✗ LICENSE - ${error?.message || "Unknown error"}`);
		}

		summary.push("", "Remember to:", "- Review the generated LICENSE file", "- Include license information in your documentation");

		this.cliInterfaceService.note("License Setup Summary", summary.join("\n"));
	}
}
