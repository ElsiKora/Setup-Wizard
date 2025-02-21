import type { Command } from "commander";

import type { ICommandFactory } from "../../infrastructure/interface/command-factory.interface";
import type { ICommandRegistrar } from "../../infrastructure/interface/command-registrar.interface";
import type { ICommand } from "../../infrastructure/interface/command.interface";
import type { TInitCommandProperties } from "../../infrastructure/type/init-command-properties.type";

import { COMMAND_FLAG_CONFIG } from "../../application/constant/command-flag-config.constant";
import { CommandOptionsMapper } from "../../application/mapper/command-options.mapper";
import { ECommand } from "../../infrastructure/enum/command.enum";

export class InitCommandRegistrar implements ICommandRegistrar {
	readonly COMMAND_FACTORY: ICommandFactory;

	readonly PROGRAM: Command;

	constructor(program: Command, commandFactory: ICommandFactory) {
		this.PROGRAM = program;
		this.COMMAND_FACTORY = commandFactory;
	}

	execute(): Command {
		const command: Command = this.PROGRAM.command(ECommand.INIT).description(
			`Initialize project configuration files

This command generates configuration files for your project based on selected options.`,
		);

		for (const commandFlagConfig of Object.values(COMMAND_FLAG_CONFIG)) {
			command.option(`-${commandFlagConfig.shortFlag}, --${commandFlagConfig.fullFlag}`, commandFlagConfig.description);
		}

		command.option(`-a, --all`, "Enable all modules");

		command.action(async (properties: Record<string, boolean>) => {
			const mapperProperties: TInitCommandProperties = CommandOptionsMapper.fromFlagToModule(properties);

			if (properties.all) {
				for (const key of Object.keys(mapperProperties)) {
					mapperProperties[key as keyof TInitCommandProperties] = true;
				}
			}

			const command: ICommand = this.COMMAND_FACTORY.createCommand(ECommand.INIT, mapperProperties);
			await command.execute();
		});

		return command;
	}
}
