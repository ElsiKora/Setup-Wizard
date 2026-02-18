import type { IConfigPrlintGeneration } from "../../interface/config/prlint-generation.interface";
import type { IConfigPrlintGithub } from "../../interface/config/prlint-github.interface";
import type { IConfigPrlintLint } from "../../interface/config/prlint-lint.interface";
import type { IConfigPrlintTicket } from "../../interface/config/prlint-ticket.interface";
import type { IConfigPrlint } from "../../interface/config/prlint.interface";

import { EPrlintGenerationProvider } from "../../../domain/enum/prlint-generation-provider.enum";
import { EPrlintTicketMissingBranchLintBehavior } from "../../../domain/enum/prlint-ticket-missing-branch-lint-behavior.enum";
import { EPrlintTicketNormalization } from "../../../domain/enum/prlint-ticket-normalization.enum";
import { EPrlintTicketSource } from "../../../domain/enum/prlint-ticket-source.enum";

const DEFAULT_BASE_BRANCH: string = "dev";
const IS_DRAFT_DEFAULT: boolean = false;
const DEFAULT_FORBIDDEN_PLACEHOLDERS: Array<string> = ["WIP", "TODO", "<!--", "TEMPLATE", "lorem ipsum", "[ ]", "<replace-me>"];
const DEFAULT_MAX_RETRIES: number = 3;
const DEFAULT_MODEL: string = "claude-opus-4-5";
const DEFAULT_PROHIBITED_BRANCHES: Array<string> = ["main", "master"];
const DEFAULT_PROVIDER: EPrlintGenerationProvider = EPrlintGenerationProvider.ANTHROPIC;
const DEFAULT_REQUIRED_SECTIONS: Array<string> = ["Summary", "Scope", "Changes", "Acceptance Criteria", "Test Plan", "Risks", "Linear"];
const DEFAULT_TICKET_PATTERN: string = "[a-z]{2,}-[0-9]+";
const DEFAULT_TICKET_PATTERN_FLAGS: string = "i";
const DEFAULT_TITLE_PATTERN: string = String.raw`^(?<type>[a-z]+)\((?<scope>[a-z0-9-]+)\): (?<subject>.+) \| (?<ticket>[A-Za-z]{2,}-\d+)$`;
const DEFAULT_VALIDATION_RETRIES: number = 3;

export const PRLINT_CONFIG_DEFAULTS: {
	generation: Required<IConfigPrlintGeneration>;
	github: Required<IConfigPrlintGithub>;
	lint: Required<IConfigPrlintLint>;
	ticket: Required<IConfigPrlintTicket>;
} = {
	generation: {
		model: DEFAULT_MODEL,
		provider: DEFAULT_PROVIDER,
		retries: DEFAULT_MAX_RETRIES,
		validationRetries: DEFAULT_VALIDATION_RETRIES,
	},
	github: {
		base: DEFAULT_BASE_BRANCH,
		isDraft: IS_DRAFT_DEFAULT,
		prohibitedBranches: DEFAULT_PROHIBITED_BRANCHES,
	},
	lint: {
		forbiddenPlaceholders: DEFAULT_FORBIDDEN_PLACEHOLDERS,
		requiredSections: DEFAULT_REQUIRED_SECTIONS,
		titlePattern: DEFAULT_TITLE_PATTERN,
	},
	ticket: {
		missingBranchLintBehavior: EPrlintTicketMissingBranchLintBehavior.ERROR,
		normalization: EPrlintTicketNormalization.UPPER,
		pattern: DEFAULT_TICKET_PATTERN,
		patternFlags: DEFAULT_TICKET_PATTERN_FLAGS,
		source: EPrlintTicketSource.BRANCH_LINT,
	},
};

export const PRLINT_CONFIG: {
	template: (config?: IConfigPrlint | null) => string;
} = {
	template: (config?: IConfigPrlint | null): string => {
		const generationConfig: IConfigPrlintGeneration | undefined = config?.generation;
		const githubConfig: IConfigPrlintGithub | undefined = config?.github;
		const lintConfig: IConfigPrlintLint | undefined = config?.lint;
		const ticketConfig: IConfigPrlintTicket | undefined = config?.ticket;

		const generationProvider: EPrlintGenerationProvider = generationConfig?.provider ?? PRLINT_CONFIG_DEFAULTS.generation.provider;
		const generationModel: string = generationConfig?.model ?? PRLINT_CONFIG_DEFAULTS.generation.model;
		const generationRetries: number = typeof generationConfig?.retries === "number" ? generationConfig.retries : PRLINT_CONFIG_DEFAULTS.generation.retries;

		const generationValidationRetries: number = typeof generationConfig?.validationRetries === "number" ? generationConfig.validationRetries : PRLINT_CONFIG_DEFAULTS.generation.validationRetries;

		const githubBaseBranch: string = githubConfig?.base ?? PRLINT_CONFIG_DEFAULTS.github.base;
		const isGithubDraft: boolean = typeof githubConfig?.isDraft === "boolean" ? githubConfig.isDraft : PRLINT_CONFIG_DEFAULTS.github.isDraft;
		const githubProhibitedBranches: Array<string> = Array.isArray(githubConfig?.prohibitedBranches) ? githubConfig.prohibitedBranches : PRLINT_CONFIG_DEFAULTS.github.prohibitedBranches;

		const lintTitlePattern: string = lintConfig?.titlePattern ?? PRLINT_CONFIG_DEFAULTS.lint.titlePattern;
		const lintRequiredSections: Array<string> = Array.isArray(lintConfig?.requiredSections) ? lintConfig.requiredSections : PRLINT_CONFIG_DEFAULTS.lint.requiredSections;
		const lintForbiddenPlaceholders: Array<string> = Array.isArray(lintConfig?.forbiddenPlaceholders) ? lintConfig.forbiddenPlaceholders : PRLINT_CONFIG_DEFAULTS.lint.forbiddenPlaceholders;

		const ticketSource: EPrlintTicketSource = ticketConfig?.source ?? PRLINT_CONFIG_DEFAULTS.ticket.source;
		const ticketPattern: string = ticketConfig?.pattern ?? PRLINT_CONFIG_DEFAULTS.ticket.pattern;
		const ticketPatternFlags: string = ticketConfig?.patternFlags ?? PRLINT_CONFIG_DEFAULTS.ticket.patternFlags;
		const ticketNormalization: EPrlintTicketNormalization = ticketConfig?.normalization ?? PRLINT_CONFIG_DEFAULTS.ticket.normalization;

		const ticketMissingBranchLintBehavior: EPrlintTicketMissingBranchLintBehavior = ticketConfig?.missingBranchLintBehavior ?? PRLINT_CONFIG_DEFAULTS.ticket.missingBranchLintBehavior;

		return `export default {
	generation: {
		model: ${JSON.stringify(generationModel)},
		provider: ${JSON.stringify(generationProvider)},
		retries: ${generationRetries},
		validationRetries: ${generationValidationRetries},
	},
	github: {
		base: ${JSON.stringify(githubBaseBranch)},
		draft: ${isGithubDraft},
		prohibitedBranches: ${JSON.stringify(githubProhibitedBranches)},
	},
	lint: {
		forbiddenPlaceholders: ${JSON.stringify(lintForbiddenPlaceholders)},
		requiredSections: ${JSON.stringify(lintRequiredSections)},
		titlePattern: ${JSON.stringify(lintTitlePattern)},
	},
	ticket: {
		missingBranchLintBehavior: ${JSON.stringify(ticketMissingBranchLintBehavior)},
		normalization: ${JSON.stringify(ticketNormalization)},
		pattern: ${JSON.stringify(ticketPattern)},
		patternFlags: ${JSON.stringify(ticketPatternFlags)},
		source: ${JSON.stringify(ticketSource)},
	},
};`;
	},
};
