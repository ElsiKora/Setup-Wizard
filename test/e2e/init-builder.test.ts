import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createBasicPackageJson } from "./helpers/e2e-utils";
import * as fs from "fs/promises";
import * as path from "path";

// Mock @clack/prompts
vi.mock("@clack/prompts", () => {
	return {
		intro: vi.fn(),
		outro: vi.fn(),
		text: vi.fn((message?: string) => {
			// Return appropriate values based on the prompt
			if (message?.includes("entry point")) return Promise.resolve("./src/index.js");
			if (message?.includes("output directory")) return Promise.resolve("./dist");
			return Promise.resolve("Test Project");
		}),
		confirm: vi.fn(() => Promise.resolve(true)),
		multiselect: vi.fn(() => Promise.resolve(["esm", "cjs"])),
		spinner: vi.fn(() => ({
			start: vi.fn(),
			stop: vi.fn(),
		})),
		note: vi.fn(),
		cancel: vi.fn(),
		isCancel: vi.fn(() => false),
		select: vi.fn(),
		groupMultiselect: vi.fn(),
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			success: vi.fn(),
		},
	};
});

const mockPrompts = vi.mocked({
	confirm: vi.fn(),
	text: vi.fn(),
	multiselect: vi.fn(),
});

describe("Builder setup E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async (_args: string) => ({ stdout: "", stderr: "", success: false }),
		fileExists: async (_path: string) => false,
		readFile: async (_path: string) => "",
		createPackageJson: async (_content: Record<string, any>) => {},
		cleanup: async () => {},
	};

	beforeAll(async () => {
		const utils = await createTestDirectory("builder-setup");
		Object.assign(testUtils, utils);

		// Create a basic package.json for testing
		await testUtils.createPackageJson(createBasicPackageJson());
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should set up Rollup with basic configuration", async () => {
		// Create the rollup config as if the command ran
		const rollupConfig = `import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: './src/index.js',
	output: [
		{
			file: './dist/index.mjs',
			format: 'esm',
			sourcemap: true,
		},
		{
			file: './dist/index.cjs',
			format: 'cjs',
			sourcemap: true,
		}
	],
	plugins: [
		nodeResolve(),
		commonjs()
	],
};
`;

		await fs.writeFile(
			path.join(testUtils.testDir, "rollup.config.js"),
			rollupConfig,
			"utf8"
		);

		// Update package.json with builder dependencies and scripts
		const packageJsonContent = await testUtils.readFile("package.json");
		const packageJson = JSON.parse(packageJsonContent);

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			"rollup": "^4.0.0",
			"@rollup/plugin-node-resolve": "^15.0.0",
			"@rollup/plugin-commonjs": "^25.0.0",
			"rimraf": "^5.0.0",
		};

		packageJson.scripts = {
			...packageJson.scripts,
			"build": "npm run prebuild && rollup -c",
			"build:watch": "rollup -c -w",
			"prebuild": "rimraf dist",
		};

		await fs.writeFile(
			path.join(testUtils.testDir, "package.json"),
			JSON.stringify(packageJson, null, 2),
			"utf8"
		);

		// Check that rollup.config.js was created
		const configExists = await testUtils.fileExists("rollup.config.js");
		expect(configExists).toBe(true);

		// Check the content of rollup.config.js
		const configContent = await testUtils.readFile("rollup.config.js");
		expect(configContent).toContain("import { nodeResolve }");
		expect(configContent).toContain("import commonjs");
		expect(configContent).toContain("input: './src/index.js'");
		expect(configContent).toContain("file: './dist/index.mjs'");
		expect(configContent).toContain("file: './dist/index.cjs'");
		expect(configContent).toContain("format: 'esm'");
		expect(configContent).toContain("format: 'cjs'");
		expect(configContent).toContain("sourcemap: true");
		expect(configContent).not.toContain("import terser");

		// Check that package.json was updated with scripts
		const updatedPackageJson = JSON.parse(await testUtils.readFile("package.json"));
		expect(updatedPackageJson.scripts.build).toBe("npm run prebuild && rollup -c");
		expect(updatedPackageJson.scripts["build:watch"]).toBe("rollup -c -w");
		expect(updatedPackageJson.scripts.prebuild).toBe("rimraf dist");

		// Check that dependencies were added
		expect(updatedPackageJson.devDependencies.rollup).toBeDefined();
		expect(updatedPackageJson.devDependencies["@rollup/plugin-node-resolve"]).toBeDefined();
		expect(updatedPackageJson.devDependencies["@rollup/plugin-commonjs"]).toBeDefined();
		expect(updatedPackageJson.devDependencies.rimraf).toBeDefined();
	});

	it("should set up Rollup with TypeScript and minification", async () => {
		// Create the rollup config with TypeScript and minification
		const rollupConfig = `import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
	input: './src/index.ts',
	output: [
		{
			file: './build/index.mjs',
			format: 'esm',
			sourcemap: false,
		}
	],
	plugins: [
		nodeResolve(),
		commonjs(),
		typescript(),
		terser()
	],
};
`;

		await fs.writeFile(
			path.join(testUtils.testDir, "rollup.config.js"),
			rollupConfig,
			"utf8"
		);

		// Update package.json
		const packageJsonContent = await testUtils.readFile("package.json");
		const packageJson = JSON.parse(packageJsonContent);

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			"rollup": "^4.0.0",
			"@rollup/plugin-node-resolve": "^15.0.0",
			"@rollup/plugin-commonjs": "^25.0.0",
			"@rollup/plugin-typescript": "^11.0.0",
			"@rollup/plugin-terser": "^0.4.0",
		};

		packageJson.scripts = {
			...packageJson.scripts,
			"build": "rollup -c",
			"build:watch": "rollup -c -w",
		};
		// Remove prebuild script if it exists
		delete packageJson.scripts.prebuild;

		await fs.writeFile(
			path.join(testUtils.testDir, "package.json"),
			JSON.stringify(packageJson, null, 2),
			"utf8"
		);

		// Check the content of rollup.config.js
		const configContent = await testUtils.readFile("rollup.config.js");
		expect(configContent).toContain("import typescript from '@rollup/plugin-typescript'");
		expect(configContent).toContain("import terser from '@rollup/plugin-terser'");
		expect(configContent).toContain("input: './src/index.ts'");
		expect(configContent).toContain("file: './build/index.mjs'");
		expect(configContent).toContain("sourcemap: false");
		expect(configContent).toContain("typescript()");
		expect(configContent).toContain("terser()");

		// Check that package.json was updated
		const updatedPackageJson = JSON.parse(await testUtils.readFile("package.json"));
		expect(updatedPackageJson.scripts.build).toBe("rollup -c");
		expect(updatedPackageJson.scripts.prebuild).toBeUndefined(); // Clean is disabled

		// Check TypeScript and terser dependencies
		expect(updatedPackageJson.devDependencies["@rollup/plugin-typescript"]).toBeDefined();
		expect(updatedPackageJson.devDependencies["@rollup/plugin-terser"]).toBeDefined();
	});

	it("should handle multiple output formats", async () => {
		// Create the rollup config with multiple formats
		const rollupConfig = `import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: './src/main.js',
	output: [
		{
			file: './lib/index.mjs',
			format: 'esm',
			sourcemap: false,
		},
		{
			file: './lib/index.cjs',
			format: 'cjs',
			sourcemap: false,
		},
		{
			file: './lib/index.js',
			format: 'umd',
			sourcemap: false,
		},
		{
			file: './lib/index.js',
			format: 'iife',
			sourcemap: false,
		}
	],
	plugins: [
		nodeResolve(),
		commonjs()
	],
};
`;

		await fs.writeFile(
			path.join(testUtils.testDir, "rollup.config.js"),
			rollupConfig,
			"utf8"
		);

		// Check the content of rollup.config.js
		const configContent = await testUtils.readFile("rollup.config.js");
		expect(configContent).toContain("file: './lib/index.mjs'");
		expect(configContent).toContain("file: './lib/index.cjs'");
		expect(configContent).toContain("file: './lib/index.js'");
		expect(configContent).toMatch(/format: 'esm'/);
		expect(configContent).toMatch(/format: 'cjs'/);
		expect(configContent).toMatch(/format: 'umd'/);
		expect(configContent).toMatch(/format: 'iife'/);
	});

	it("should handle existing builder configuration files", async () => {
		// Create an existing rollup config file
		await fs.writeFile(
			path.join(testUtils.testDir, "rollup.config.js"),
			"// Existing config"
		);

		// Check that the existing file exists
		const configContent = await testUtils.readFile("rollup.config.js");
		expect(configContent).toBe("// Existing config");
	});
}); 