<p align="center">
  <img src="https://i.imgur.com/IqD60jG.png" width="700" alt="project-logo">
</p>

<h1 align="center">Setup-Wizard ✨</h1>
<p align="center"><em>Your personal CLI familiar for conjuring standardized, production-ready JavaScript & TypeScript projects in minutes!</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"> <img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm"> <img src="https://img.shields.io/badge/Rollup-EC4A3F.svg?style=for-the-badge&logo=rollup&logoColor=white" alt="Rollup"> <img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"> <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier"> <img src="https://img.shields.io/badge/Vitest-6E9F18.svg?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest"> <img src="https://img.shields.io/badge/Git-F05032.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git"> <img src="https://img.shields.io/badge/GitHub-181717.svg?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"> <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions"> <img src="https://img.shields.io/badge/Markdown-000000.svg?style=for-the-badge&logo=markdown&logoColor=white" alt="Markdown"> <img src="https://img.shields.io/badge/JSON-000000.svg?style=for-the-badge&logo=json&logoColor=white" alt="JSON"> <img src="https://img.shields.io/badge/YAML-CB171E.svg?style=for-the-badge&logo=yaml&logoColor=white" alt="YAML">
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
Tired of boilerplate fatigue and configuration chaos? Setup-Wizard is your powerful command-line familiar, expertly designed to simplify and standardize the often tedious project setup process for modern JavaScript and TypeScript developers. It automates the meticulous configuration of essential development tools like ESLint, Prettier, Stylelint, Commitlint, Husky, Semantic Release, and even CI/CD workflows for GitHub Actions. By intelligently detecting your project's framework (React, Next.js, Node.js, NestJS, and over 50 others!) and dependencies, Setup-Wizard crafts optimized configurations tailored precisely to your project's unique needs. 

**Real-World Use Cases:**
*   **Rapid Project Kickstart**: Initialize new frontend applications, backend services, libraries, or full-stack projects with best-practice configurations in a matter of minutes, not hours.
*   **Team Standardization & Consistency**: Enforce uniform coding standards, commit message conventions, and automated quality checks across all projects and team members, improving collaboration and code maintainability.
*   **Eliminate Configuration Drift**: Keep development environments aligned by easily regenerating or updating configurations as your project evolves or new tooling best practices emerge.
*   **Effortless Developer Onboarding**: Streamline the setup process for new team members, allowing them to clone a repository and get productive almost instantly, without wrestling with complex tool configurations.
*   **Legacy Project Modernization**: Gradually introduce modern development practices and tooling into existing projects by selectively enabling and configuring modules.

Setup-Wizard is targeted at individual developers seeking to boost productivity and teams aiming to establish robust, consistent, and high-quality development workflows. Wave goodbye to manual setup and hello to enchanted productivity!

## 🚀 Features
- ✨ **✨ **Intelligent Framework Autodetection**: Magically identifies your project's stack (React, Next.js, NestJS, Node.js, Vue, Angular, Svelte, and 50+ more!) to tailor configurations perfectly.**
- ✨ **🔧 **Comprehensive Tooling Suite**: One-command setup for ESLint, Prettier, Stylelint, Commitlint, Semantic Release, Husky Git hooks, Branch Linting, GitHub Actions, and more.**
- ✨ **⚙️ **Optimized & Granular Configurations**: Generates fine-tuned linting rules and tool settings based on your project's specific needs and chosen features (e.g., TypeScript strict mode, SonarJS, Unicorn rules, framework-specific plugins).**
- ✨ **🚀 **Automated CI/CD Workflows**: Conjures ready-to-use GitHub Actions for release automation (including NPM publishing), dependency updates (Dependabot), code quality (Qodana), and security scanning (Snyk).**
- ✨ **📜 **License & Gitignore Generation**: Automatically creates appropriate MIT LICENSE files with your copyright information and a comprehensive .gitignore tailored to modern web development.**
- ✨ **💻 **Seamless IDE Integration**: Generates IDE-specific settings for VS Code and IntelliJ IDEA, ensuring consistent formatting and linting directly in your editor.**
- ✨ **🧙 **Interactive CLI Experience**: A guided, user-friendly setup process with smart defaults and extensive customization options, powered by `prompts`.**
- ✨ **🔮 **Future-Proof & Modern**: Embraces modern JavaScript/TypeScript tooling, including support for ESLint's flat config system via `@elsikora/eslint-config`.**
- ✨ **🌿 **Branch Linting Mastery**: Enforce consistent and meaningful branch naming conventions with highly configurable branch linting rules.**
- ✨ **✍️ **AI-Powered Commit Messages (Optional)**: Integrates with `@elsikora/commitizen-plugin-commitlint-ai` for AI-assisted commit message generation (via `.elsikora/commitlint-ai.config.js`).**

## 🛠 Installation
```bash
You can install Setup-Wizard globally, as a project development dependency, or run it directly with `npx`.

### Global Installation


npm install -g @elsikora/setup-wizard
# or
yarn global add @elsikora/setup-wizard
# or
pnpm add -g @elsikora/setup-wizard


### Project-Specific Installation


npm install --save-dev @elsikora/setup-wizard
# or
yarn add --dev @elsikora/setup-wizard
# or
pnpm add --save-dev @elsikora/setup-wizard


### Running with npx (No Installation Required)

This is the recommended way to ensure you're always using the latest version:


npx @elsikora/setup-wizard init
```

## 💡 Usage
## 🧙‍♂️ Invoking the Wizard: Basic Usage

To start the magic, simply run the `init` command in your project's root directory:

```bash
npx @elsikora/setup-wizard init
```

This will launch an interactive wizard that guides you through selecting and configuring various development tools. Setup-Wizard will attempt to auto-detect your project's framework(s) and suggest relevant configurations.

## ✨ Casting Spells: CLI Options

You can tailor the incantation with specific flags to enable desired modules directly.

### 🪄 The Grand Incantation: Initialize All Modules

To enable and configure all available modules at once, use the `--all` flag:

```bash
npx @elsikora/setup-wizard init --all
```

### 📜 Selective Spellcasting: Individual Module Flags

Choose specific modules to set up using their dedicated flags. You can combine multiple flags:

```bash
# Example: Setup ESLint, Prettier, and Lint-Staged
npx @elsikora/setup-wizard init --withEslint --withPrettier --withLintStaged
```

**Available Module Flags:**

*   `-b, --withBranchLint`: Add branch-lint configuration and Husky pre-push hook for branch name validation.
*   `-u, --withBuilder`: Add build tool configuration (e.g., Rollup, esbuild). Currently focuses on Rollup.
*   `-i, --withCI`: Add GitHub Actions CI/CD workflows (release, testing, security scans, etc.).
*   `-c, --withCommitlint`: Add Commitlint configuration with Husky commit-msg hook and Commitizen support.
*   `-e, --withEslint`: Add ESLint configuration, intelligently detecting frameworks and TypeScript.
*   `-g, --withGitignore`: Add a comprehensive .gitignore file.
*   `-d, --withIde`: Add IDE-specific configurations for VS Code and/or IntelliJ IDEA.
*   `-l, --withLicense`: Add a LICENSE file (defaults to MIT).
*   `-t, --withLintStaged`: Add lint-staged configuration with Husky pre-commit hook.
*   `-p, --withPrettier`: Add Prettier configuration for code formatting.
*   `-r, --withSemanticRelease`: Add Semantic Release configuration for automated versioning and publishing.
*   `-s, --withStylelint`: Add Stylelint configuration for CSS/SCSS linting.
*   `-T, --withTesting`: Add testing configuration (currently focuses on Vitest).
*   `-y, --withTypescript`: Add TypeScript configuration (tsconfig.json).

## 📖 The Spellbook: Advanced Configuration

For fine-grained control, Setup-Wizard uses a configuration file located at `.elsikora/setup-wizard.config.js`. If this file exists, the wizard will use its values as defaults. You can create this file manually or let the wizard generate it on the first run.

**Example `.elsikora/setup-wizard.config.js`:**

```javascript
export default {
  "branch-lint": {
    isEnabled: true, // Enables Git branch linting
  },
  ci: {
    isEnabled: true,
    isNpmPackage: true, // Set to true if your project is an NPM package
    moduleProperties: {
      "release-npm": { // Properties specific to the release-npm CI module
        mainBranch: "main",
        isPrerelease: true,
        preReleaseBranch: "dev"
      }
    },
    modules: ["release-npm", "dependabot", "test"], // CI modules to enable
    provider: "GitHub", // Currently supports GitHub Actions
  },
  commitlint: {
    isEnabled: true, // Enables commit message linting
  },
  eslint: {
    features: [ // Specific ESLint features/plugins to enable
      "sonar", "unicorn", "perfectionist", "jsdoc", "javascript", 
      "typescript", "jsx", "json", "yaml", "checkFile", "packageJson", 
      "markdown", "react", "nest", "next", "tanstack", "storybook", 
      "node", "regexp", "typeorm", "i18next", "tailwindCss", 
      "prettier", "stylistic", "css", "fsd", "noSecrets"
    ],
    isEnabled: true,
  },
  gitignore: {
    isEnabled: true, // Generates a .gitignore file
  },
  ide: {
    ides: ["vs-code", "intellij-idea"], // IDEs to generate configs for
    isEnabled: true, // Note: Default in provided config is false
  },
  license: {
    author: "Your Name or Company",
    isEnabled: true,
    license: "MIT", // Choose from ELicense enum values
    year: new Date().getFullYear(),
  },
  "lint-staged": {
    features: ["eslint", "prettier"], // Tools to run via lint-staged
    isEnabled: true,
  },
  prettier: {
    isEnabled: true, // Note: Default in provided config is false
  },
  "semantic-release": {
    developBranch: "dev",
    isBackmergeEnabled: true,
    isEnabled: true,
    isPrereleaseEnabled: true,
    mainBranch: "main",
    preReleaseBranch: "dev",
    preReleaseChannel: "beta",
    repositoryUrl: "https://github.com/YourUser/YourRepo",
  },
  stylelint: {
    isEnabled: true, // Note: Default in provided config is false
  },
  typescript: {
    // Default TypeScript settings, will be prompted if not specified
    // baseUrl: "./src",
    // rootDirectory: "./src",
    // outputDirectory: "./dist",
    // isCleanArchitectureEnabled: false,
    // isDecoratorsEnabled: false,
    isEnabled: true
  },
  testing: {
    // Default testing settings, will be prompted if not specified
    // framework: "vitest",
    // isUnitEnabled: true,
    // isE2eEnabled: false,
    // isCoverageEnabled: true,
    isEnabled: true
  }
};
```

## 🔮 Crystal Ball: Analyzing Your Setup

Curious about what your project might be missing or how Setup-Wizard sees it? Use the `analyze` command:

```bash
npx @elsikora/setup-wizard analyze
```

This command (currently a placeholder for future enhancements) will eventually scan your project, identify existing configurations, and suggest modules or improvements that Setup-Wizard can provide. It helps you understand the current state and potential enhancements for your development environment.

## 🪄 Example Incantations: Use Cases

### Setting up a new React + TypeScript project:
```bash
mkdir my-react-app && cd my-react-app
npm init -y
npm install react react-dom typescript @types/react @types/react-dom
touch tsconfig.json # Basic tsconfig for detection
npx @elsikora/setup-wizard init --withEslint --withPrettier --withLintStaged --withTypescript --withGitignore --withLicense
```
Setup-Wizard will detect React and TypeScript, offering tailored ESLint rules (including JSX accessibility, React Hooks), Prettier for formatting, lint-staged with Husky for pre-commit checks, a `tsconfig.json`, `.gitignore`, and a `LICENSE` file.

### Standardizing a Node.js/Express API backend:
```bash
cd my-express-api
npx @elsikora/setup-wizard init --withEslint --withPrettier --withCommitlint --withSemanticRelease --withCI --withNode
```
This configures ESLint with Node.js specific rules, Prettier, Commitlint for standardized commit messages, Semantic Release for automated versioning and changelog generation, and basic GitHub Actions workflows for testing and releasing.

### Enabling Git Branch Linting:
To enforce branch naming conventions (e.g., `feature/JIRA-123-new-button`):
```bash
npx @elsikora/setup-wizard init --withBranchLint
```
This sets up `@elsikora/git-branch-lint` with a pre-push hook. Configure rules in `.elsikora/git-branch-lint.config.js`.

By combining flags or using the interactive mode, you can precisely tailor the setup to any JavaScript or TypeScript project, ensuring consistency and best practices from the start.

## 🛣 Roadmap
| Task / Feature                                                                                                                                                           | Status         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| ## Future Development Plans                                                                                                                                              |                |
| - **Auto-Migration Tool** - Assist users in migrating from legacy ESLint configs to flat config                                                                          | 🚧 In Progress |
| - **Monorepo Support** - Enhanced configuration for complex monorepo project structures                                                                                  | 🚧 In Progress |
| - **Custom Templates** - Save and reuse configuration templates across projects                                                                                          | 🚧 In Progress |
| - **Plugin System** - Support for third-party plugins and custom module extensions                                                                                       | 🚧 In Progress |
| - **UI Dashboard** - Web interface for managing and monitoring configurations                                                                                            | 🚧 In Progress |
| - **Additional CI Providers** - Support for GitLab CI, CircleCI, Azure DevOps, and more                                                                                  | 🚧 In Progress |
| - **Dependency Analysis** - Identify and suggest updates for outdated or vulnerable dependencies                                                                         | 🚧 In Progress |
| - **Cross-Tool Integration** - Better integration between linting tools and test frameworks                                                                              | 🚧 In Progress |
| - **Enhanced `analyze` Command** - Provide detailed reports and actionable suggestions for existing projects                                                               | 🚧 In Progress |
| - **More Build Tools** - Add support for esbuild, Webpack, Vite as primary build setup options beyond Rollup                                                               | 🚧 In Progress | |                |
| - **branch-lint:** expand supported configuration file paths ([9bf11d7](https://github.com/ElsiKora/Setup-Wizard/commit/9bf11d797c9ba5f1697d9173c30f17b2e003d8b2))           | ✅ Done        |
| - **service:** add npm error parsing and formatting functionality ([2be5df3](https://github.com/ElsiKora/Setup-Wizard/commit/2be5df31db5458e6750a40121396083d351cbc45))          | ✅ Done        |
| - **branch-lint:** add git branch lint configuration and setup ([d5c1a1c](https://github.com/ElsiKora/Setup-Wizard/commit/d5c1a1cf409d759632bd7dcb5cb144cafe5caad0))     | ✅ Done        |
| - **git:** add branch-lint module for git branch name validation ([fee4958](https://github.com/ElsiKora/Setup-Wizard/commit/fee495813a123626cd28b1386bea35fca4426b16))             | ✅ Done        |
| - **cli:** replace clack with prompts and add new eslint features ([844f9fd](https://github.com/ElsiKora/Setup-Wizard/commit/844f9fdfc1bf95b47085ae2365e8b2c5ff82c009))            | ✅ Done        |
| - **commitlint:** add branch name linting to pre-push hook ([2538c28](https://github.com/ElsiKora/Setup-Wizard/commit/2538c281964d77478f0f42aafd15997a89e30f31))              | ✅ Done        |
| - **global:** refactor module configuration and caching logic ([4bf017c](https://github.com/ElsiKora/Setup-Wizard/commit/4bf017c7d9e31a2f3a10311ffa70e8a4d41c5133))           | ✅ Done        |
| - **config:** refactor config handling and update setup paths ([2686a98](https://github.com/ElsiKora/Setup-Wizard/commit/2686a98edb85e9bf8ae7e72f06901feb5474478e))           | ✅ Done        |

## ❓ Frequently Asked Questions

### How does Setup-Wizard detect my project's framework?

Setup-Wizard employs a multi-faceted detection strategy. It primarily examines your project's `package.json` for known framework-specific dependencies (e.g., `react`, `next`, `@nestjs/core`). Additionally, it scans for common configuration files (e.g., `angular.json`, `astro.config.mjs`, `svelte.config.js`) and characteristic file structures to identify the frameworks and tools you're using. This allows it to suggest and apply the most relevant configurations.

### Will Setup-Wizard overwrite my existing configurations?

Setup-Wizard prioritizes your existing work. When it detects existing configuration files for tools it's about to set up (e.g., an `.eslintrc.js` or `prettier.config.js`), it will **always ask for your explicit permission** before making any changes or replacements. You'll have the option to keep your existing files untouched.

### Does Setup-Wizard work with monorepos?

Currently, Setup-Wizard is optimized for single-package projects. While you can run it in individual packages within a monorepo, dedicated top-level monorepo configuration (e.g., root ESLint config, shared Husky hooks) is a feature planned for future development. See our [Roadmap](#-roadmap).

### Can I use Setup-Wizard with JavaScript projects, or is it TypeScript-only?

Setup-Wizard fully supports both JavaScript and TypeScript projects! It will detect if your project uses TypeScript (e.g., by finding a `tsconfig.json` or TypeScript dependencies) and configure tools like ESLint accordingly with appropriate parsers and plugins. For JavaScript projects, it will set up configurations optimized for modern JavaScript.

### What happens if I don't have Node.js installed?

Setup-Wizard is a Node.js-based CLI tool. Therefore, Node.js (version 16 or higher is recommended) and npm (or Yarn/pnpm) are prerequisites to run Setup-Wizard. If Node.js is not installed, you won't be able to execute `npx @elsikora/setup-wizard` or install it globally/locally.

### How can I customize the configurations generated by Setup-Wizard?

All configurations generated by Setup-Wizard are standard files (e.g., `eslint.config.js`, `prettier.config.js`). After the wizard completes, you are free to open these files and manually edit them to fine-tune any rules or settings to your exact preferences. Setup-Wizard aims to provide a solid, best-practice starting point.

### Is Setup-Wizard compatible with all package managers (npm, Yarn, pnpm)?

Yes, Setup-Wizard is designed to be package manager agnostic. It primarily interacts with `package.json` for dependency detection and script addition, and its core logic for generating configuration files does not depend on a specific package manager. It will install new devDependencies using `npm install` by default, but you can manage dependencies with your preferred package manager afterward.

### How does the AI integration for commit messages work?

The optional AI-powered commit message generation is facilitated through the `@elsikora/commitizen-plugin-commitlint-ai` package. If you enable the `commitlint` module, Setup-Wizard configures Commitizen to use this plugin. You can then configure the AI provider (e.g., Anthropic, Google) and model in the `.elsikora/commitlint-ai.config.js` file. When you run `npm run commit`, the AI will assist in generating Conventional Commits-compliant messages based on your staged changes.

## 🔒 License
This project is licensed under **## 🔒 License

This project is licensed under the **MIT License**.

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
