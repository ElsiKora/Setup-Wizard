import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { IFileSystemService } from "../../application/interface/file-system-service.interface";
import { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";

export interface IModuleService {
	cliInterfaceService: ICliInterfaceService;
	fileSystemService: IFileSystemService;
	install(): Promise<IModuleSetupResult>;
	shouldInstall(): Promise<boolean>;
	handleExistingSetup(): Promise<boolean>;
}
