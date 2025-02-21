import type { IModuleService } from "../../infrastructure/interface/module-service.interface";
import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";
import type { IModuleSetupResult } from "../interface/module-setup-result.interface";

import { GITIGNORE_CONFIG } from "../../domain/constant/gitignore-config.constant";

export class GitignoreModuleService implements IModuleService {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	async handleExistingSetup(): Promise<boolean> {
		try {
			const existingGitignore: string | undefined = await this.FILE_SYSTEM_SERVICE.isOneOfPathsExists([".gitignore"]);

			if (!existingGitignore) {
				return true;
			}

			const shouldReplace: boolean = await this.CLI_INTERFACE_SERVICE.confirm(`An existing .gitignore file was found (${existingGitignore}). Would you like to replace it?`);

			if (!shouldReplace) {
				this.CLI_INTERFACE_SERVICE.warn("Keeping existing .gitignore file.");

				return false;
			}

			try {
				await this.FILE_SYSTEM_SERVICE.deleteFile(existingGitignore);
				this.CLI_INTERFACE_SERVICE.success("Deleted existing .gitignore file.");

				return true;
			} catch (error) {
				this.CLI_INTERFACE_SERVICE.handleError("Failed to delete existing .gitignore file", error);

				return false;
			}
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to check existing .gitignore setup", error);

			return false;
		}
	}

	async install(): Promise<IModuleSetupResult> {
		try {
			if (!(await this.shouldInstall())) {
				return { wasInstalled: false };
			}

			if (!(await this.handleExistingSetup())) {
				return { wasInstalled: false };
			}

			const setupResult: { error?: Error; isSuccess: boolean } = await this.generateNewGitignore();
			this.displaySetupSummary(setupResult.isSuccess, setupResult.error);

			return { wasInstalled: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to complete .gitignore installation", error);

			throw error;
		}
	}

	async shouldInstall(): Promise<boolean> {
		try {
			return await this.CLI_INTERFACE_SERVICE.confirm("Do you want to generate .gitignore file for your project?");
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.handleError("Failed to get user confirmation", error);

			return false;
		}
	}

	private displaySetupSummary(isSuccess: boolean, error?: Error): void {
		const summary: Array<string> = [];

		if (isSuccess) {
			summary.push("Successfully created configuration:", "✓ .gitignore file");
		} else {
			summary.push("Failed configuration:", `✗ .gitignore - ${error?.message ?? "Unknown error"}`);
		}

		summary.push("", "The .gitignore configuration includes:", "- Build outputs and dependencies", "- Common IDEs and editors", "- Testing and coverage files", "- Environment and local config files", "- System and temporary files", "- Framework-specific files", "- Lock files", "", "You can customize it further by editing .gitignore");

		this.CLI_INTERFACE_SERVICE.note("Gitignore Setup Summary", summary.join("\n"));
	}

	private async generateNewGitignore(): Promise<{ error?: Error; isSuccess: boolean }> {
		this.CLI_INTERFACE_SERVICE.startSpinner("Generating .gitignore file...");

		try {
			await this.FILE_SYSTEM_SERVICE.writeFile(".gitignore", GITIGNORE_CONFIG);
			this.CLI_INTERFACE_SERVICE.stopSpinner(".gitignore file generated");

			return { isSuccess: true };
		} catch (error) {
			this.CLI_INTERFACE_SERVICE.stopSpinner();

			return { error: error as Error, isSuccess: false };
		}
	}
}
