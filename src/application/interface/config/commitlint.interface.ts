import type { ECommitlintMode } from "../../../domain/enum/commitlint-mode.enum";
import type { ECommitlintProvider } from "../../../domain/enum/commitlint-provider.enum";

import type { IConfigCommitlintTicket } from "./commitlint-ticket.interface";

export interface IConfigCommitlint {
	isCommitCommandEnabled?: boolean;
	isEnabled?: boolean;
	maxRetries?: number;
	mode?: ECommitlintMode;
	model?: string;
	provider?: ECommitlintProvider;
	ticket?: IConfigCommitlintTicket;
	validationMaxRetries?: number;
}
