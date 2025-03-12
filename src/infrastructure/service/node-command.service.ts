import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICommandService } from "../../application/interface/command-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

import { exec } from "node:child_process";
import { promisify } from "node:util";

/**
 * Implementation of the command service using Node.js child_process.
 * Provides functionality to execute shell commands.
 */
export class NodeCommandService implements ICommandService {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/**
	 * Promisified version of the exec function from child_process.
	 * Allows for async/await usage of command execution.
	 */
	private readonly EXEC_ASYNC: (argument1: string) => Promise<{ stderr: string; stdout: string }> = promisify(exec);

	constructor(cliInterfaceService: ICliInterfaceService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
	}

	/**
	 * Executes a shell command.
	 * @param command - The shell command to execute
	 * @returns Promise that resolves when the command completes successfully
	 * @throws Will throw an error if the command execution fails, except for npm install which offers retry options
	 */
	async execute(command: string): Promise<void> {
		try {
			await this.EXEC_ASYNC(command);
		} catch (error) {
			// Check if the failed command is npm
			if (command.trim().startsWith("npm install") || command.trim().startsWith("npm ci") || command.trim().startsWith("npm update") || command.trim().startsWith("npm uninstall")) {
				await this.handleNpmInstallFailure(command);
			} else {
				// For non-npm commands, throw the error as before
				throw error;
			}
		}
	}

	/**
	 * Handles npm install command failures by offering retry options to the user.
	 * @param originalCommand - The original npm command that failed
	 * @returns Promise that resolves when the chosen action completes
	 * @throws Will throw an error if the user chooses to cancel or if retried command still fails
	 */
	private async handleNpmInstallFailure(originalCommand: string): Promise<void> {
		this.CLI_INTERFACE_SERVICE.warn("npm command exection failed.");

		const options: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "Retry with --force", value: "force" },
			{ label: "Retry with --legacy-peer-deps", value: "legacy-peer-deps" },
			{ label: "Cancel command execution", value: "cancel" },
		];

		const choice: string = await this.CLI_INTERFACE_SERVICE.select<string>("How would you like to proceed?", options);

		switch (choice) {
			case "force": {
				this.CLI_INTERFACE_SERVICE.info("Retrying with --force flag...");
				await this.EXEC_ASYNC(`${originalCommand} --force`);
				this.CLI_INTERFACE_SERVICE.success("Execution completed with --force flag.");

				break;
			}

			case "legacy-peer-deps": {
				this.CLI_INTERFACE_SERVICE.info("Retrying with --legacy-peer-deps flag...");
				await this.EXEC_ASYNC(`${originalCommand} --legacy-peer-deps`);
				this.CLI_INTERFACE_SERVICE.success("Execution completed with --legacy-peer-deps flag.");

				break;
			}

			case "cancel": {
				this.CLI_INTERFACE_SERVICE.info("Execution cancelled by user.");

				throw new Error("npm command execution was cancelled by user.");
			}

			default: {
				throw new Error("Invalid option selected.");
			}
		}
	}
}
