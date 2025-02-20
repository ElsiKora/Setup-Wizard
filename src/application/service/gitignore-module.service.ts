import { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import { GITIGNORE_CONFIG } from "../../domain/constant/gitignore-config.constant";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { IModuleService } from "../../infrastructure/interface/module-service.interface";
import { IModuleSetupResult } from "../interface/module-setup-result.interface";

export class GitignoreModuleService implements IModuleService {
	constructor(
		readonly cliInterfaceService: ICliInterfaceService,
		readonly fileSystemService: IFileSystemService,
	) {}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupResult = await this.generateNewGitignore();
			this.displaySetupSummary(setupResult.success, setupResult.error);

			return { wasInstalled: true };
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to complete .gitignore installation", error);
			throw error;
		}
	}

	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingGitignore: string | undefined = await this.fileSystemService.isOneOfPathsExists([".gitignore"]);

			if (!existingGitignore) {
				return true;
			}

			const shouldReplace = !!(await this.cliInterfaceService.confirm(`An existing .gitignore file was found (${existingGitignore}). Would you like to replace it?`));

			if (!shouldReplace) {
				this.cliInterfaceService.warn("Keeping existing .gitignore file.");
				return false;
			}

			try {
				await this.fileSystemService.deleteFile(existingGitignore);
				this.cliInterfaceService.success("Deleted existing .gitignore file.");
				return true;
			} catch (error) {
				this.cliInterfaceService.handleError("Failed to delete existing .gitignore file", error);
				return false;
			}
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to check existing .gitignore setup", error);
			return false;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return !!(await this.cliInterfaceService.confirm("Do you want to generate .gitignore file for your project?"));
		} catch (error) {
			this.cliInterfaceService.handleError("Failed to get user confirmation", error);
			return false;
		}
	}

	private async generateNewGitignore(): Promise<{ success: boolean; error?: Error }> {
		this.cliInterfaceService.startSpinner("Generating .gitignore file...");

		try {
			await this.fileSystemService.writeFile(".gitignore", GITIGNORE_CONFIG);
			this.cliInterfaceService.stopSpinner(".gitignore file generated");
			return { success: true };
		} catch (error) {
			this.cliInterfaceService.stopSpinner();
			return { success: false, error: error as Error };
		}
	}

	private displaySetupSummary(success: boolean, error?: Error): void {
		const summary = [];

		if (success) {
			summary.push("Successfully created configuration:", "✓ .gitignore file");
		} else {
			summary.push("Failed configuration:", `✗ .gitignore - ${error?.message || "Unknown error"}`);
		}

		summary.push("", "The .gitignore configuration includes:", "- Build outputs and dependencies", "- Common IDEs and editors", "- Testing and coverage files", "- Environment and local config files", "- System and temporary files", "- Framework-specific files", "- Lock files", "", "You can customize it further by editing .gitignore");

		this.cliInterfaceService.note("Gitignore Setup Summary", summary.join("\n"));
	}
}
