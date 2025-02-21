import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";

export interface ICommand {
	CLI_INTERFACE_SERVICE: ICliInterfaceService;
	execute(): Promise<void>;
	FILE_SYSTEM_SERVICE: IFileSystemService;
}
