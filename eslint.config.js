import { createConfig } from "@elsikora/eslint-config";

const config = {
	ignores: [".next/**/*", "**/*.d.ts", "public/**/*", "package-lock.json", "yarn.lock", "bun.lock", "pnpm-lock.yaml", "dist", "build", "out", "www", "public/build", "_site", "release", "node_modules", ".env", ".env.local", ".env.*", "coverage", ".cache", "public", "static", "assets", "uploads", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico", "*.md", "*.mdx", "tmp", ".temp", "**/*.d.ts", "**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts", "__tests__", "test", "tests"],
};

export default [
	config,
	...(await createConfig({
		withUnicorn: true,
	})),
];
