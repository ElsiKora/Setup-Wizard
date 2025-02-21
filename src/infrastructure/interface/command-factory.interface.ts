import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ECommand } from "../enum/command.enum";

import type { ICommand } from "./command.interface";

export interface ICommandFactory {
	CLI_INTERFACE_SERVICE: ICliInterfaceService;
	createCommand(name: ECommand, options: any): ICommand;
	FILE_SYSTEM_SERVICE: IFileSystemService;
}
