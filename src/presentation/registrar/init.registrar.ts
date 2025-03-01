import type { Command } from "commander";

import type { ICommandFactory } from "../../infrastructure/interface/command-factory.interface";
import type { ICommandRegistrar } from "../../infrastructure/interface/command-registrar.interface";
import type { ICommand } from "../../infrastructure/interface/command.interface";
import type { TInitCommandProperties } from "../../infrastructure/type/init-command-properties.type";

import { COMMAND_FLAG_CONFIG } from "../../application/constant/command-flag-config.constant";
import { CommandOptionsMapper } from "../../application/mapper/command-options.mapper";
import { ECommand } from "../../infrastructure/enum/command.enum";

/**
 * Registrar for the 'init' command.
 * Configures and registers the command that initializes project configuration files.
 */
export class InitCommandRegistrar implements ICommandRegistrar {
	/** The command factory used to create command instances */
	readonly COMMAND_FACTORY: ICommandFactory;

	/** The root Commander program instance */
	readonly PROGRAM: Command;

	/**
	 * Initializes a new instance of the InitCommandRegistrar.
	 *
	 * @param program - The Commander program to attach the command to
	 * @param commandFactory - Factory for creating command instances
	 */
	constructor(program: Command, commandFactory: ICommandFactory) {
		this.PROGRAM = program;
		this.COMMAND_FACTORY = commandFactory;
	}

	/**
	 * Configures and registers the 'init' command.
	 * Sets up command description, options, and action handler.
	 *
	 * @returns The configured Commander command instance
	 */
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
