import type { Command } from "commander";

import type { ICommandFactory } from "./command-factory.interface";

/**
 * Interface for the command registrar that manages the CLI command structure.
 * Handles registering, configuring, and executing commands within the application.
 */
export interface ICommandRegistrar {
	/** The command factory used to create command instances */
	COMMAND_FACTORY: ICommandFactory;

	/**
	 * Executes the command registrar, setting up all commands and starting the CLI.
	 * @returns The configured Commander command instance
	 */
	execute(): Command;

	/** The root Commander program instance */
	PROGRAM: Command;
}
