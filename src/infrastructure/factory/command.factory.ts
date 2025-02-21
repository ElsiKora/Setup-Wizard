import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ICommandFactory } from "../interface/command-factory.interface";
import type { ICommand } from "../interface/command.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

import { AnalyzeCommand } from "../command/analyze.command";
import { InitCommand } from "../command/init.command";
import { ECommand } from "../enum/command.enum";

export class CommandFactory implements ICommandFactory {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	createCommand(name: ECommand, options: TInitCommandProperties): ICommand {
		console.log("OPTIONS", options);

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
