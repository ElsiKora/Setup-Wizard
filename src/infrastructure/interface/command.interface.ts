import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { IFileSystemService } from "../../application/interface/file-system-service.interface";
import { ConfigService } from "../../application/service/config.service";

export interface ICommand {
	cliInterfaceService: ICliInterfaceService;
	fileSystemService: IFileSystemService;
	execute(): Promise<void>;
}
