<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/setup-wizard-9mtz7e6Tut2vINvoKAsXssy7ntXYna.png" width="500" alt="project-logo">
</p>

<h1 align="center">Setup-Wizard ⚡</h1>
<p align="center"><em>Streamlined CLI scaffolding utility for modern JavaScript/TypeScript projects</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/version-blue.svg?style=for-the-badge&logo=npm&logoColor=white" alt="version"> <img src="https://img.shields.io/badge/license-MIT-yellow.svg?style=for-the-badge&logo=license&logoColor=white" alt="license-MIT"> <img src="https://img.shields.io/badge/typescript-blue.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript"> <img src="https://img.shields.io/badge/node-green.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="node"> <img src="https://img.shields.io/badge/eslint-purple.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="eslint"> <img src="https://img.shields.io/badge/prettier-ff69b4.svg?style=for-the-badge&logo=prettier&logoColor=white" alt="prettier">
</p>


## 📚 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)


## 📖 Description
Setup-Wizard is a powerful command-line tool designed to simplify and standardize the project setup process for JavaScript and TypeScript developers. It automates the configuration of essential development tools like ESLint, Prettier, Stylelint, Commitlint, and more. By intelligently detecting your project's framework and dependencies, Setup-Wizard creates optimized configurations tailored to your specific needs. Save hours of setup time, enforce consistent coding standards across teams, and eliminate configuration drift between projects. Whether you're starting a new React application, Node.js service, or any modern JavaScript project, Setup-Wizard provides a seamless scaffolding experience with just a few commands.

## 🚀 Features
- ✨ **📊 Intelligent Framework Detection - Automatically identifies and configures for React, Next.js, Node.js, and 50+ other frameworks**
- ✨ **🧰 Comprehensive Tooling - Sets up ESLint, Prettier, Stylelint, Commitlint, Semantic Release, Husky hooks, and more**
- ✨ **🎯 Optimized Configurations - Creates customized linting rules based on your project's specific needs**
- ✨ **🔄 CI/CD Integration - Configures GitHub Actions workflows for continuous integration**
- ✨ **📋 License Management - Generates appropriate LICENSE files with your copyright information**
- ✨ **👁️ IDE Support - Creates IDE-specific configurations for VS Code and IntelliJ IDEA**
- ✨ **🔧 Interactive CLI - Guided setup process with intelligent defaults and customization options**
- ✨ **🚀 Future-Proof - Supports ESLint flat config and modern JavaScript/TypeScript tooling**

## 🛠 Installation
```bash
### Global Installation


npm install -g @elsikora/setup-wizard


### Project-Specific Installation


npm install --save-dev @elsikora/setup-wizard


### Running with npx (no installation required)


npx @elsikora/setup-wizard init
```

## 💡 Usage
## Basic Usage

Run the initialization wizard to set up your project with interactive prompts:

```bash
npx @elsikora/setup-wizard init
```

This will guide you through the setup process, detecting your project's frameworks and offering appropriate configuration options.

## CLI Options

### Initialize All Modules

To enable all available modules at once:

```bash
npx @elsikora/setup-wizard init --all
```

### Selective Module Installation

You can choose which modules to enable with specific flags:

```bash
npx @elsikora/setup-wizard init --withEslint --withPrettier --withLintStaged
```

Available flags:

```
-c, --withCommitlint     Add commitlint configuration
-d, --withIde            Add IDE configuration
-e, --withEslint         Add ESLint configuration
-g, --withGitignore      Add .gitignore file
-i, --withCI             Add GitHub CI configuration
-l, --withLicense        Add LICENSE file
-p, --withPrettier       Add Prettier configuration
-r, --withSemanticRelease Add semantic-release configuration
-s, --withStylelint      Add Stylelint configuration
-t, --withLintStaged     Add lint-staged configuration
```

## Advanced Configuration

```javascript
// ./elsikora/setup-wizard.config.js
export default {
	eslint: {
		isEnabled: true,
		features: ["typescript", "react", "prettier"],
	},
	ci: {
		isEnabled: true,
		provider: "GitHub",
		modules: ["release-npm", "dependabot"],
	},
	ide: {
		isEnabled: true,
		ides: ["vs-code", "intellij-idea"],
	},
};
```

## ESLint Setup Examples

### React Project Setup

When detecting a React project, Setup-Wizard will automatically configure ESLint with React-specific rules:

```bash
cd my-react-app
npx @elsikora/setup-wizard init --withEslint
```

Setup-Wizard will detect React and offer to include:  
- React specific ESLint rules
- JSX accessibility rules
- TypeScript support (if detected)
- Tailwind CSS support (if detected)

### NestJS Backend Setup

For a NestJS project, the tool provides specialized configurations:

```bash
cd my-nest-api
npx @elsikora/setup-wizard init --withEslint --withPrettier
```

NestJS-specific features include:
- TypeORM linting rules (if TypeORM is detected)
- NestJS module organization rules
- API endpoint validation rules

## Git Hooks Integration

Set up Git hooks with lint-staged and commitlint for enforcing code quality on commit:

```bash
npx @elsikora/setup-wizard init --withLintStaged --withCommitlint
```

This will:
1. Install and configure Husky
2. Set up pre-commit hooks to run linters
3. Configure commit message validation
4. Add a `commit` script to use the interactive commitizen interface

## CI/CD Configuration

To set up GitHub Actions workflows:

```bash
npx @elsikora/setup-wizard init --withCI
```

You'll be prompted to select specific CI modules:
- Release automation
- Dependabot configuration
- Quality scanning with Qodana
- Security scanning with Snyk

## Configuration Analysis

To analyze your current setup and recommend missing configurations:

```bash
npx @elsikora/setup-wizard analyze
```

This will scan your project and suggest improvements to your development setup.

## Advanced Configuration Example

For a complete TypeScript project setup with all recommended tools:

```bash
npx @elsikora/setup-wizard init \
  --withEslint \
  --withPrettier \
  --withStylelint \
  --withCommitlint \
  --withLintStaged \
  --withGitignore \
  --withLicense \
  --withCI \
  --withSemanticRelease \
  --withIde
```

The wizard will guide you through configuring each module with sensible defaults based on your project.

## 🛣 Roadmap
| Task / Feature | Status |
|---------------|--------|
| ## Future Development Plans | 🚧 In Progress |
| - **Auto-Migration Tool** - Assist users in migrating from legacy ESLint configs to flat config | 🚧 In Progress |
| - **Monorepo Support** - Enhanced configuration for complex monorepo project structures | 🚧 In Progress |
| - **Custom Templates** - Save and reuse configuration templates across projects | 🚧 In Progress |
| - **Plugin System** - Support for third-party plugins and custom module extensions | 🚧 In Progress |
| - **UI Dashboard** - Web interface for managing and monitoring configurations | 🚧 In Progress |
| - **Additional CI Providers** - Support for GitLab CI, CircleCI, Azure DevOps, and more | 🚧 In Progress |
| - **Dependency Analysis** - Identify and suggest updates for outdated or vulnerable dependencies | 🚧 In Progress |
| - **Cross-Tool Integration** - Better integration between linting tools and test frameworks | 🚧 In Progress |
| **Completed tasks from CHANGELOG:** |  |
| **husky:** remove husky.sh import from pre-commit script ([d5d3a62](https://github.com/ElsiKora/Setup-Wizard/commit/d5d3a62f2654228158b6ca2981bd40921e705528)) | ✅ Done |
| **ci:** correct indentation in release workflow ([9a28927](https://github.com/ElsiKora/Setup-Wizard/commit/9a28927c850cc09a15dc38185e3e1f7407f362ed)) | ✅ Done |
| **commitlint:** add branch name linting to pre-push hook ([2538c28](https://github.com/ElsiKora/Setup-Wizard/commit/2538c281964d77478f0f42aafd15997a89e30f31)) | ✅ Done |
| **eslint-config.constant.ts:** refactor ESLint config export logic ([0356871](https://github.com/ElsiKora/Setup-Wizard/commit/03568714c14be6d5f4dc57b5be983fd0876ac562)) | ✅ Done |
| **ci:** refactor CI setup and add major release rule ([0535403](https://github.com/ElsiKora/Setup-Wizard/commit/05354030ee718a18dc70947dd4143f5e82ce95e6)) | ✅ Done |
| **global:** refactor module configuration and caching logic ([4bf017c](https://github.com/ElsiKora/Setup-Wizard/commit/4bf017c7d9e31a2f3a10311ffa70e8a4d41c5133)) | ✅ Done |
| **ci:** need to update major version | ✅ Done |
| **config:** refactor config handling and update setup paths ([2686a98](https://github.com/ElsiKora/Setup-Wizard/commit/2686a98edb85e9bf8ae7e72f06901feb5474478e)) | ✅ Done |
| **config:** config for app now stored .elsikora/setup-wizard.js | ✅ Done |
| **eslint-config:** Refactor ESLint configuration dependencies ([d1c34d1](https://github.com/ElsiKora/Setup-Wizard/commit/d1c34d19535b3f0b8f2a1a6f9d3877ace7129a33)) | ✅ Done |
| **release.config.js:** Update repository URL in release config ([4f281a6](https://github.com/ElsiKora/Setup-Wizard/commit/4f281a679bfd854961f1c120e742e117dfac7acf)) | ✅ Done |

## ❓ FAQ
## Frequently Asked Questions

### How does Setup-Wizard detect my project's framework?

Setup-Wizard examines your project's dependencies in package.json and key configuration files to determine which frameworks you're using. It checks for framework-specific packages and file patterns for more than 50 popular frameworks and libraries.

### Will Setup-Wizard overwrite my existing configurations?

Yes, but with your permission. When existing configuration files are detected, Setup-Wizard will ask for confirmation before replacing them. You can always choose to keep your existing configurations.

### Does it work with monorepos?

Currently, Setup-Wizard works best with single-package projects. Enhanced support for monorepos is on our roadmap.

### Can I use Setup-Wizard with JavaScript projects or only TypeScript?

Setup-Wizard fully supports both JavaScript and TypeScript projects. It detects which language you're using and configures tools appropriately.

### What happens if I don't have Node.js installed?

Setup-Wizard requires Node.js to run. Make sure you have Node.js version 14 or higher installed.

### How can I customize the generated configurations?

After Setup-Wizard generates the configuration files, you can edit them manually to further customize to your needs. Configuration files include helpful comments to guide you.

### Does Setup-Wizard work with all package managers?

Yes, Setup-Wizard is compatible with npm, Yarn, and pnpm.

## 🔒 License
This project is licensed under **MIT License

Copyright (c) 2025 ElsiKora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.**.

## 📋 Changelog
See [CHANGELOG.md](CHANGELOG.md) for details.
