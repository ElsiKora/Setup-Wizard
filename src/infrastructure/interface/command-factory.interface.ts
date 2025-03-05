import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ECommand } from "../enum/command.enum";

import type { ICommand } from "./command.interface";

/**
 * Interface for the command factory that creates command instances.
 * Provides a factory pattern implementation for creating command objects.
 */
export interface ICommandFactory {
	/** CLI interface service for user interaction */
	CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/**
	 * Creates a command instance of the specified type.
	 * @param name - The enum value representing the command to create
	 * @param options - Command-specific options and arguments
	 * @returns An instance of the specified command
	 */
	createCommand(name: ECommand, options: any): ICommand;

	/** File system service for file operations */
	FILE_SYSTEM_SERVICE: IFileSystemService;
}
