export const COMMITLINT_CONFIG_HUSKY_PRE_PUSH_SCRIPT: string = `#!/usr/bin/env sh
echo '⌛️⌛️⌛️ Running branch name linter...'
npx @elsikora/git-branch-lint
`;
