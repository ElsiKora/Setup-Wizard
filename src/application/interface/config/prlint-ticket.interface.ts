import type { EPrlintTicketMissingBranchLintBehavior } from "../../../domain/enum/prlint-ticket-missing-branch-lint-behavior.enum";
import type { EPrlintTicketNormalization } from "../../../domain/enum/prlint-ticket-normalization.enum";
import type { EPrlintTicketSource } from "../../../domain/enum/prlint-ticket-source.enum";

export interface IConfigPrlintTicket {
	missingBranchLintBehavior?: EPrlintTicketMissingBranchLintBehavior;
	normalization?: EPrlintTicketNormalization;
	pattern?: string;
	patternFlags?: string;
	source?: EPrlintTicketSource;
}
