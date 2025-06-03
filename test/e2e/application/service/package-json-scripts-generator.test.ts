import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import { PackageJsonScriptsGeneratorService } from "../../../../src/application/service/package-json-scripts-generator.service";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";

describe("PackageJsonScriptsGeneratorService E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async () => ({ stdout: "", stderr: "", success: false }),
		fileExists: async () => false,
		readFile: async () => "",
		createPackageJson: async () => {},
		cleanup: async () => {},
	};

	let scriptGenerator: PackageJsonScriptsGeneratorService;

	beforeAll(async () => {
		// Create a temporary test directory and get utility functions
		const utils = await createTestDirectory("package-scripts-generator");
		Object.assign(testUtils, utils);

		// Create a TypeScript package.json for testing
		await testUtils.createPackageJson(createTypeScriptPackageJson());

		// Initialize the service
		scriptGenerator = new PackageJsonScriptsGeneratorService();
	});

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	it("should generate basic lint scripts when no frameworks are detected", () => {
		// Test with empty frameworks array and custom paths
		const customPaths = ["src/**/*.ts", "tests/**/*.ts"];
		const result = scriptGenerator.generateLintScripts([], customPaths);

		// Verify the basic scripts
		expect(result).toHaveProperty("lint");
		expect(result).toHaveProperty("lint:fix");
		expect(result.lint).toBe("eslint src/**/*.ts tests/**/*.ts");
		expect(result["lint:fix"]).toBe("eslint src/**/*.ts tests/**/*.ts --fix");

		// Verify there are no additional scripts
		expect(result).not.toHaveProperty("lint:watch");
		expect(result).not.toHaveProperty("lint:types");
		expect(result).not.toHaveProperty("lint:all");
	});

	it("should generate lint scripts with watch when watchable framework is detected", () => {
		// Test with Express framework
		const frameworks = [
			{
				name: EFramework.EXPRESS,
				lintPaths: ["src/**/*.ts"],
				features: [],
			},
		];

		const result = scriptGenerator.generateLintScripts(frameworks, []);

		// Verify watch script is added
		expect(result).toHaveProperty("lint:watch");
		expect(result["lint:watch"]).toBe("npx eslint-watch src/**/*.ts");
	});

	it("should generate TypeScript-specific lint scripts when TypeScript is detected", () => {
		// Test with TypeScript framework
		const frameworks = [
			{
				name: EFramework.REACT,
				lintPaths: ["src/**/*.tsx"],
				features: [EEslintFeature.TYPESCRIPT],
			},
		];

		const result = scriptGenerator.generateLintScripts(frameworks, []);

		// Verify TypeScript-specific scripts are added
		expect(result).toHaveProperty("lint:types");
		expect(result).toHaveProperty("lint:all");
		expect(result["lint:types"]).toBe("tsc --noEmit");
		expect(result["lint:all"]).toBe("npm run lint && npm run lint:types");
	});

	it("should generate test lint scripts when testing framework is detected", () => {
		// Test with Angular framework (has testing framework)
		const frameworks = [
			{
				name: EFramework.ANGULAR,
				lintPaths: ["src/**/*.ts"],
				features: [EEslintFeature.TYPESCRIPT],
			},
		];

		const result = scriptGenerator.generateLintScripts(frameworks, []);

		// Verify test lint scripts are added
		expect(result).toHaveProperty("lint:test");
		expect(result["lint:test"]).toBe('eslint "**/*.spec.ts"');
		expect(result["lint:all"]).toBe("npm run lint && npm run lint:types && npm run lint:test");
	});

	it("should combine multiple framework paths when multiple frameworks are detected", () => {
		// Test with multiple frameworks
		const frameworks = [
			{
				name: EFramework.REACT,
				lintPaths: ["src/**/*.tsx"],
				features: [EEslintFeature.TYPESCRIPT],
			},
			{
				name: EFramework.EXPRESS,
				lintPaths: ["server/**/*.ts"],
				features: [EEslintFeature.TYPESCRIPT],
			},
		];

		const result = scriptGenerator.generateLintScripts(frameworks, []);

		// Verify combined lint paths
		expect(result.lint).toBe("eslint src/**/*.tsx server/**/*.ts");
		expect(result["lint:fix"]).toBe("eslint src/**/*.tsx server/**/*.ts --fix");

		// Verify watch script has the Express paths
		expect(result["lint:watch"]).toBe("npx eslint-watch server/**/*.ts");

		// Verify TypeScript scripts
		expect(result).toHaveProperty("lint:types");
		expect(result).toHaveProperty("lint:all");
	});
});
