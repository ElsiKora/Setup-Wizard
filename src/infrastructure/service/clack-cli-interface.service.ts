import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { confirm, spinner, log, select, note, text, multiselect, groupMultiselect, isCancel } from "@clack/prompts";
import { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

export class ClackCliInterface implements ICliInterfaceService {
	private SPINNER: any;

	constructor() {}

	async multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, required?: boolean, initialValues?: Array<string>): Promise<Array<T>> {
		const result = (await multiselect({
			options,
			message: `${message} (space to select)`,
			required,
			initialValues,
		})) as Array<T>;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	async groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, required?: boolean, initialValues?: Array<string>): Promise<Array<T>> {
		const result = (await groupMultiselect({
			options,
			message: `${message} (space to select)`,
			required,
			initialValues,
		})) as Array<T>;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	async text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => string | Error | undefined): Promise<string> {
		const result = (await text({
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

	note(title: string, message: string): void {
		note(message, title);
	}

	warn(message: string): void {
		log.warn(message);
	}

	log(message: string): void {
		log.message(message);
	}

	handleError(message: string, error: unknown): void {
		log.error(message);
		console.log(error);
	}

	error(message: string): void {
		log.error(message);
	}

	success(message: string): void {
		log.success(message);
	}

	clear(): void {
		console.clear();
	}

	info(message: string): void {
		log.info(message);
	}

	async confirm(message: string, initialValue?: boolean): Promise<boolean> {
		const result = (await confirm({
			initialValue,
			message,
		})) as boolean;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	startSpinner(message: string): void {
		if (typeof this.SPINNER?.stop === "function") {
			this.SPINNER.stop();
		}

		this.SPINNER = spinner();
		this.SPINNER.start(message);
	}

	stopSpinner(message?: string): void {
		if (typeof this.SPINNER?.stop === "function") {
			this.SPINNER.stop(message);
		}
	}

	async select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T> {
		const result = (await select({
			options,
			message,
			initialValue,
		})) as T;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}
}
