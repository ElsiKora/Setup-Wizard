import { Command } from 'commander';
import {ICommandRegistrar} from "../../infrastructure/interface/command-registrar.interface";
import {ICommandFactory} from "../../infrastructure/interface/command-factory.interface";
import {ECommand} from "../../infrastructure/enum/command.enum";

export class AnalyzeCommandRegistrar implements ICommandRegistrar {
    readonly program: Command;
    readonly commandFactory: ICommandFactory;

    constructor(program: Command, commandFactory: ICommandFactory){
        this.program = program;
        this.commandFactory = commandFactory;
    }

    execute(): Command {
        return this.program
            .command(ECommand.ANALYZE)
            .description(
                `Analyze project structure and dependencies')

This command will check is project has all instruments from Setup-Wizard.

Options:
  -e, --hasEslint    Checks for ESLint configuration
  -p, --hasPrettier     Checks for Prettier configuration`
            )
            .option('-e, --hasEslint', 'Checks for ESLint configuration')
            .option('-p, --hasPrettier', 'Checks for Prettier configuration')
            .action(async (options) => {
                const command = this.commandFactory.createCommand(ECommand.ANALYZE, options);
                await command.execute();
            });
    }
}
