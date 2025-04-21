export const BRANCHLINT_CONFIG_CORE_DEPENDENCIES: Array<string> = ["husky", "@elsikora/git-branch-lint"];
export const BRANCHLINT_CONFIG_FILE_NAMES: Array<string> = [
	".elsikora/git-branch-lint.config.js",
	"package.json",
	`.elsikora/.git-branch-lintrc`,
	`.elsikora/.git-branch-lintrc.json`,
	`.elsikora/.git-branch-lintrc.yaml`,
	`.elsikora/.git-branch-lintrc.yml`,
	`.elsikora/.git-branch-lintrc.js`,
	`.elsikora/.git-branch-lintrc.ts`,
	`.elsikora/.git-branch-lintrc.mjs`,
	`.elsikora/.git-branch-lintrc.cjs`,
	`.elsikora/git-branch-lint.config.js`,
	`.elsikora/git-branch-lint.config.ts`,
	`.elsikora/git-branch-lint.config.mjs`,
	`.elsikora/git-branch-lint.config.cjs`,
];

export const BRANCHLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT: string = `#!/usr/bin/env sh

if [ -n "$CI" ]; then
  echo "Running in CI, skipping pre-push hook"
  exit 0
fi

echo '⌛️⌛️⌛️ Running branch name linter...'
npx @elsikora/git-branch-lint
`;

export const BRANCHLINT_CONFIG: string = `
export default {
 branches: {
  bugfix: { description: "🆕 Integration of new functionality", title: "Feature" },
  feature: { description: "🐞 Fixing issues in existing functionality", title: "Bugfix" },
  hotfix: { description: "🚑 Critical fixes for urgent issues", title: "Hotfix" },
  release: { description: "📦 Preparing a new release version", title: "Release" },
  support: { description: "🛠️ Support and maintenance tasks", title: "Support" },
 },
 ignore: ["dev"],
 rules: {
  "branch-max-length": 50,
  "branch-min-length": 5,
  "branch-pattern": ":type/:name",
  "branch-prohibited": ["main", "master", "release"],
  "branch-subject-pattern": "[a-z0-9-]+",
 },
};
`;
