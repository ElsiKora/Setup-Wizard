export default {
	maxRetries: 3,
	mode: "auto",
	model: "claude-opus-4-5",
	provider: "anthropic",
	ticket: {
		missingBranchLintBehavior: "error",
		normalization: "upper",
		pattern: "[a-z]{2,}-[0-9]+",
		patternFlags: "i",
		source: "branch-lint",
	},
	validationMaxRetries: 3,
};
