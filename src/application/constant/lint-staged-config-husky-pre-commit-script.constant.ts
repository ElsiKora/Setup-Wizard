export const LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT: string = `#!/usr/bin/env sh

echo '⌛️⌛️⌛️ Running pre-commiting checks...'
npx lint-staged
`;
