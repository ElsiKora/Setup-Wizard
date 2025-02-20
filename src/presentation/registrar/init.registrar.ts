import { Command } from "commander";
import { ICommandRegistrar } from "../../infrastructure/interface/command-registrar.interface";
import { ICommandFactory } from "../../infrastructure/interface/command-factory.interface";
import { ECommand } from "../../infrastructure/enum/command.enum";
import { COMMAND_FLAG_CONFIG } from "../../application/constant/command-flag-config.constant";
import { ICommandFlagConfig } from "../../application/interface/command-flag-config.interface";
import { CommandOptionsMapper } from "../../application/mapper/command-options.mapper";
import { IInitCommandProperties } from "../../infrastructure/interface/init-command-properties.interface";
import { EModule } from "../../domain/enum/module.enum";

export class InitCommandRegistrar implements ICommandRegistrar {
	readonly program: Command;
	readonly commandFactory: ICommandFactory;

	constructor(program: Command, commandFactory: ICommandFactory) {
		this.program = program;
		this.commandFactory = commandFactory;
	}

	execute(): Command {
		const command: Command = this.program.command(ECommand.INIT).description(
			`Initialize project configuration files

This command generates configuration files for your project based on selected options.`,
		);

		Object.values(COMMAND_FLAG_CONFIG).forEach((commandFlagConfig: ICommandFlagConfig): void => {
			command.option(`-${commandFlagConfig.shortFlag}, --${commandFlagConfig.fullFlag}`, commandFlagConfig.description);
		});

		command.option(`-a, --all`, "Enable all modules");

		command.action(async (properties: Record<string, boolean>) => {
			const mapperProperties: IInitCommandProperties = CommandOptionsMapper.fromFlagToModule(properties);

			if (properties.all) {
				Object.keys(mapperProperties).forEach((key) => {
					mapperProperties[key as keyof IInitCommandProperties] = true;
				});
			}

			const command = this.commandFactory.createCommand(ECommand.INIT, mapperProperties);
			await command.execute();
		});

		return command;
	}
}
