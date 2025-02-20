import { ICommand } from "./command.interface";
import {ICliInterfaceService} from "../../application/interface/cli-interface-service.interface";
import {ECommand} from "../enum/command.enum";
import {IFileSystemService} from "../../application/interface/file-system-service.interface";

export interface ICommandFactory {
    cliInterfaceService: ICliInterfaceService;
    fileSystemService: IFileSystemService;
    createCommand(name: ECommand, options: any): ICommand;
}
