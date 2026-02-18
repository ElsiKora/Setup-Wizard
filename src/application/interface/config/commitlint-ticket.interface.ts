import type { ECommitlintTicketMissingBranchLintBehavior } from "../../../domain/enum/commitlint-ticket-missing-branch-lint-behavior.enum";
import type { ECommitlintTicketNormalization } from "../../../domain/enum/commitlint-ticket-normalization.enum";
import type { ECommitlintTicketSource } from "../../../domain/enum/commitlint-ticket-source.enum";

export interface IConfigCommitlintTicket {
	missingBranchLintBehavior?: ECommitlintTicketMissingBranchLintBehavior;
	normalization?: ECommitlintTicketNormalization;
	pattern?: string;
	patternFlags?: string;
	source?: ECommitlintTicketSource;
}
