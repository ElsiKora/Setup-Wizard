export default {
	"branch-lint": {
		isEnabled: true,
		isTicketIdEnabled: true,
	},
	ci: {
		isEnabled: true,
		isNpmPackage: true,
		moduleProperties: {},
		modules: ["codecommit-sync"],
		provider: "GitHub",
	},
	commitlint: {
		isEnabled: true,
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
	},
	eslint: {
		features: ["sonar", "unicorn", "perfectionist", "jsdoc", "javascript", "typescript", "jsx", "json", "yaml", "checkFile", "packageJson", "markdown", "react", "nest", "next", "tanstack", "storybook", "node", "regexp", "typeorm", "i18next", "tailwindCss", "prettier", "stylistic", "css", "fsd", "noSecrets"],
		isEnabled: true,
	},
	gitignore: {
		isEnabled: true,
	},
	ide: {
		ides: ["vs-code", "intellij-idea"],
		isEnabled: false,
	},
	license: {
		author: "ElsiKora",
		isEnabled: true,
		license: "MIT",
		year: 2025,
	},
	"lint-staged": {
		features: ["eslint", "prettier"],
		isEnabled: true,
	},
	prettier: {
		isEnabled: false,
	},
	prlint: {
		generation: {
			model: "claude-opus-4-5",
			provider: "anthropic",
			retries: 3,
			validationRetries: 3,
		},
		github: {
			base: "dev",
			isDraft: false,
			prohibitedBranches: ["main", "master"],
		},
		isEnabled: true,
		isScriptsEnabled: true,
		lint: {
			forbiddenPlaceholders: ["WIP", "TODO", "<!--", "TEMPLATE", "lorem ipsum", "[ ]", "<replace-me>"],
			requiredSections: ["Summary", "Scope", "Changes", "Acceptance Criteria", "Test Plan", "Risks", "Linear"],
			titlePattern: String.raw`^(?<type>[a-z]+)\((?<scope>[a-z0-9-]+)\): (?<subject>.+) \| (?<ticket>[A-Za-z]{2,}-\d+)$`,
		},
		ticket: {
			missingBranchLintBehavior: "error",
			normalization: "upper",
			pattern: "[a-z]{2,}-[0-9]+",
			patternFlags: "i",
			source: "branch-lint",
		},
	},
	"semantic-release": {
		developBranch: "dev",
		isBackmergeEnabled: true,
		isEnabled: true,
		isPrereleaseEnabled: true,
		mainBranch: "main",
		preReleaseBranch: "dev",
		preReleaseChannel: "beta",
		repositoryUrl: "https://github.com/ElsiKora/Setup-Wizard",
	},
	stylelint: {
		isEnabled: false,
	},
};
