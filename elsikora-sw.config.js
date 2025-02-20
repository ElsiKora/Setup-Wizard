export default {
  eslint: {
    isEnabled: true,
    features: [
      'typescript',
      'tailwindCss',
      'prettier',
      'javascript',
      'node',
      'json',
      'yaml',
      'checkFile',
      'packageJson',
      'sonar',
      'unicorn',
      'perfectionist',
      'regexp',
      'stylistic'
    ]
  },
  prettier: {
    isEnabled: false
  },
  stylelint: {
    isEnabled: false
  },
  "semantic-release": {
    isEnabled: false,
    repositoryUrl: 'https://github.com/test',
    mainBranch: 'main',
    needsPreRelease: true,
    preReleaseBranch: 'dev',
    preReleaseChannel: 'beta'
  },
  commitlint: {
    isEnabled: false
  },
  gitignore: {
    isEnabled: false
  },
  license: {
    isEnabled: false,
    year: 2025,
    author: 'Your Name',
    license: 'UNLICENSED'
  },
  ide: {
    isEnabled: false,
    ides: [
      'vs-code',
      'intellij-idea'
    ]
  },
  ci: {
    isEnabled: true,
    provider: 'GitHub',
    modules: [
      'codecommit-sync',
      'qodana',
      'dependabot',
      'release-npm',
      'snyk'
    ],
    moduleProperties: {
      dependabot: {
        devBranchName: 'dev'
      }
    },
    isNpmPackage: false
  }
};