export const SEMANTIC_RELEASE_CONFIG: {
	template: (repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string) => string;
} = {
	template: (repositoryUrl: string, mainBranch: string, preReleaseBranch?: string, preReleaseChannel?: string) => {
		let branchesConfig: string = `  branches: [
    '${mainBranch}'`;

		if (preReleaseBranch && preReleaseChannel) {
			branchesConfig += `,
    {
      name: '${preReleaseBranch}',
      prerelease: true,
      channel: '${preReleaseChannel}',
    }`;
		}

		branchesConfig += `
  ],`;

		return `module.exports = {
${branchesConfig}
  repositoryUrl: '${repositoryUrl}',
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits',
      releaseRules: [
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        { type: 'docs', release: 'patch' },
        { type: 'style', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'test', release: 'patch' },
        { type: 'build', release: 'patch' },
        { type: 'ci', release: 'patch' },
        { type: 'chore', release: 'patch' },
        { type: 'revert', release: 'patch' },
        { type: 'wip', release: 'patch' }
      ],
      parserOpts: {
        noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
      }
    }],
     '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'docs/CHANGELOG.md',
      },
    ],
    '@semantic-release/github',
    [
      '@semantic-release/npm',
      {
        access: 'public',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['docs', 'package.json'],
        message: 'chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}',
      },
    ],
  ],
};`;
	},
};
