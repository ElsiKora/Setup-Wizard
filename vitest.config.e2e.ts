import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["test/e2e/**/*.test.ts"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/unit/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "dist/", "**/index.ts", "src/index.ts", "**/*.d.ts", "**/test/**", "**/*.interface.ts", "**/*.type.ts", "*.config.js", "*.config.ts", ".elsikora/**"],
			all: true,
			include: ["src/**/*.ts", "bin/**/*.js", "!src/index.ts", "!bin/index.js"],
		},
		root: ".",
		watch: false,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			test: path.resolve(__dirname, "./test"),
			bin: path.resolve(__dirname, "./bin"),
			src: path.resolve(__dirname, "./src"),
			"./helpers/e2e-utils": path.resolve(__dirname, "./test/e2e/helpers/e2e-utils"),
			"../../bin": path.resolve(__dirname, "./bin"),
			"../../../../bin": path.resolve(__dirname, "./bin"),
			"../../../../src": path.resolve(__dirname, "./src"),
		},
	},
});
