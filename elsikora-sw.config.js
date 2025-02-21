export default {
  ci: {
    isEnabled: true,
    isNpmPackage: false,
    moduleProperties: {
      dependabot: {
        devBranchName: 'dev'
      }
    },
    modules: [
      'codecommit-sync',
      'qodana',
      'dependabot',
      'snyk',
      'release'
    ],
    provider: 'GitHub'
  },
  commitlint: {
    isEnabled: true
  },
  eslint: {
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
    ],
    isEnabled: true
  },
  gitignore: {
    isEnabled: false
  },
  ide: {
    ides: [
      'vs-code',
      'intellij-idea'
    ],
    isEnabled: false
  },
  license: {
    author: 'Your Name',
    isEnabled: false,
    license: 'UNLICENSED',
    year: 2025
  },
  prettier: {
    isEnabled: false
  },
  "semantic-release": {
    isEnabled: false,
    isPrereleaseEnabled: true,
    mainBranch: 'main',
    preReleaseBranch: 'dev',
    preReleaseChannel: 'beta',
    repositoryUrl: 'https://github.com/test'
  },
  stylelint: {
    isEnabled: false
  }
};