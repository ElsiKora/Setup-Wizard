import type { IConfigCommitlintTicket } from "../../interface/config/commitlint-ticket.interface";
import type { IConfigCommitlint } from "../../interface/config/commitlint.interface";

import { ECommitlintMode } from "../../../domain/enum/commitlint-mode.enum";
import { ECommitlintProvider } from "../../../domain/enum/commitlint-provider.enum";
import { ECommitlintTicketMissingBranchLintBehavior } from "../../../domain/enum/commitlint-ticket-missing-branch-lint-behavior.enum";
import { ECommitlintTicketNormalization } from "../../../domain/enum/commitlint-ticket-normalization.enum";
import { ECommitlintTicketSource } from "../../../domain/enum/commitlint-ticket-source.enum";

const DEFAULT_MAX_RETRIES: number = 3;
const DEFAULT_VALIDATION_MAX_RETRIES: number = 3;

export const COMMITLINT_AI_DEFAULTS: {
	maxRetries: number;
	mode: ECommitlintMode;
	model: string;
	provider: ECommitlintProvider;
	ticket: {
		missingBranchLintBehavior: ECommitlintTicketMissingBranchLintBehavior;
		normalization: ECommitlintTicketNormalization;
		pattern: string;
		patternFlags: string;
		source: ECommitlintTicketSource;
	};
	validationMaxRetries: number;
} = {
	maxRetries: DEFAULT_MAX_RETRIES,
	mode: ECommitlintMode.AUTO,
	model: "claude-opus-4-5",
	provider: ECommitlintProvider.ANTHROPIC,
	ticket: {
		missingBranchLintBehavior: ECommitlintTicketMissingBranchLintBehavior.ERROR,
		normalization: ECommitlintTicketNormalization.UPPER,
		pattern: "[a-z]{2,}-[0-9]+",
		patternFlags: "i",
		source: ECommitlintTicketSource.BRANCH_LINT,
	},
	validationMaxRetries: DEFAULT_VALIDATION_MAX_RETRIES,
};

/**
 * Generates commitlint-ai plugin configuration.
 * The template mirrors current plugin options, including ticket extraction settings.
 */
export const COMMITLINT_AI_CONFIG: {
	template: (config?: IConfigCommitlint | null) => string;
} = {
	template: (config?: IConfigCommitlint | null): string => {
		const mode: ECommitlintMode = config?.mode ?? COMMITLINT_AI_DEFAULTS.mode;
		const model: string = config?.model ?? COMMITLINT_AI_DEFAULTS.model;
		const provider: ECommitlintProvider = config?.provider ?? COMMITLINT_AI_DEFAULTS.provider;
		const maxRetries: number = typeof config?.maxRetries === "number" ? config.maxRetries : COMMITLINT_AI_DEFAULTS.maxRetries;
		const validationMaxRetries: number = typeof config?.validationMaxRetries === "number" ? config.validationMaxRetries : COMMITLINT_AI_DEFAULTS.validationMaxRetries;
		const ticketConfig: IConfigCommitlintTicket | undefined = config?.ticket;

		const ticketSource: ECommitlintTicketSource = ticketConfig?.source ?? COMMITLINT_AI_DEFAULTS.ticket.source;
		const ticketPattern: string = ticketConfig?.pattern ?? COMMITLINT_AI_DEFAULTS.ticket.pattern;
		const ticketPatternFlags: string = ticketConfig?.patternFlags ?? COMMITLINT_AI_DEFAULTS.ticket.patternFlags;
		const ticketNormalization: ECommitlintTicketNormalization = ticketConfig?.normalization ?? COMMITLINT_AI_DEFAULTS.ticket.normalization;
		const ticketMissingBranchLintBehavior: ECommitlintTicketMissingBranchLintBehavior = ticketConfig?.missingBranchLintBehavior ?? COMMITLINT_AI_DEFAULTS.ticket.missingBranchLintBehavior;

		return `export default {
	maxRetries: ${maxRetries},
	mode: ${JSON.stringify(mode)},
	model: ${JSON.stringify(model)},
	provider: ${JSON.stringify(provider)},
	ticket: {
		source: ${JSON.stringify(ticketSource)},
		pattern: ${JSON.stringify(ticketPattern)},
		patternFlags: ${JSON.stringify(ticketPatternFlags)},
		normalization: ${JSON.stringify(ticketNormalization)},
		missingBranchLintBehavior: ${JSON.stringify(ticketMissingBranchLintBehavior)},
	},
	validationMaxRetries: ${validationMaxRetries},
};`;
	},
};
