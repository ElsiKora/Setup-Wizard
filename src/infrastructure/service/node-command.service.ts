import type { ICommandService } from "../../application/interface/command-service.interface";

import { exec } from "node:child_process";
import { promisify } from "node:util";

/**
 * Implementation of the command service using Node.js child_process.
 * Provides functionality to execute shell commands.
 */
export class NodeCommandService implements ICommandService {
	/**
	 * Promisified version of the exec function from child_process.
	 * Allows for async/await usage of command execution.
	 */
	private readonly EXEC_ASYNC: (argument1: string) => Promise<{ stderr: string; stdout: string }> = promisify(exec);

	/**
	 * Executes a shell command.
	 *
	 * @param command - The shell command to execute
	 * @returns Promise that resolves when the command completes successfully
	 * @throws Will throw an error if the command execution fails
	 */
	async execute(command: string): Promise<void> {
		await this.EXEC_ASYNC(command);
	}
}
