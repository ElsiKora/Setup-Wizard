import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

export class InquirerCliInterface implements ICliInterfaceService {
	private spinner: ora.Ora;

	constructor() {
		this.spinner = ora();
	}

	success(message: string): void {
		console.log(chalk.green(message));
	}

	warn(message: string): void {
		console.log(chalk.yellow(message));
	}

	log(message: string): void {
		console.log(message);
	}

	error(message: string): void {
		console.error(chalk.red(message));
	}

	clear(): void {
		console.clear();
	}

	async select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T> {
		const choices = options.map((opt) => ({ name: opt.label, value: opt.value }));
		try {
			const answer = await inquirer.prompt({
				type: "list",
				name: "selection",
				message,
				choices,
				default: initialValue,
			});
			return answer.selection as T;
		} catch (error) {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	async confirm(message: string, initialValue?: boolean): Promise<boolean> {
		try {
			const answer = await inquirer.prompt({
				type: "confirm",
				name: "confirmation",
				message,
				default: initialValue,
			});
			return answer.confirmation;
		} catch (error) {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	startSpinner(message: string): void {
		this.spinner.start(message);
	}

	stopSpinner(message?: string): void {
		this.spinner.stop();
		if (message) {
			console.log(message);
		}
	}

	note(title: string, message: string): void {
		console.log(chalk.bold(title));
		console.log(message);
	}

	handleError(message: string, error: unknown): void {
		console.error(chalk.red(message));
		console.error(error);
	}

	async text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => string | Error | undefined): Promise<string> {
		try {
			const answer = await inquirer.prompt({
				type: "input",
				name: "text",
				message,
				default: initialValue,
				validate: validate
					? (input) => {
							const result = validate(input);
							if (result === undefined) return true; // Валидно
							if (typeof result === "string") return result; // Сообщение об ошибке
							if (result instanceof Error) return result.message; // Сообщение из Error
							return "Invalid input"; // На всякий случай
						}
					: undefined,
			});
			return answer.text;
		} catch (error) {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	async multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, required?: boolean, initialValues?: Array<string>): Promise<Array<T>> {
		const choices = options.map((opt) => ({
			name: opt.label,
			value: opt.value,
			checked: initialValues?.includes(opt.value) || false,
		}));
		try {
			const answer = await inquirer.prompt({
				type: "checkbox",
				name: "selection",
				message: `${message} (space to select)`,
				choices,
				validate: required ? (input) => input.length > 0 || "You must select at least one option" : undefined,
			});
			return answer.selection as Array<T>;
		} catch (error) {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	async groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, required?: boolean, initialValues?: Array<string>): Promise<Array<T>> {
		const choices = [];
		for (const [group, groupOptions] of Object.entries(options)) {
			for (const opt of groupOptions) {
				choices.push({
					name: `${group}: ${opt.label}`,
					value: opt.value,
					checked: initialValues?.includes(opt.value) || false,
				});
			}
		}
		try {
			const answer = await inquirer.prompt({
				type: "checkbox",
				name: "selection",
				message: `${message} (space to select)`,
				choices,
				validate: required ? (input) => input.length > 0 || "You must select at least one option" : undefined,
			});
			return answer.selection as Array<T>;
		} catch (error) {
			this.error("Operation cancelled by user");
			process.exit(0);
		}
	}

	info(message: string): void {
		console.log(chalk.blue(message));
	}
}
