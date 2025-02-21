<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/setup-wizard-9mtz7e6Tut2vINvoKAsXssy7ntXYna.png" width="500" alt="project-logo">
</p>

<h1 align="center">Setup Wizard 🪄</h1>
<p align="center"><em>A powerful CLI scaffolding utility for modern JavaScript/TypeScript projects</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/typescript-blue.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript"> <img src="https://img.shields.io/badge/node-green.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="node"> <img src="https://img.shields.io/badge/npm-red.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm"> <img src="https://img.shields.io/badge/eslint-purple.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="eslint"> <img src="https://img.shields.io/badge/prettier-ff69b4.svg?style=for-the-badge&logo=prettier&logoColor=white" alt="prettier">
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
Setup Wizard is a comprehensive project scaffolding tool that helps developers quickly set up and configure modern JavaScript and TypeScript projects with best practices and popular tools. It provides an interactive CLI experience to configure ESLint, Prettier, TypeScript, CI/CD workflows, and more. Perfect for teams wanting to maintain consistency across projects and developers looking to bootstrap new applications with industry-standard tooling.

## 🚀 Features
- ✨ **🎯 Interactive CLI with step-by-step configuration**
- ✨ **⚡️ Support for multiple frameworks including React, Vue, Angular, and more**
- ✨ **🔧 Automated setup of ESLint, Prettier, TypeScript, and other essential tools**
- ✨ **🚀 CI/CD workflow configuration for GitHub Actions**
- ✨ **📦 Semantic versioning and automated releases**
- ✨ **🎨 IDE configuration for VS Code and IntelliJ IDEA**
- ✨ **📝 Automated license and gitignore file generation**
- ✨ **🔍 Project analysis and best practices enforcement**

## 🛠 Installation
```bash
# Using npm
npm install -g @elsikora/setup-wizard

# Using yarn
yarn global add @elsikora/setup-wizard

# Using pnpm
pnpm add -g @elsikora/setup-wizard
```

## 💡 Usage
## Basic Usage

Run the setup wizard in your project directory:

```bash
npx @elsikora/setup-wizard init
```

## CLI Options

```bash
# Initialize all configurations
npx @elsikora/setup-wizard init --all

# Initialize specific tools
npx @elsikora/setup-wizard init --eslint --prettier

# Analyze existing project
npx @elsikora/setup-wizard analyze
```

## Configuration with TypeScript

```typescript
// elsikora-sw.config.js
export default {
  eslint: {
    isEnabled: true,
    features: ['typescript', 'react', 'prettier']
  },
  prettier: {
    isEnabled: true
  },
  ci: {
    isEnabled: true,
    provider: 'GitHub',
    modules: ['release', 'dependabot']
  }
}
```

## Custom ESLint Configuration

```javascript
// eslint.config.js
import { createConfig } from '@elsikora/eslint-config';

export default [
  ...(await createConfig({
    withTypescript: true,
    withReact: true,
    withPrettier: true
  }))
];
```

## Setting Up CI/CD

```yaml
# Generated .github/workflows/release.yml
name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run release
```

## 🛣 Roadmap
| Task / Feature | Status |
|---------------|--------|
| - Add support for more frameworks and tools | 🚧 In Progress |
| - Implement project templates | 🚧 In Progress |
| - Add custom rule configurations | 🚧 In Progress |
| - Introduce plugin system | 🚧 In Progress |
| - Add support for other CI/CD providers | 🚧 In Progress |
| - Create web interface for configuration | 🚧 In Progress |
| (done) 🎯 Interactive CLI with step-by-step configuration | 🚧 In Progress |
| (done) ⚡️ Support for multiple frameworks including React, Vue, Angular, and more | 🚧 In Progress |
| (done) 🔧 Automated setup of ESLint, Prettier, TypeScript, and other essential tools | 🚧 In Progress |

## ❓ FAQ
## Frequently Asked Questions

### Q: Can I use Setup Wizard with existing projects?
A: Yes, Setup Wizard can analyze and configure existing projects while preserving your current setup.

### Q: Does it support monorepos?
A: Yes, Setup Wizard can be used in monorepo setups and will configure tools appropriately.

### Q: Can I customize the configurations?
A: Yes, all configurations can be customized through the `elsikora-sw.config.js` file.

### Q: Which CI/CD platforms are supported?
A: Currently, GitHub Actions is supported with plans to add more providers.

## 🔒 License
This project is licensed under **This project is released into the public domain under The Unlicense. You can copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.**.
