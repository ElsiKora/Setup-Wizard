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
			// eslint-disable-next-line @elsikora/typescript/naming-convention
			all: true,
			exclude: ["node_modules/", "dist/", "**/index.ts", "**/*.d.ts", "**/test/**", "**/*.interface.ts", "**/*.type.ts", "*.config.js", "*.config.ts", ".elsikora/**"],
			include: ["src/**/*.ts"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/e2e/**"],
		// eslint-disable-next-line @elsikora/typescript/naming-convention
		globals: true,
		include: ["test/unit/**/*.test.ts"],
		root: ".",
		// eslint-disable-next-line @elsikora/typescript/naming-convention
		watch: false,
	},
});
