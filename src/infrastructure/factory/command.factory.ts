import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ICommandFactory } from "../interface/command-factory.interface";
import type { ICommand } from "../interface/command.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

import { AnalyzeCommand } from "../command/analyze.command";
import { InitCommand } from "../command/init.command";
import { ECommand } from "../enum/command.enum";

/**
 * Factory for creating command instances based on command type.
 * Implements the factory pattern for generating different command objects.
 */
export class CommandFactory implements ICommandFactory {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Initializes a new instance of the CommandFactory.
	 *
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	/**
	 * Creates a command instance of the specified type.
	 *
	 * @param name - The enum value representing the command to create
	 * @param options - Command-specific options and arguments
	 * @returns An instance of the specified command
	 * @throws Error if the command type is unknown
	 */
	createCommand(name: ECommand, options: TInitCommandProperties): ICommand {
		switch (name) {
			case ECommand.ANALYZE: {
				return new AnalyzeCommand(options, this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case ECommand.INIT: {
				return new InitCommand(options, this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			default: {
				throw new Error(`Unknown command: ${name as string}`);
			}
		}
	}
}
