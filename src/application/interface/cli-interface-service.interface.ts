import type { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

export interface ICliInterfaceService {
	clear(): void;
	confirm(message: string, isConfirmedByDefault?: boolean): Promise<boolean>;
	error(message: string): void;
	groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, isRequired?: boolean, initialValue?: Array<string>): Promise<Array<T>>;
	handleError(message: string, error: unknown): void;
	info(message: string): void;
	log(message: string): void;
	multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, isRequired?: boolean, initialValue?: Array<string>): Promise<Array<T>>;
	note(title: string, message: string): void;
	select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T>;
	startSpinner(message: string): void;
	stopSpinner(message?: string): void;
	success(message: string): void;
	text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => Error | string | undefined): Promise<string>;
	warn(message: string): void;
}
