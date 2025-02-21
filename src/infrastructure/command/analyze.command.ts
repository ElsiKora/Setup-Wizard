import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { ICommand } from "../interface/command.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

export class AnalyzeCommand implements ICommand {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PROPERTIES: TInitCommandProperties;

	constructor(properties: TInitCommandProperties, cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.PROPERTIES = properties;
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	async execute(): Promise<void> {
		this.CLI_INTERFACE_SERVICE.clear();
		await this.CLI_INTERFACE_SERVICE.confirm("Do you want to analyze the project?");
	}
}
