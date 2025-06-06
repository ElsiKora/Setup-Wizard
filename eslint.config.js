import { createConfig } from "@elsikora/eslint-config";

const config = {
	ignores: ["package-lock.json", "yarn.lock", "bun.lock", "pnpm-lock.yaml", "dist", "bin", "build", "out", "www", "public/build", "_site", "release", "node_modules", ".env", ".env.local", ".env.*", "coverage", ".cache", "public", "static", "assets", "uploads", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico", "tmp", ".temp", "**/*.d.ts", "**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts", "__tests__", "test", "tests", ".rollup.cache"],
};

export default [
	config,
	...(await createConfig({
		withCheckFile: true,
		withJavascript: true,
		withJson: true,
		withMarkdown: true,
		withNode: true,
		withNoSecrets: true,
		withPackageJson: true,
		withPerfectionist: true,
		withPrettier: true,
		withRegexp: true,
		withSonar: true,
		withStylistic: true,
		withTypescriptStrict: true,
		withUnicorn: true,
		withYaml: true,
	})),
];
