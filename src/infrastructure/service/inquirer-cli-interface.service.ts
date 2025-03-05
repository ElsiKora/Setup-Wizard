/* eslint-disable @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit,@elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-call,@elsikora-typescript/no-unsafe-return,@elsikora-sonar/function-return-type */
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

import chalk from "chalk";
// @ts-ignore
// eslint-disable-next-line elsikora-node/no-extraneous-import
import inquirer from "inquirer";
// @ts-ignore
import ora from "ora";

/**
 * Implementation of the CLI interface service using Inquirer.js.
 * Provides user interaction capabilities through a command-line interface,
 * including prompts, confirmations, selections, and visual feedback.
 */
export class InquirerCliInterface implements ICliInterfaceService {
	// @ts-ignore
	/** Spinner for showing loading/processing states */
	private readonly SPINNER: any;

	/**
	 * Initializes a new instance of the InquirerCliInterface.
	 * Sets up the spinner for providing visual feedback during operations.
	 */
	constructor() {
		this.SPINNER = ora();
	}

	/**
	 * Clears the console screen.
	 */
	clear(): void {
		console.clear();
	}

	/**
	 * Prompts the user with a yes/no confirmation question.
	 *
	 * @param message - The question to ask the user
	 * @param isConfirmedByDefault - Whether "Yes" should be the default option
	 * @returns Promise resolving to true for "Yes" and false for "No"
	 */
	async confirm(message: string, isConfirmedByDefault: boolean = false): Promise<boolean> {
		try {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
			const answer: any = await inquirer.prompt({
				// eslint-disable-next-line @elsikora-typescript/naming-convention
				default: isConfirmedByDefault,
				message,
				name: "confirmation",
				type: "confirm",
			});

			return answer.confirmation;
		} catch {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	/**
	 * Displays an error message in red.
	 *
	 * @param message - The error message to display
	 */
	error(message: string): void {
		console.error(chalk.red(message));
	}

	/**
	 * Prompts the user to select multiple options from grouped choices.
	 *
	 * @param message - The prompt message to display
	 * @param options - Record of group names to arrays of selection options
	 * @param isRequired - Whether at least one selection is required
	 * @param initialValues - Array of pre-selected values
	 * @returns Promise resolving to an array of selected values
	 */
	async groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		const choices: Array<any> = [];

		for (const [group, groupOptions] of Object.entries(options)) {
			for (const opt of groupOptions) {
				choices.push({
					// eslint-disable-next-line @elsikora-typescript/naming-convention
					checked: initialValues?.includes(opt.value) ?? false,
					name: `${group}: ${opt.label}`,
					value: opt.value,
				});
			}
		}

		try {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
			const answer: any = await inquirer.prompt({
				choices,
				message: `${message} (space to select)`,
				name: "selection",
				type: "checkbox",
				// @ts-ignore
				validate: isRequired ? (input: Array<any> | string): boolean | string | undefined => input.length > 0 || "You must select at least one option" : undefined,
			});

			return answer.selection as Array<T>;
		} catch {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	/**
	 * Handles and displays an error with optional error details.
	 *
	 * @param message - The error message to display
	 * @param error - The error object with details
	 */
	handleError(message: string, error: unknown): void {
		console.error(chalk.red(message));
		console.error(error);
	}

	/**
	 * Displays an informational message in blue.
	 *
	 * @param message - The information message to display
	 */
	info(message: string): void {
		console.log(chalk.blue(message));
	}

	/**
	 * Displays a plain log message.
	 *
	 * @param message - The message to log
	 */
	log(message: string): void {
		console.log(message);
	}

	/**
	 * Prompts the user to select multiple options from choices.
	 *
	 * @param message - The prompt message to display
	 * @param options - Array of selection options
	 * @param isRequired - Whether at least one selection is required
	 * @param initialValues - Array of pre-selected values
	 * @returns Promise resolving to an array of selected values
	 */
	async multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		// eslint-disable-next-line @elsikora-typescript/naming-convention
		const choices: Array<{ checked: boolean; name: string; value: string }> = options.map((opt: ICliInterfaceServiceSelectOptions) => ({
			// eslint-disable-next-line @elsikora-typescript/naming-convention
			checked: initialValues?.includes(opt.value) ?? false,
			name: opt.label,
			value: opt.value,
		}));

		try {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
			const answer: any = await inquirer.prompt({
				choices,
				message: `${message} (space to select)`,
				name: "selection",
				type: "checkbox",
				// @ts-ignore
				validate: isRequired ? (input: Array<any> | string): boolean | string | undefined => input.length > 0 || "You must select at least one option" : undefined,
			});

			return answer.selection as Array<T>;
		} catch {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	/**
	 * Displays a note with a bold title and message.
	 *
	 * @param title - The bold title of the note
	 * @param message - The message content of the note
	 */
	note(title: string, message: string): void {
		console.log(chalk.bold(title));
		console.log(message);
	}

	/**
	 * Prompts the user to select a single option from choices.
	 *
	 * @param message - The prompt message to display
	 * @param options - Array of selection options
	 * @param initialValue - Pre-selected value
	 * @returns Promise resolving to the selected value
	 */
	async select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T> {
		const choices: Array<{ name: string; value: string }> = options.map((opt: ICliInterfaceServiceSelectOptions) => ({ name: opt.label, value: opt.value }));

		try {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
			const answer: any = await inquirer.prompt({
				choices,
				default: initialValue,
				message,
				name: "selection",
				type: "list",
			});

			return answer.selection as T;
		} catch {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	/**
	 * Starts a spinner with a message to indicate ongoing operation.
	 *
	 * @param message - The message to display alongside the spinner
	 */
	startSpinner(message: string): void {
		this.SPINNER.start(message);
	}

	/**
	 * Stops the spinner and optionally displays a completion message.
	 *
	 * @param message - Optional message to display after stopping the spinner
	 */
	stopSpinner(message?: string): void {
		this.SPINNER.stop();

		if (message) {
			console.log(message);
		}
	}

	/**
	 * Displays a success message in green.
	 *
	 * @param message - The success message to display
	 */
	success(message: string): void {
		console.log(chalk.green(message));
	}

	/**
	 * Prompts the user for text input.
	 *
	 * @param message - The prompt message to display
	 * @param placeholder - Optional placeholder text
	 * @param initialValue - Optional initial value for the input
	 * @param validate - Optional validation function for the input
	 * @returns Promise resolving to the entered text
	 */
	async text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => Error | string | undefined): Promise<string> {
		try {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
			const answer: any = await inquirer.prompt({
				default: initialValue,
				message,
				name: "text",
				type: "input",
				validate: validate
					? (input: string): boolean | string => {
							const result: Error | string | undefined = validate(input);

							if (result === undefined) return true;

							if (typeof result === "string") return result;

							if (result instanceof Error) return result.message;

							return "Invalid input";
						}
					: undefined,
			});

			return answer.text;
		} catch {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	/**
	 * Displays a warning message in yellow.
	 *
	 * @param message - The warning message to display
	 */
	warn(message: string): void {
		console.log(chalk.yellow(message));
	}
}
