import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ICommand } from "../interface/command.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

/**
 * Command for analyzing the project.
 * Implements the ICommand interface to provide standard command execution.
 */
export class AnalyzeCommand implements ICommand {
	/**
	 * CLI interface service for user interaction.
	 */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/**
	 * File system service for file operations.
	 */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Properties defining command behavior.
	 */
	readonly PROPERTIES: TInitCommandProperties;

	/**
	 * Initializes a new instance of the AnalyzeCommand.
	 *
	 * @param properties - Properties defining command behavior
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(properties: TInitCommandProperties, cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.PROPERTIES = properties;
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	/**
	 * Executes the analyze command.
	 * Clears the console and prompts the user to confirm project analysis.
	 *
	 * @returns Promise that resolves when execution is complete
	 */
	async execute(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.clear();
		await this.CLI_INTERFACE_SERVICE.confirm("Do you want to analyze the project?");
	}
}
