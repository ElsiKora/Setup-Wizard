import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import { ConfigMapper } from "../../../../bin/application/mapper/config.mapper.js";

describe("Config Mapper E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async () => ({ stdout: "", stderr: "", success: false }),
		fileExists: async () => false,
		readFile: async () => "",
		createPackageJson: async () => {},
		cleanup: async () => {},
	};

	beforeAll(async () => {
		// Create a temporary test directory and get utility functions
		const utils = await createTestDirectory("config-mapper");
		Object.assign(testUtils, utils);

		// Create a TypeScript package.json for testing
		await testUtils.createPackageJson(createTypeScriptPackageJson());
	});

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	describe("fromConfigToInitCommandProperties", () => {
		it("should handle boolean values correctly", async () => {
			const config = {
				eslint: true,
				prettier: false,
				ci: true,
			};

			const result = ConfigMapper.fromConfigToInitCommandProperties(config);

			expect(result.eslint).toBe(true);
			expect(result.prettier).toBe(false);
			expect(result.ci).toBe(true);
		});

		it("should extract isEnabled from objects", async () => {
			const config = {
				eslint: { isEnabled: true, customOption: "value" },
				prettier: { isEnabled: false, otherOption: 123 },
			};

			const result = ConfigMapper.fromConfigToInitCommandProperties(config);

			expect(result.eslint).toBe(true);
			expect(result.prettier).toBe(false);
		});

		it("should convert other values to boolean", async () => {
			const config = {
				eslint: "yes",
				prettier: 0,
				ci: null,
				lintStaged: undefined,
				stylelint: {},
			};

			const result = ConfigMapper.fromConfigToInitCommandProperties(config);

			expect(result.eslint).toBe(true); // String converts to true
			expect(result.prettier).toBe(false); // 0 converts to false
			expect(result.ci).toBe(false); // null converts to false
			expect(result.lintStaged).toBe(false); // undefined converts to false
			expect(result.stylelint).toBe(true); // Empty object converts to true
		});
	});

	describe("fromSetupResultsToConfig", () => {
		it("should convert setup results to config", async () => {
			const setupResults = {
				eslint: {
					wasInstalled: true,
					customProperties: {
						version: "8.0.0",
						typescript: true,
					},
				},
				prettier: {
					wasInstalled: false,
					customProperties: {
						configPath: "./prettier.config.js",
					},
				},
			};

			const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

			expect(result.eslint).toEqual({
				isEnabled: true,
				version: "8.0.0",
				typescript: true,
			});

			expect(result.prettier).toEqual({
				isEnabled: false,
				configPath: "./prettier.config.js",
			});
		});

		it("should handle missing wasInstalled flag", async () => {
			const setupResults = {
				eslint: {
					// wasInstalled is missing
					customProperties: {
						version: "8.0.0",
					},
				},
			};

			const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

			expect(result.eslint).toEqual({
				isEnabled: undefined,
				version: "8.0.0",
			});
		});

		it("should handle missing customProperties", async () => {
			const setupResults = {
				eslint: {
					wasInstalled: true,
					// customProperties is missing
				},
			};

			const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

			expect(result.eslint).toEqual({
				isEnabled: true,
			});
		});

		it("should handle empty setup results", async () => {
			const setupResults = {};

			const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

			expect(result).toEqual({});
		});
	});
});
