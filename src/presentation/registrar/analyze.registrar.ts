import type { Command } from "commander";

import type { ICommandFactory } from "../../infrastructure/interface/command-factory.interface";
import type { ICommandRegistrar } from "../../infrastructure/interface/command-registrar.interface";
import type { ICommand } from "../../infrastructure/interface/command.interface";

import { ECommand } from "../../infrastructure/enum/command.enum";

/**
 * Registrar for the 'analyze' command.
 * Configures and registers the command that analyzes project structure and dependencies.
 */
export class AnalyzeCommandRegistrar implements ICommandRegistrar {
	/** The command factory used to create command instances */
	readonly COMMAND_FACTORY: ICommandFactory;

	/** The root Commander program instance */
	readonly PROGRAM: Command;

	/**
	 * Initializes a new instance of the AnalyzeCommandRegistrar.
	 * @param program - The Commander program to attach the command to
	 * @param commandFactory - Factory for creating command instances
	 */
	constructor(program: Command, commandFactory: ICommandFactory) {
		this.PROGRAM = program;
		this.COMMAND_FACTORY = commandFactory;
	}

	/**
	 * Configures and registers the 'analyze' command.
	 * Sets up command description, options, and action handler.
	 * @returns The configured Commander command instance
	 */
	execute(): Command {
		return this.PROGRAM.command(ECommand.ANALYZE)
			.description(
				`Analyze project structure and dependencies')

This command will check is project has all instruments from Setup-Wizard.

Options:
  -e, --hasEslint    Checks for ESLint configuration
  -p, --hasPrettier     Checks for Prettier configuration`,
			)
			.option("-e, --hasEslint", "Checks for ESLint configuration")
			.option("-p, --hasPrettier", "Checks for Prettier configuration")
			.action(async (options: any) => {
				const command: ICommand = this.COMMAND_FACTORY.createCommand(ECommand.ANALYZE, options);
				await command.execute();
			});
	}
}
