import {ICommand} from "../interface/command.interface";
import {IInitCommandProperties} from "../interface/init-command-properties.interface";
import {ICliInterfaceService} from "../../application/interface/cli-interface-service.interface";
import {IFileSystemService} from "../../application/interface/file-system-service.interface";

export class AnalyzeCommand implements ICommand {
    readonly properties: IInitCommandProperties;
    readonly cliInterfaceService: ICliInterfaceService;
    readonly fileSystemService: IFileSystemService;

    constructor(
        properties: IInitCommandProperties,
        cliInterfaceService: ICliInterfaceService,
        fileSystemService: IFileSystemService
    ) {
        this.properties = properties;
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }

    async execute(): Promise<void> {
        this.cliInterfaceService.clear();
        this.cliInterfaceService.confirm("ANALYTZE???");

    }
}
