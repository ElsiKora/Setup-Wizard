/* eslint-disable @elsikora-typescript/no-unsafe-argument */
import type { ICiConfig } from "../interface/ci-config.interface";

import { ECiModuleType } from "../enum/ci-module-type.enum";
import { ECiModule } from "../enum/ci-module.enum";
import { ECiProvider } from "../enum/ci-provider.enum";

export const CI_CONFIG: Record<ECiModule, ICiConfig> = {
	[ECiModule.CODECOMMIT_SYNC]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/codecommit-sync.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Mirror to CodeCommit
on: push

jobs:
  mirror_to_codecommit:
    name: Mirror to CodeCommit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Mirror to CodeCommit
        uses: pixta-dev/repository-mirroring-action@v1
        with:
          target_repo_url: \${{ secrets.CODECOMMIT_SSH_REPOSITORY_URL }}
          ssh_private_key: \${{ secrets.CODECOMMIT_SSH_PRIVATE_KEY }}
          ssh_username: \${{ secrets.CODECOMMIT_SSH_PRIVATE_KEY_ID }}`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Syncs the repository with AWS CodeCommit.",
		name: "CodeCommit Sync",
		type: ECiModuleType.UNIVERSAL,
	},
	[ECiModule.DEPENDABOT]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/dependabot.yml",
				template: (properties: object = {}) => {
					let content: string = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    target-branch: "{{devBranchName}}"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
    target-branch: "{{devBranchName}}"`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Runs Dependabot dependency updates.",
		name: "Dependabot",
		type: ECiModuleType.UNIVERSAL,
	},
	[ECiModule.QODANA]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/qodana.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Qodana Quality Scan
on: push

jobs:
  qodana:
    name: Qodana Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Qodana Scan
        uses: JetBrains/qodana-action@v2023.3
        env:
          QODANA_TOKEN: \${{ secrets.QODANA_TOKEN }}`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Runs Qodana static analysis.",
		name: "Qodana",
		type: ECiModuleType.UNIVERSAL,
	},
	[ECiModule.RELEASE]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/release.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Release
on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: yarn install

      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release --no-ci`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Runs release process.",
		name: "Release",
		type: ECiModuleType.NON_NPM,
	},
	[ECiModule.RELEASE_NPM]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/release.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Release And Publish
on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: yarn install

      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npx semantic-release`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Runs NPM release process.",
		name: "Release NPM",
		type: ECiModuleType.NPM_ONLY,
	},
	[ECiModule.SNYK]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/snyk.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Snyk Security Scan
on: push

jobs:
  build:
    name: Snyk Security Scan
    environment: snyk-npm
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Snyk
        run: |
          npm install snyk -g
          npm install snyk-to-html -g
          snyk auth \${{ secrets.SNYK_TOKEN }}

      - name: Install dependencies
        run: npm install

      - name: Snyk Open Source
        run: |
          snyk monitor

      - name: Snyk Code
        run: |
          snyk code test || true

      - name: Snyk IaC
        run: |
          snyk iac test || true`;

					for (const [key, value] of Object.entries(properties)) {
						content = content.replaceAll(new RegExp(`{{${key}}}`, "g"), value);
					}

					return content;
				},
			},
		},
		description: "Runs Snyk security scan.",
		name: "Snyk",
		type: ECiModuleType.UNIVERSAL,
	},
};
