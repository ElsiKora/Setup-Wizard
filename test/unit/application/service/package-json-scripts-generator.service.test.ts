import { describe, it, expect, beforeEach } from "vitest";
import { PackageJsonScriptsGeneratorService } from "../../../../src/application/service/package-json-scripts-generator.service";
import type { IFrameworkConfig } from "../../../../src/domain/interface/framework-config.interface";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";

describe("PackageJsonScriptsGeneratorService", () => {
	let service: PackageJsonScriptsGeneratorService;

	beforeEach(() => {
		service = new PackageJsonScriptsGeneratorService();
	});

	describe("generateLintScripts", () => {
		it("should generate basic lint scripts with custom paths when no frameworks are detected", () => {
			const customPaths = ['"src/**/*.js"', '"tests/**/*.js"'];
			const result = service.generateLintScripts([], customPaths);

			expect(result).toEqual({
				lint: 'eslint "src/**/*.js" "tests/**/*.js"',
				"lint:fix": 'eslint "src/**/*.js" "tests/**/*.js" --fix',
			});
		});

		it("should generate lint scripts based on framework lint paths", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.REACT,
					lintPaths: ['"src/**/*.{js,jsx}"', '"tests/**/*.js"'],
					features: [],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toEqual({
				lint: 'eslint "src/**/*.{js,jsx}" "tests/**/*.js"',
				"lint:fix": 'eslint "src/**/*.{js,jsx}" "tests/**/*.js" --fix',
			});
		});

		it("should generate lint scripts for multiple frameworks", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.REACT,
					lintPaths: ['"src/**/*.{js,jsx}"'],
					features: [],
					ignorePaths: [],
				},
				{
					name: EFramework.NODE,
					lintPaths: ['"server/**/*.js"'],
					features: [],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toEqual({
				lint: 'eslint "src/**/*.{js,jsx}" "server/**/*.js"',
				"lint:fix": 'eslint "src/**/*.{js,jsx}" "server/**/*.js" --fix',
			});
		});

		it("should add watch script for watchable frameworks", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.EXPRESS,
					lintPaths: ['"src/**/*.js"'],
					features: [],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toHaveProperty("lint:watch");
			expect(result["lint:watch"]).toBe('npx eslint-watch "src/**/*.js"');
		});

		it("should add TypeScript-specific scripts when TypeScript feature is detected", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.REACT,
					lintPaths: ['"src/**/*.{ts,tsx}"'],
					features: [EEslintFeature.TYPESCRIPT],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toHaveProperty("lint:types");
			expect(result).toHaveProperty("lint:all");
			expect(result["lint:types"]).toBe("tsc --noEmit");
			expect(result["lint:all"]).toBe("npm run lint && npm run lint:types");
		});

		it("should add test-specific scripts when test frameworks are detected", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.ANGULAR,
					lintPaths: ['"src/**/*.ts"'],
					features: [EEslintFeature.TYPESCRIPT],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toHaveProperty("lint:test");
			expect(result).toHaveProperty("lint:all");
			expect(result["lint:test"]).toBe('eslint "**/*.spec.ts"');
			expect(result["lint:all"]).toBe("npm run lint && npm run lint:types && npm run lint:test");
		});

		it("should combine all script types for a complete configuration", () => {
			const frameworks: Array<IFrameworkConfig> = [
				{
					name: EFramework.NEST, // Both watchable and test framework
					lintPaths: ['"src/**/*.ts"', '"test/**/*.ts"'],
					features: [EEslintFeature.TYPESCRIPT],
					ignorePaths: [],
				},
			];

			const result = service.generateLintScripts(frameworks, []);

			expect(result).toHaveProperty("lint");
			expect(result).toHaveProperty("lint:fix");
			expect(result).toHaveProperty("lint:watch");
			expect(result).toHaveProperty("lint:types");
			expect(result).toHaveProperty("lint:test");
			expect(result).toHaveProperty("lint:all");
			expect(result["lint:all"]).toBe("npm run lint && npm run lint:types && npm run lint:test");
		});
	});
});
