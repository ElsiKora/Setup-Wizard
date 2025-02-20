import {Command} from "commander";
import {ICommandFactory} from "./command-factory.interface";

export interface ICommandRegistrar {
    program: Command;
    commandFactory: ICommandFactory;
    execute(): Command;
}
