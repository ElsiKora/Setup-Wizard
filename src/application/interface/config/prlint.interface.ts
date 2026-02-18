import type { IConfigPrlintGeneration } from "./prlint-generation.interface";
import type { IConfigPrlintGithub } from "./prlint-github.interface";
import type { IConfigPrlintLint } from "./prlint-lint.interface";
import type { IConfigPrlintTicket } from "./prlint-ticket.interface";

export interface IConfigPrlint {
	generation?: IConfigPrlintGeneration;
	github?: IConfigPrlintGithub;
	isEnabled?: boolean;
	isScriptsEnabled?: boolean;
	lint?: IConfigPrlintLint;
	ticket?: IConfigPrlintTicket;
}
