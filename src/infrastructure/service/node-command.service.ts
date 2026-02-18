import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICommandService } from "../../application/interface/command-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";
import type { INodeCommandNpmError } from "../interface/node-command-npm-error.interface";

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
			if (this.isNpmCommand(command)) {
				this.formatAndParseNpmError(command, error as INodeCommandNpmError);
				await this.handleNpmInstallFailure(command);
			} else {
				// For non-npm commands, throw the error as before
				throw error;
			}
		}
	}

	/**
	 * Formats and outputs npm error in readable format.
	 * @param command - The original npm command that failed
	 * @param error - npm error object
	 * @returns void
	 */
	private formatAndParseNpmError(command: string, error: INodeCommandNpmError): void {
		const parsedError: {
			conflictDetails: Array<string>;
			errorCode: null | string;
			logFile: null | string;
			resolutionAdvice: null | string;
		} = this.parseNpmError(error.stderr);

		this.CLI_INTERFACE_SERVICE.error("NPM command failed.");
		this.CLI_INTERFACE_SERVICE.info(`Command: ${command}`);
		this.CLI_INTERFACE_SERVICE.info("Error details:");

		if (parsedError.errorCode) {
			this.CLI_INTERFACE_SERVICE.warn(`Code: ${parsedError.errorCode}`);
		}

		if (parsedError.conflictDetails.length > 0) {
			this.CLI_INTERFACE_SERVICE.warn("Dependency conflict:");

			for (const detail of parsedError.conflictDetails) {
				this.CLI_INTERFACE_SERVICE.warn(`- ${detail}`);
			}
		}

		if (parsedError.resolutionAdvice) {
			this.CLI_INTERFACE_SERVICE.info(`Resolution: ${parsedError.resolutionAdvice}`);
		}

		if (parsedError.logFile) {
			this.CLI_INTERFACE_SERVICE.info(`Log file: ${parsedError.logFile}`);
		}

		if (!parsedError.errorCode && parsedError.conflictDetails.length === 0 && !parsedError.resolutionAdvice && !parsedError.logFile) {
			this.CLI_INTERFACE_SERVICE.error("Unknown error occurred.");
		}
	}

	/**
	 * Handles npm install command failures by offering retry options to the user.
	 * @param originalCommand - The original npm command that failed
	 * @returns Promise that resolves when the chosen action completes
	 * @throws Will throw an error if the user chooses to cancel or if retried command still fails
	 */
	private async handleNpmInstallFailure(originalCommand: string): Promise<void> {
		this.CLI_INTERFACE_SERVICE.warn("npm command execution failed.");

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

	/**
	 * Determines whether command is npm package management command.
	 * @param command - The command to check
	 * @returns True if command is supported npm command
	 */
	private isNpmCommand(command: string): boolean {
		const normalizedCommand: string = command.trim();

		return normalizedCommand.startsWith("npm install") || normalizedCommand.startsWith("npm ci") || normalizedCommand.startsWith("npm update") || normalizedCommand.startsWith("npm uninstall");
	}

	/**
	 * Parses npm error output to structured information.
	 * @param stderr - npm stderr output
	 * @returns Parsed npm error details
	 */
	private parseNpmError(stderr?: string): {
		conflictDetails: Array<string>;
		errorCode: null | string;
		logFile: null | string;
		resolutionAdvice: null | string;
	} {
		const parsedError: {
			conflictDetails: Array<string>;
			errorCode: null | string;
			logFile: null | string;
			resolutionAdvice: null | string;
		} = {
			conflictDetails: [],
			errorCode: null,
			logFile: null,
			resolutionAdvice: null,
		};

		if (!stderr) {
			return parsedError;
		}

		const lines: Array<string> = stderr.split("\n").filter((line: string) => line.trim());

		for (const line of lines) {
			if (line.includes("npm error code")) {
				parsedError.errorCode = line.replace("npm error code", "").trim();
			} else if (line.includes("While resolving") || line.includes("Found") || line.includes("Could not resolve dependency") || line.includes("Conflicting peer dependency")) {
				parsedError.conflictDetails.push(line.replace("npm error", "").trim());
			} else if (line.includes("Fix the upstream dependency conflict") || line.includes("--force") || line.includes("--legacy-peer-deps")) {
				parsedError.resolutionAdvice = line.replace("npm error", "").trim();
			} else if (line.includes("A complete log of this run can be found in")) {
				parsedError.logFile = line.replace("npm error", "").trim();
			}
		}

		return parsedError;
	}
}
