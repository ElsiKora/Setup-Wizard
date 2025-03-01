import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";

/**
 * Interface for command objects.
 * Represents a command that can be executed in the application.
 */
export interface ICommand {
	/**
	 * CLI interface service for interacting with the user.
	 */
	CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/**
	 * Executes the command.
	 *
	 * @returns Promise that resolves when the command has completed execution
	 */
	execute(): Promise<void>;

	/**
	 * File system service for file operations.
	 */
	FILE_SYSTEM_SERVICE: IFileSystemService;
}
