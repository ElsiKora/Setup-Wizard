import {ICommandFactory} from "../interface/command-factory.interface";
import {ICommand} from "../interface/command.interface";
import {InitCommand} from "../command/init.command";
import {ICliInterfaceService} from "../../application/interface/cli-interface-service.interface";
import {ECommand} from "../enum/command.enum";
import {AnalyzeCommand} from "../command/analyze.command";
import {IFileSystemService} from "../../application/interface/file-system-service.interface";

export class CommandFactory implements ICommandFactory {
    readonly cliInterfaceService: ICliInterfaceService;
    readonly fileSystemService: IFileSystemService;

    constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }

    createCommand(name: ECommand, options: any): ICommand {
        switch (name) {
            case ECommand.INIT:
                return new InitCommand(options, this.cliInterfaceService, this.fileSystemService);
            case ECommand.ANALYZE:
                return new AnalyzeCommand(options, this.cliInterfaceService, this.fileSystemService);
            default:
                throw new Error(`Unknown command: ${name}`);
        }
    }
}
