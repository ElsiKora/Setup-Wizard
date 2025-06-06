export const BRANCH_LINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT: string = `#!/usr/bin/env sh

if [ -n "$CI" ]; then
  echo "Running in CI, skipping pre-push hook"
  exit 0
fi

echo '⌛️⌛️⌛️ Running branch name linter...'
npx @elsikora/git-branch-lint
`;
