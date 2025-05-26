/* eslint-disable @elsikora/typescript/no-unsafe-call,@elsikora/typescript/naming-convention,@elsikora/unicorn/no-process-exit,@elsikora/typescript/no-unsafe-member-access */
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

// @ts-ignore
import { confirm, groupMultiselect, isCancel, log, multiselect, note, select, spinner, text } from "@clack/prompts";

/**
 * Implementation of the CLI interface service using the Clack library.
 * Provides methods for interacting with the user through the command line.
 */
export class ClackCliInterface implements ICliInterfaceService {
	/** Reference to the active spinner instance */
	private spinner: { start(message: string): void; stop(message?: string): void } | undefined;

	/**
	 * Clears the console screen.
	 */
	clear(): void {
		// eslint-disable-next-line @elsikora/javascript/no-console
		console.clear();
	}

	/**
	 * Displays a confirmation prompt to the user.
	 * @param message - The message to display to the user
	 * @param isConfirmedByDefault - The default value for the confirmation, defaults to false
	 * @returns Promise that resolves to the user's response (true for confirmed, false for declined)
	 */
	async confirm(message: string, isConfirmedByDefault: boolean = false): Promise<boolean> {
		const isConfirmed: boolean = (await confirm({
			initialValue: isConfirmedByDefault,
			message,
		})) as boolean;

		if (isCancel(isConfirmed)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return isConfirmed;
		}
	}

	/**
	 * Displays an error message to the user.
	 * @param message - The error message to display
	 */
	error(message: string): void {
		log.error(message);
	}

	/**
	 * Displays a grouped multi-select prompt to the user.
	 * @param message - The message to display to the user
	 * @param options - Record of groups and their options
	 * @param isRequired - Whether a selection is required, defaults to false
	 * @param initialValues - Initial selected values
	 * @returns Promise that resolves to an array of selected values
	 */
	async groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		const result: Array<T> = (await groupMultiselect({
			initialValues,
			message: `${message} (space to select)`,
			options,

			required: isRequired,
		})) as Array<T>;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	/**
	 * Handles and displays an error message with additional error details.
	 * @param message - The error message to display
	 * @param error - The error object or details
	 */
	handleError(message: string, error: unknown): void {
		log.error(message);
		console.error(error);
	}

	/**
	 * Displays an informational message to the user.
	 * @param message - The info message to display
	 */
	info(message: string): void {
		log.info(message);
	}

	/**
	 * Displays a standard message to the user.
	 * @param message - The message to display
	 */
	log(message: string): void {
		log.message(message);
	}

	/**
	 * Displays a multi-select prompt to the user.
	 * @param message - The message to display to the user
	 * @param options - Array of options to select from
	 * @param isRequired - Whether a selection is required, defaults to false
	 * @param initialValues - Initial selected values
	 * @returns Promise that resolves to an array of selected values
	 */
	async multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		const result: Array<T> = (await multiselect({
			initialValues,
			message: `${message} (space to select)`,
			options,

			required: isRequired,
		})) as Array<T>;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	/**
	 * Displays a note to the user with a title and message.
	 * @param title - The title of the note
	 * @param message - The message content of the note
	 */
	note(title: string, message: string): void {
		note(message, title);
	}

	/**
	 * Displays a single select prompt to the user.
	 * @param message - The message to display to the user
	 * @param options - Array of options to select from
	 * @param initialValue - Initial selected value
	 * @returns Promise that resolves to the selected value
	 */
	async select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T> {
		const result: T = (await select({
			initialValue,
			message,
			options,
		})) as T;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	/**
	 * Starts a spinner with the specified message.
	 * Stops any existing spinner first.
	 * @param message - The message to display while the spinner is active
	 */
	startSpinner(message: string): void {
		if (typeof this.spinner?.stop === "function") {
			this.spinner.stop();
		}

		this.spinner = spinner() as { start(message: string): void; stop(message?: string): void };

		this.spinner.start(message);
	}

	/**
	 * Stops the current spinner with an optional completion message.
	 * @param message - Optional message to display when the spinner stops
	 */
	stopSpinner(message?: string): void {
		if (typeof this.spinner?.stop === "function") {
			this.spinner.stop(message);
		}
	}

	/**
	 * Displays a success message to the user.
	 * @param message - The success message to display
	 */
	success(message: string): void {
		log.success(message);
	}

	/**
	 * Displays a text input prompt to the user.
	 * @param message - The message to display to the user
	 * @param placeholder - Optional placeholder text for the input field
	 * @param initialValue - Optional initial value for the input field
	 * @param validate - Optional validation function for the input
	 * @returns Promise that resolves to the user's input text
	 */
	async text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => Error | string | undefined): Promise<string> {
		const result: string = (await text({
			initialValue,
			message,
			placeholder,
			validate,
		})) as string;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	/**
	 * Displays a warning message to the user.
	 * @param message - The warning message to display
	 */
	warn(message: string): void {
		log.warn(message);
	}
}
