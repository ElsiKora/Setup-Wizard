export default {
	"branch-lint": {
		isEnabled: true,
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
