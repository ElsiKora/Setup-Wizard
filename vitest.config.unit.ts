import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["**/*.test.ts"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/index.ts",
				"src/index.ts", // Explicitly exclude src/index.ts
				"**/*.d.ts",
				"**/tests/**",
				"**/*.interface.ts",
				"**/*.type.ts",
				"*.config.js",
				"*.config.ts",
				".elsikora/**",
			],
			include: [
				"src/**/*.ts", // Include all source files
				"!src/index.ts", // Explicitly exclude index.ts
			],
			all: true, // Include all source files
		},
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
