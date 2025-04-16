export const GITIGNORE_CONFIG: string = `# Compiled output
/dist/
/bin/
/build/
/out/
/tmp/
/temp/

# Dependency directories
/node_modules/
jspm_packages/
.pnp/
.pnp.js
.yarn/
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Error logs
*.log.*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
[Dd]esktop.ini

# Tests
/coverage/
/.nyc_output/
.jest/
junit.xml
/cypress/videos/
/cypress/screenshots/
/test-results/
/playwright-report/
/e2e-results/

# IDEs and editors
/.idea/
/.vscode/
*.sublime-workspace
*.sublime-project
/.atom/
/.emacs.d/
/.ensime_cache/
/.nvim/
/.c9/
*.launch
.settings/
.project
.classpath
*.iml
*.ipr
*.iws
.idea_modules/
*.code-workspace
.history/

# IDE - Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.vs/

# Environment variables
.env
.env.*
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
*.env
.envrc

# Cloud Platform Files
.elasticbeanstalk/*
!.elasticbeanstalk/*.cfg.yml
!.elasticbeanstalk/*.global.yml
.pestenska/*
.vercel
.now
.netlify
.deployment/
.terraform/
*.tfstate
*.tfstate.*
.vagrant/

# Dependency lock files
/package-lock.json
/yarn.lock
/pnpm-lock.yaml
/bun.lockb
*.lock-wscript
composer.lock
Gemfile.lock

# Runtime data
*.pid
*.pid.lock
*.seed
*.pid.db
pids/
*.pid

# Process Managers
.pm2/
ecosystem.config.js
process.json

# Framework specific
# Next.js
.next/
out/
next-env.d.ts

# Nuxt.js
.nuxt/
dist/
.output/

# Gatsby
.cache/

# Vue
.vue-test-utils/

# React
.react-debug/
storybook-static/

# Angular
.angular/
dist/
tmp/
/connect.lock
/libpeerconnection.log

# Docusaurus
.docusaurus/
.cache-loader/

# Static site generators
_site/
.jekyll-cache/
.jekyll-metadata
.hugo_build.lock

# Serverless architectures
.serverless/
.aws-sam/
.sst/

# Service integrations
.firebase/
.amplify/
.sentryclirc
.contentful.json

# Misc files
*.swp
*.swo
*.swn
*.bak
*.tmp
*.temp
*~
.svn/
CVS/
.hg/
.fuse_hidden*
.directory
.nfs*
._*
.Trash-*

# Package specific
.rollup.cache/
tsconfig.tsbuildinfo
.eslintcache
.stylelintcache
.prettiercache
.webpack/
.turbo
.svelte-kit

# Local dev tools
.nodemon-debug
.clinic/
.depcruise.cache
.elsikora/commitlint-ai.config.js

# Documentation
/docs/_build/
/site/

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# TypeScript incremental compilation cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# macOS
.AppleDouble
.LSOverride
Icon
Network Trash Folder
Temporary Items

# Windows
$RECYCLE.BIN/
System Volume Information
`;
