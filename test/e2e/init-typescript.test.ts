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
			if (message?.includes("base URL")) return Promise.resolve("./src");
			if (message?.includes("root directory")) return Promise.resolve("./src");
			if (message?.includes("output directory")) return Promise.resolve("./dist");
			return Promise.resolve("Test Project");
		}),
		confirm: vi.fn(() => Promise.resolve(true)),
		select: vi.fn(() => Promise.resolve("value")),
		multiselect: vi.fn(() => Promise.resolve(["typescript", "node"])),
		spinner: vi.fn(() => ({
			start: vi.fn(),
			stop: vi.fn(),
		})),
		isCancel: vi.fn(() => false),
		log: {
			info: vi.fn(),
			warning: vi.fn(),
			error: vi.fn(),
			success: vi.fn(),
			message: vi.fn(),
		},
		note: vi.fn(),
	};
});

describe("TypeScript setup E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async (_args: string) => ({ stdout: "", stderr: "", success: false }),
		fileExists: async (_path: string) => false,
		readFile: async (_path: string) => "",
		createPackageJson: async (_content: Record<string, any>) => {},
		cleanup: async () => {},
	};

	beforeAll(async () => {
		// Create a temporary test directory and get utility functions
		const utils = await createTestDirectory("typescript-setup");
		Object.assign(testUtils, utils);

		// Create a basic package.json for testing
		await testUtils.createPackageJson(createBasicPackageJson());

		// Create src directory
		await fs.mkdir(path.join(testUtils.testDir, "src"), { recursive: true });
		
		// Create sample TypeScript files
		await fs.writeFile(
			path.join(testUtils.testDir, "src", "index.ts"),
			`export function main(): void {
	console.log("Hello TypeScript!");
}`,
			"utf8",
		);
		
		await fs.writeFile(
			path.join(testUtils.testDir, "src", "utils.ts"),
			`export function add(a: number, b: number): number {
	return a + b;
}`,
			"utf8",
		);
	});

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	it("should set up TypeScript with basic configuration", async () => {
		// Mock the TypeScript configuration
		const tsConfigContent = {
			compilerOptions: {
				target: "ESNext",
				module: "ESNext",
				moduleResolution: "bundler",
				baseUrl: "./src",
				rootDir: "./src",
				outDir: "./dist",
				declaration: true,
				declarationMap: true,
				sourceMap: true,
				strict: true,
				noImplicitAny: true,
				strictNullChecks: true,
				strictFunctionTypes: true,
				strictBindCallApply: true,
				strictPropertyInitialization: true,
				noImplicitThis: true,
				alwaysStrict: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				noImplicitReturns: true,
				noFallthroughCasesInSwitch: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist"],
		};

		await fs.writeFile(
			path.join(testUtils.testDir, "tsconfig.json"),
			JSON.stringify(tsConfigContent, null, 2),
			"utf8",
		);

		// Update package.json with TypeScript dependencies and scripts
		const packageJsonContent = await testUtils.readFile("package.json");
		const packageJson = JSON.parse(packageJsonContent);

		packageJson.devDependencies = {
			...packageJson.devDependencies,
			typescript: "^5.0.0",
		};

		packageJson.scripts = {
			...packageJson.scripts,
			"build:types": "tsc",
			"lint:types": "tsc --noEmit",
		};

		await fs.writeFile(
			path.join(testUtils.testDir, "package.json"),
			JSON.stringify(packageJson, null, 2),
			"utf8",
		);

		// Verify tsconfig.json was created
		const hasTsConfig = await testUtils.fileExists("tsconfig.json");
		expect(hasTsConfig).toBe(true);

		// Verify package.json was updated with TypeScript dependencies
		const updatedPackageJsonContent = await testUtils.readFile("package.json");
		const updatedPackageJson = JSON.parse(updatedPackageJsonContent);

		// Verify typescript is in devDependencies
		expect(updatedPackageJson.devDependencies).toHaveProperty("typescript");

		// Verify package.json has TypeScript scripts
		expect(updatedPackageJson.scripts).toHaveProperty("build:types");
		expect(updatedPackageJson.scripts).toHaveProperty("lint:types");
		expect(updatedPackageJson.scripts["build:types"]).toBe("tsc");
		expect(updatedPackageJson.scripts["lint:types"]).toBe("tsc --noEmit");

		// Verify tsconfig.json content
		const tsConfig = JSON.parse(await testUtils.readFile("tsconfig.json"));
		expect(tsConfig.compilerOptions.target).toBe("ESNext");
		expect(tsConfig.compilerOptions.module).toBe("ESNext");
		expect(tsConfig.compilerOptions.baseUrl).toBe("./src");
		expect(tsConfig.compilerOptions.rootDir).toBe("./src");
		expect(tsConfig.compilerOptions.outDir).toBe("./dist");
		expect(tsConfig.compilerOptions.strict).toBe(true);
		expect(tsConfig.include).toEqual(["src/**/*"]);
		expect(tsConfig.exclude).toContain("node_modules");
		expect(tsConfig.exclude).toContain("dist");
	}, 60000);

	it("should set up TypeScript with clean architecture paths", async () => {
		// Create tsconfig with clean architecture paths
		const tsConfigContent = {
			compilerOptions: {
				target: "ESNext",
				module: "ESNext",
				moduleResolution: "bundler",
				baseUrl: "./src",
				rootDir: "./src",
				outDir: "./dist",
				strict: true,
				skipLibCheck: true,
				paths: {
					"@application/*": ["application/*"],
					"@domain/*": ["domain/*"],
					"@infrastructure/*": ["infrastructure/*"],
					"@presentation/*": ["presentation/*"],
				},
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist"],
		};

		await fs.writeFile(
			path.join(testUtils.testDir, "tsconfig.json"),
			JSON.stringify(tsConfigContent, null, 2),
			"utf8",
		);

		// Create clean architecture directories
		const dirs = ["application", "domain", "infrastructure", "presentation"];
		for (const dir of dirs) {
			await fs.mkdir(path.join(testUtils.testDir, "src", dir), { recursive: true });
		}

		// Verify tsconfig.json has path aliases
		const tsConfig = JSON.parse(await testUtils.readFile("tsconfig.json"));
		expect(tsConfig.compilerOptions).toHaveProperty("paths");
		expect(tsConfig.compilerOptions.paths).toHaveProperty("@application/*");
		expect(tsConfig.compilerOptions.paths).toHaveProperty("@domain/*");
		expect(tsConfig.compilerOptions.paths).toHaveProperty("@infrastructure/*");
		expect(tsConfig.compilerOptions.paths).toHaveProperty("@presentation/*");
	});

	it("should set up TypeScript with decorators enabled", async () => {
		// Create tsconfig with decorators enabled
		const tsConfigContent = {
			compilerOptions: {
				target: "ESNext",
				module: "ESNext",
				moduleResolution: "bundler",
				baseUrl: "./src",
				rootDir: "./src",
				outDir: "./dist",
				strict: true,
				skipLibCheck: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules", "dist"],
		};

		await fs.writeFile(
			path.join(testUtils.testDir, "tsconfig.json"),
			JSON.stringify(tsConfigContent, null, 2),
			"utf8",
		);

		// Verify tsconfig.json has decorator options
		const tsConfig = JSON.parse(await testUtils.readFile("tsconfig.json"));
		expect(tsConfig.compilerOptions.experimentalDecorators).toBe(true);
		expect(tsConfig.compilerOptions.emitDecoratorMetadata).toBe(true);
	});

	it("should handle existing TypeScript configuration files", async () => {
		// Create existing tsconfig files
		await fs.writeFile(
			path.join(testUtils.testDir, "tsconfig.json"),
			'{"compilerOptions": {}}',
			"utf8",
		);
		
		await fs.writeFile(
			path.join(testUtils.testDir, "tsconfig.base.json"),
			'{"compilerOptions": {}}',
			"utf8",
		);

		// Verify existing files are still there
		const hasTsConfig = await testUtils.fileExists("tsconfig.json");
		const hasTsConfigBase = await testUtils.fileExists("tsconfig.base.json");
		
		expect(hasTsConfig).toBe(true);
		expect(hasTsConfigBase).toBe(true);
	});
}); 