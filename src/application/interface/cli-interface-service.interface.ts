import { ICliInterfaceServiceSelectOptions } from "../../domain/interface/cli-interface-service-select-options.interface";

export interface ICliInterfaceService {
	success(message: string): void;
	warn(message: string): void;
	log(message: string): void;
	error(message: string): void;
	clear(): void;
	select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T>;
	confirm(message: string, initialValue?: boolean): Promise<boolean>;
	startSpinner(message: string): void;
	stopSpinner(message?: string): void;
	note(title: string, message: string): void;
	handleError(message: string, error: unknown): void;
	text(message: string, placeholder?: string, initialValue?: string, validate?: (value: string) => string | Error | undefined): Promise<string>;
	multiselect<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, required?: boolean, initialValue?: Array<string>): Promise<Array<T>>;
	groupMultiselect<T>(message: string, options: Record<string, Array<ICliInterfaceServiceSelectOptions>>, required?: boolean, initialValue?: Array<string>): Promise<Array<T>>;
	info(message: string): void;
}
