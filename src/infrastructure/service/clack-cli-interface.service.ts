/* eslint-disable @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit */
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

import { confirm, groupMultiselect, isCancel, log, multiselect, note, select, spinner, text } from "@clack/prompts";

export class ClackCliInterface implements ICliInterfaceService {
	private spinner: any;

	clear(): void {
		console.clear();
	}

	async confirm(message: string, isConfirmedByDefault: boolean = false): Promise<boolean> {
		const isConfirmed: boolean = (await confirm({
			// eslint-disable-next-line @elsikora-typescript/naming-convention
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

	error(message: string): void {
		log.error(message);
	}

	async groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		const result: Array<T> = (await groupMultiselect({
			initialValues,
			message: `${message} (space to select)`,
			options,
			// eslint-disable-next-line @elsikora-typescript/naming-convention
			required: isRequired,
		})) as Array<T>;

		if (isCancel(result)) {
			this.error("Operation cancelled by user");
			process.exit(0);
		} else {
			return result;
		}
	}

	handleError(message: string, error: unknown): void {
		log.error(message);
		console.log(error);
	}

	info(message: string): void {
		log.info(message);
	}

	log(message: string): void {
		log.message(message);
	}

	async multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, isRequired: boolean = false, initialValues?: Array<string>): Promise<Array<T>> {
		const result: Array<T> = (await multiselect({
			initialValues,
			message: `${message} (space to select)`,
			options,
			// eslint-disable-next-line @elsikora-typescript/naming-convention
			required: isRequired,
		})) as Array<T>;

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

	startSpinner(message: string): void {
		// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access
		if (typeof this.spinner?.stop === "function") {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-call
			this.spinner.stop();
		}

		this.spinner = spinner();
		// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-call
		this.spinner.start(message);
	}

	stopSpinner(message?: string): void {
		// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access
		if (typeof this.spinner?.stop === "function") {
			// eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-call
			this.spinner.stop(message);
		}
	}

	success(message: string): void {
		log.success(message);
	}

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

	warn(message: string): void {
		log.warn(message);
	}
}
