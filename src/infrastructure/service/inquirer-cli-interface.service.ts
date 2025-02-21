/* eslint-disable @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit,@elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-call,@elsikora-typescript/no-unsafe-return,@elsikora-sonar/function-return-type */
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

import chalk from "chalk";
// @ts-ignore
// eslint-disable-next-line elsikora-node/no-extraneous-import
import inquirer from "inquirer";
// @ts-ignore
import ora from "ora";

export class InquirerCliInterface implements ICliInterfaceService {
	// @ts-ignore
	private readonly SPINNER: ora.Ora;

	constructor() {
		// eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment
		this.SPINNER = ora();
	}

	clear(): void {
		console.clear();
	}

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

	error(message: string): void {
		console.error(chalk.red(message));
	}

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

	handleError(message: string, error: unknown): void {
		console.error(chalk.red(message));
		console.error(error);
	}

	info(message: string): void {
		console.log(chalk.blue(message));
	}

	log(message: string): void {
		console.log(message);
	}

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

	note(title: string, message: string): void {
		console.log(chalk.bold(title));
		console.log(message);
	}

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

	startSpinner(message: string): void {
		this.SPINNER.start(message);
	}

	stopSpinner(message?: string): void {
		this.SPINNER.stop();

		if (message) {
			console.log(message);
		}
	}

	success(message: string): void {
		console.log(chalk.green(message));
	}

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

	warn(message: string): void {
		console.log(chalk.yellow(message));
	}
}
