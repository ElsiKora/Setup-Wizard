// eslint-disable-next-line @elsikora/unicorn/prevent-abbreviations
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"../../../../bin": path.resolve(currentDirectory, "./bin"),
			"../../../../src": path.resolve(currentDirectory, "./src"),
			"../../bin": path.resolve(currentDirectory, "./bin"),
			"./helpers/e2e-utils": path.resolve(currentDirectory, "./test/e2e/helpers/e2e-utils"),
			"@": path.resolve(currentDirectory, "./src"),
			bin: path.resolve(currentDirectory, "./bin"),
			src: path.resolve(currentDirectory, "./src"),
			test: path.resolve(currentDirectory, "./test"),
		},
	},
	test: {
		coverage: {
			all: true,
			exclude: ["node_modules/", "dist/", "**/index.ts", "src/index.ts", "**/*.d.ts", "**/test/**", "**/*.interface.ts", "**/*.type.ts", "*.config.js", "*.config.ts", ".elsikora/**"],
			include: ["src/**/*.ts", "bin/**/*.js", "!src/index.ts", "!bin/index.js"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/unit/**"],
		globals: true,
		include: ["test/e2e/**/*.test.ts"],
		root: ".",
		watch: false,
	},
});
