/* eslint-disable @elsikora/typescript/no-unsafe-argument */

import type { ICiConfig } from "../interface/ci-config.interface";

import { ECiModuleType } from "../enum/ci-module-type.enum";
import { ECiModule } from "../enum/ci-module.enum";
import { ECiProvider } from "../enum/ci-provider.enum";

/**
 * Configuration constant for Continuous Integration modules.
 * Provides configuration details and template functions for generating CI workflow files
 * for different CI providers and module types.
 */
export const CI_CONFIG: Record<ECiModule, ICiConfig> = {
	[ECiModule.CODECOMMIT_SYNC]: {
		content: {
			[ECiProvider.GITHUB]: {
				filePath: ".github/workflows/mirror-to-codecommit.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Mirror to CodeCommit

env:
  CHECKOUT_DEPTH: 0

on: push

jobs:
  mirror_to_codecommit:
    name: Mirror to CodeCommit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: \${{ env.CHECKOUT_DEPTH }}

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
				filePath: ".github/workflows/qodana-quality-scan.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Qodana Quality Scan

env:
  NODE_VERSION: 20
  CHECKOUT_DEPTH: 0

on: push

jobs:
  qodana_quality_scan:
    name: Qodana Quality Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: \${{ env.CHECKOUT_DEPTH }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install Dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Qodana Scan
        uses: JetBrains/qodana-action@v2024.3
        env:
          QODANA_TOKEN: \${{ secrets.QODANA_TOKEN }}
`;

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
					const mainBranch: string = ((properties as Record<string, unknown>).mainBranch as string) ?? "main";
					const preReleaseBranch: string | undefined = (properties as Record<string, unknown>).preReleaseBranch as string | undefined;
					const isPrerelease: boolean = ((properties as Record<string, unknown>).isPrerelease as boolean) ?? false;

					const branches: Array<string> = [`- ${mainBranch}`];

					if (isPrerelease && preReleaseBranch) {
						branches.push(`- ${preReleaseBranch}`);
					}

					let content: string = `name: Release And Publish

env:
  NODE_VERSION: 20

on:
  push:
    branches:
${branches.map((branch: string) => `      ${branch}`).join("\n")}

jobs:
  release:
    name: Release And Publish
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: npm run release`;

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
					const mainBranch: string = ((properties as Record<string, unknown>).mainBranch as string) ?? "main";
					const preReleaseBranch: string | undefined = (properties as Record<string, unknown>).preReleaseBranch as string | undefined;
					const isPrerelease: boolean = ((properties as Record<string, unknown>).isPrerelease as boolean) ?? false;

					const branches: Array<string> = [`- ${mainBranch}`];

					if (isPrerelease && preReleaseBranch) {
						branches.push(`- ${preReleaseBranch}`);
					}

					let content: string = `name: Release And Publish

env:
  NODE_VERSION: 20

on:
  push:
    branches:
${branches.map((branch: string) => `      ${branch}`).join("\n")}

jobs:
  release:
    name: Release And Publish
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npm run release`;

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
				filePath: ".github/workflows/snyk-security-scan.yml",
				template: (properties: object = {}) => {
					let content: string = `name: Snyk Security Scan

env:
  NODE_VERSION: 20
  SNYK_GLOBAL_PACKAGES: snyk snyk-to-html

on: push

jobs:
  snyk_security_scan:
    name: Snyk Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Setup Snyk
        run: |
          npm install \${{ env.SNYK_GLOBAL_PACKAGES }} -g
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
