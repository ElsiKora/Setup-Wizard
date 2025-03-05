/**
 * Configuration constant for semantic-release.
 * Provides a template function for generating semantic-release configuration files.
 */
export const SEMANTIC_RELEASE_CONFIG: {
	/**
	 * Generates a semantic-release configuration file content.
	 * @param repositoryUrl - The URL of the git repository
	 * @param mainBranch - The main branch name for production releases
	 * @param preReleaseBranch - Optional branch name for pre-releases
	 * @param preReleaseChannel - Optional channel name for pre-releases
	 * @param isBackmergeEnabled - Optional flag to enable backmerge to development branch
	 * @param developBranch - Optional development branch name for backmerge
	 * @returns String content for the semantic-release configuration file
	 */
	template: (repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string, isBackmergeEnabled?: boolean, developBranch?: string) => string;
} = {
	/**
	 * Generates a semantic-release configuration file content.
	 * Creates a configuration with release rules, plugin configurations, and branch settings.
	 * @param repositoryUrl - The URL of the git repository
	 * @param mainBranch - The main branch name for production releases
	 * @param preReleaseBranch - Optional branch name for pre-releases
	 * @param preReleaseChannel - Optional channel name for pre-releases
	 * @param isBackmergeEnabled - Optional flag to enable backmerge to development branch
	 * @param developBranch - Optional development branch name for backmerge
	 * @returns String content for the semantic-release configuration file
	 */
	template: (repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string, isBackmergeEnabled: boolean = false, developBranch?: string) => {
		return `import process from "node:process";

const reference = process.env.GITHUB_REF;
const branch = reference ? reference.split("/").pop() : process.env.BRANCH || "unknown";

const config = {
	branches: [
		"${mainBranch}"${
			preReleaseBranch && preReleaseChannel
				? `,
		{
			channel: "${preReleaseChannel}",
			name: "${preReleaseBranch}",
			prerelease: true,
		}`
				: ""
		}
	],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				parserOpts: {
					noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
				},
				preset: "conventionalcommits",
				releaseRules: [
					{ breaking: true, release: "major" },
					{ release: "minor", type: "feat" },
					{ release: "patch", type: "fix" },
					{ release: "patch", type: "docs" },
					{ release: "patch", type: "style" },
					{ release: "patch", type: "refactor" },
					{ release: "patch", type: "perf" },
					{ release: "patch", type: "test" },
					{ release: "patch", type: "build" },
					{ release: "patch", type: "ci" },
					{ release: "patch", type: "chore" },
					{ release: "patch", type: "revert" },
					{ release: "patch", type: "wip" },
				],
			},
		],
		"@semantic-release/release-notes-generator",
		"@semantic-release/github",
		[
			"@semantic-release/npm",
			{
				access: "public",
			},
		],
	],
	repositoryUrl: "${repositoryUrl}",
};

const isPrereleaseBranch = config.branches.some((b) => typeof b === "object" && branch.includes(b.name) && b.prerelease);

if (isPrereleaseBranch) {
	config.plugins.push([
		"@semantic-release/git",
		{
			assets: ["package.json"],
			message: "chore(release): \${nextRelease.version} [skip ci]",
		},
	]);
} else {
	config.plugins.push(
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["package.json", "CHANGELOG.md"],
				message: "chore(release): \${nextRelease.version} [skip ci]",
			},
		],${
			isBackmergeEnabled && developBranch
				? `
		[
			"@saithodev/semantic-release-backmerge",
			{
				backmergeBranches: ["${developBranch}"],
				backmergeStrategy: "rebase",
				message: "chore(release): synchronization [skip ci]"
			}
		]`
				: ""
		}
	);
}

export default config;`;
	},
};
