import type { Command } from "commander";

import type { ICommandFactory } from "../../infrastructure/interface/command-factory.interface";
import type { ICommandRegistrar } from "../../infrastructure/interface/command-registrar.interface";
import type { ICommand } from "../../infrastructure/interface/command.interface";

import { ECommand } from "../../infrastructure/enum/command.enum";

export class AnalyzeCommandRegistrar implements ICommandRegistrar {
	readonly COMMAND_FACTORY: ICommandFactory;

	readonly PROGRAM: Command;

	constructor(program: Command, commandFactory: ICommandFactory) {
		this.PROGRAM = program;
		this.COMMAND_FACTORY = commandFactory;
	}

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
