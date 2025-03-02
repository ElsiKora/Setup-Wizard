<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/setup-wizard-9mtz7e6Tut2vINvoKAsXssy7ntXYna.png" width="500" alt="project-logo">
</p>

<h1 align="center">Setup-Wizard ⚡</h1>
<p align="center"><em>A powerful CLI scaffolding utility for modern JavaScript/TypeScript projects</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/version-blue.svg?style=for-the-badge&logo=npm&logoColor=white" alt="version"> <img src="https://img.shields.io/badge/typescript-blue.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript"> <img src="https://img.shields.io/badge/eslint-purple.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="eslint"> <img src="https://img.shields.io/badge/prettier-ff69b4.svg?style=for-the-badge&logo=prettier&logoColor=white" alt="prettier"> <img src="https://img.shields.io/badge/license-green.svg?style=for-the-badge&logo=license&logoColor=white" alt="license">
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

Setup-Wizard is a comprehensive project initialization tool that helps developers quickly set up and configure modern JavaScript and TypeScript projects with best practices and popular tools. It provides automated setup for ESLint, Prettier, TypeScript, Git hooks, CI/CD workflows, and more. Perfect for teams wanting to maintain consistency across projects and developers looking to quickly bootstrap new applications with industry-standard tooling.

## 🚀 Features

- ✨ **🚀 One-command project setup with popular tools and best practices**
- ✨ **⚙️ Automated configuration for ESLint, Prettier, TypeScript, and more**
- ✨ **🔄 Git hooks setup with Husky and lint-staged**
- ✨ **📦 Framework detection and appropriate configuration generation**
- ✨ **🛠️ CI/CD workflow setup for GitHub Actions**
- ✨ **📄 License and documentation generation**
- ✨ **🎨 IDE configuration for VS Code and IntelliJ IDEA**
- ✨ **🔍 Project analysis and validation tools**

## 🛠 Installation

```bash
# Using npm
npm install -g @elsikora/setup-wizard

# Using yarn
yarn global add @elsikora/setup-wizard

# Using pnpm
pnpm add -g @elsikora/setup-wizard

# Or run directly with npx
npx @elsikora/setup-wizard init
```

## 💡 Usage

## Basic Usage

```bash
# Initialize a new project with interactive prompts
setup-wizard init

# Initialize with specific features
setup-wizard init --withEslint --withPrettier --withTypescript
```

## Framework-specific Setup

```bash
# React project setup
setup-wizard init --withReact

# NestJS project setup
setup-wizard init --withNest
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

## CLI Options

```bash
# Show all available options
setup-wizard --help

# Enable all features
setup-wizard init --all

# Analyze existing project
setup-wizard analyze
```

## Git Hooks Setup

```bash
# Initialize with lint-staged and commitlint
setup-wizard init --withLintStaged --withCommitlint

# This will create:
# - lint-staged.config.js
# - commitlint.config.js
# - .husky/pre-commit
# - .husky/commit-msg
```

## 🛣 Roadmap

| Task / Feature                                                               | Status         |
| ---------------------------------------------------------------------------- | -------------- |
| - Add support for more frameworks and tools                                  | 🚧 In Progress |
| - Implement project templates                                                | 🚧 In Progress |
| - Add custom plugin system                                                   | 🚧 In Progress |
| - Create web interface for configuration                                     | 🚧 In Progress |
| - Add support for other CI providers                                         | 🚧 In Progress |
| - Implement project migration tools                                          | 🚧 In Progress |
| - Add containerization setup options                                         | 🚧 In Progress |
| (done) 🚀 One-command project setup with popular tools and best practices    | 🚧 In Progress |
| (done) ⚙️ Automated configuration for ESLint, Prettier, TypeScript, and more | 🚧 In Progress |
| (done) 🔄 Git hooks setup with Husky and lint-staged                         | 🚧 In Progress |

## ❓ FAQ

## Frequently Asked Questions

**Q: Can I use Setup-Wizard in an existing project?** A: Yes, Setup-Wizard can analyze and configure existing projects while preserving your current setup.

**Q: Does it support custom ESLint rules?** A: Yes, you can extend the default configuration through elsikora-sw.config.js.

**Q: Can I use it with monorepos?** A: Yes, Setup-Wizard supports monorepo setups and can configure workspaces appropriately.

**Q: How does it handle conflicts with existing configurations?** A: Setup-Wizard will detect existing configurations and ask for confirmation before making any changes.

## 🔒 License

This project is licensed under \*\*MIT License

Copyright (c) 2025 ElsiKora

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\*\*.
