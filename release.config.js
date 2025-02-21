export default {
	branches: [
		"main",
		{
			channel: "beta",
			name: "dev",
			prerelease: true,
		},
	],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/changelog",
			{
				changelogFile: "docs/CHANGELOG.md",
			},
		],
		"@semantic-release/github",
		[
			"@semantic-release/npm",
			{
				access: "public",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["docs", "package.json"],
				message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
	],
	repositoryUrl: "https://github.com/ElsiKora/Setup-Wizard",
};
