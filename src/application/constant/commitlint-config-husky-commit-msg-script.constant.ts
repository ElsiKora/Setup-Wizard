export const COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT = `#!/usr/bin/env sh
echo '⌛️⌛️⌛️ Running commit linter...'
npx --no -- commitlint --edit $1
`;
