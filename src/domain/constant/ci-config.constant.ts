import {ECiModule} from "../enum/ci-module.enum";
import {ICiConfig} from "../interface/ci-config.interface";
import {ECiProvider} from "../enum/ci-provider.enum";
import {ECiModuleType} from "../enum/ci-module-type.enum";

export const CI_CONFIG: Record<ECiModule, ICiConfig> = {
    [ECiModule.CODECOMMIT_SYNC]: {
        name: "CodeCommit Sync",
        description: "Syncs the repository with AWS CodeCommit.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Mirror to CodeCommit
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

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
                filePath: ".github/workflows/codecommit-sync.yml"
            }
        }
    },
    [ECiModule.QODANA]: {
        name: "Qodana",
        description: "Runs Qodana static analysis.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Qodana Quality Scan
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

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
                filePath: ".github/workflows/qodana.yml"
            }
        }
    },
    [ECiModule.DEPENDABOT]: {
        name: "Dependabot",
        description: "Runs Dependabot dependency updates.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `version: 2
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

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
         filePath:  ".github/dependabot.yml"
            }
        }
    },
    [ECiModule.RELEASE]: {
        name: "Release",
        description: "Runs release process.",
        type: ECiModuleType.NON_NPM,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Release and Publish
on:
  push:
    branches:
      - main

jobs:
  changesets:
    runs-on: ubuntu-latest
    outputs:
      hasChangesets: \${{ steps.changesets.outputs.hasChangesets }}
      publishedPackages: \${{ steps.changesets.outputs.publishedPackages }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: yarn install

      - name: Create Release Pull Request
        id: changesets
        uses: changesets/action@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  prepare-release-info:
    needs: changesets
    runs-on: ubuntu-latest
    outputs:
      version: \${{ steps.get_version.outputs.version }}
      release_notes: \${{ steps.generate_release_notes.outputs.release_notes }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: List tags
        run: git tag

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Get package version
        id: get_version
        run: echo "::set-output name=version::$(jq -r '.version' package.json)"

      - name: Generate release notes
        id: generate_release_notes
        run: |
          notes=$(git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%h: %s")
          if [ -z "$notes" ]; then
            echo "No new changes to release."
            notes="No new changes."
          fi
          echo "::set-output name=release_notes::$(echo "$notes" | base64)"

  github-release:
    needs: prepare-release-info
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Decode Release Notes
        id: decode
        run: echo "::set-output name=release_notes::$(echo '\${{ needs.prepare-release-info.outputs.release_notes }}' | base64 --decode)"

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ needs.prepare-release-info.outputs.version }}
          release_name: Release \${{ needs.prepare-release-info.outputs.version }}
          body: \${{ steps.decode.outputs.release_notes }}
          draft: false
          prerelease: false`;

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
                filePath: ".github/workflows/release.yml"
        }
        }
    },
    [ECiModule.RELEASE_NPM]: {
        name: "Release NPM",
        description: "Runs NPM release process.",
        type: ECiModuleType.NPM_ONLY,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Release
on:
  push:
    branches:
      - main

concurrency: \${{ github.workflow }}-\${{ github.ref }}
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - name: Install Dependencies
        run: yarn

      - name: Create Release Pull Request or Publish to NPM
        id: changesets
        uses: changesets/action@v1
        with:
          publish: yarn release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`;

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
                filePath: ".github/workflows/release.yml"
        }
        }
    },
    [ECiModule.SNYK]: {
        name: "Snyk",
        description: "Runs Snyk security scan.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Snyk Security Scan
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

                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });

                    return content;
                },
                filePath: ".github/workflows/snyk.yml"
        }
        }
    }
};
