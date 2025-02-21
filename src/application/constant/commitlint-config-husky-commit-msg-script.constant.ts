// eslint-disable-next-line @elsikora-unicorn/prevent-abbreviations
export const COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT: string = `#!/usr/bin/env sh
echo '⌛️⌛️⌛️ Running commit linter...'
npx --no -- commitlint --edit $1
`;
