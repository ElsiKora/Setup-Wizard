module.exports = {
  branches: [
    'main',
    {
      name: 'dev',
      prerelease: true,
      channel: 'beta',
    }
  ],
  repositoryUrl: 'https://github.com/test',
  plugins: [
    '@semantic-release/commit-analyzer',
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
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};