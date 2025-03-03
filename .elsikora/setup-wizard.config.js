export default {
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
		isEnabled: false,
	},
	gitignore: {
		isEnabled: false,
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
