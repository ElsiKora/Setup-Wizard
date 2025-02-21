import type { Command } from "commander";

import type { ICommandFactory } from "./command-factory.interface";

export interface ICommandRegistrar {
	COMMAND_FACTORY: ICommandFactory;
	execute(): Command;
	PROGRAM: Command;
}
