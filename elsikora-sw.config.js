export default {
	ci: {
		isEnabled: true,
		isNpmPackage: true,
		moduleProperties: {
			dependabot: {
				devBranchName: "dev",
			},
		},
		modules: ["codecommit-sync", "qodana", "dependabot", "snyk", "release-npm"],
		provider: "GitHub",
	},
	commitlint: {
		isEnabled: false,
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
	prettier: {
		isEnabled: false,
	},
	"semantic-release": {
		isEnabled: false,
		isPrereleaseEnabled: true,
		mainBranch: "main",
		preReleaseBranch: "dev",
		preReleaseChannel: "beta",
		repositoryUrl: "https://github.com/test",
	},
	stylelint: {
		isEnabled: false,
	},
};
