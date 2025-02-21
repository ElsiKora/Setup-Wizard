import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";

export interface IModuleService {
	CLI_INTERFACE_SERVICE: ICliInterfaceService;
	FILE_SYSTEM_SERVICE: IFileSystemService;
	handleExistingSetup(): Promise<boolean>;
	install(): Promise<IModuleSetupResult>;
	shouldInstall(): Promise<boolean>;
}
