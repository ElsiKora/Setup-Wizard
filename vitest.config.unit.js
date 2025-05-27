import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(currentDirectory, "./src"),
		},
	},
	test: {
		coverage: {
			all: true,
			exclude: ["node_modules/", "dist/", "**/index.ts", "**/*.d.ts", "**/test/**", "**/*.interface.ts", "**/*.type.ts", "*.config.js", "*.config.ts", ".elsikora/**"],
			include: ["src/**/*.ts"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/e2e/**"],
		globals: true,
		include: ["test/unit/**/*.test.ts"],
		root: ".",
		watch: false,
	},
});
