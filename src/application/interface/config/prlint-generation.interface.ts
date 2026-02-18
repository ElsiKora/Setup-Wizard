import type { EPrlintGenerationProvider } from "../../../domain/enum/prlint-generation-provider.enum";

export interface IConfigPrlintGeneration {
	model?: string;
	provider?: EPrlintGenerationProvider;
	retries?: number;
	validationRetries?: number;
}
