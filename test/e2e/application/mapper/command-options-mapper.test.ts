import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import { CommandOptionsMapper } from "../../../../bin/application/mapper/command-options.mapper.js";
import { COMMAND_FLAG_CONFIG } from "../../../../bin/application/constant/command-flag-config.constant.js";
import { EModule } from "../../../../bin/domain/enum/module.enum.js";

describe("Command Options Mapper E2E test", () => {
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
		const utils = await createTestDirectory("command-options-mapper");
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

	it("should correctly map command flags to module enable status", async () => {
		// Test with all flags set to true
		const allEnabledFlags = {};

		// Set all flags to true
		for (const [module, config] of Object.entries(COMMAND_FLAG_CONFIG)) {
			allEnabledFlags[config.fullFlag] = true;
		}

		const allEnabledResult = CommandOptionsMapper.fromFlagToModule(allEnabledFlags);

		// Verify all modules are enabled
		for (const module of Object.values(EModule)) {
			expect(allEnabledResult[module]).toBe(true);
		}
	});

	it("should correctly map when no flags are set", async () => {
		// Test with empty flags object
		const emptyFlags = {};
		const emptyResult = CommandOptionsMapper.fromFlagToModule(emptyFlags);

		// Verify all modules are disabled
		for (const module of Object.values(EModule)) {
			expect(emptyResult[module]).toBe(false);
		}
	});

	it("should correctly map when some flags are set", async () => {
		// Test with only some flags set
		const someFlags = {
			withEslint: true,
			withPrettier: true,
		};

		const result = CommandOptionsMapper.fromFlagToModule(someFlags);

		// Verify expected modules are enabled
		expect(result[EModule.ESLINT]).toBe(true);
		expect(result[EModule.PRETTIER]).toBe(true);

		// Verify other modules are disabled
		expect(result[EModule.CI]).toBe(false);
		expect(result[EModule.COMMITLINT]).toBe(false);
		expect(result[EModule.GITIGNORE]).toBe(false);
		expect(result[EModule.IDE]).toBe(false);
		expect(result[EModule.LICENSE]).toBe(false);
		expect(result[EModule.LINT_STAGED]).toBe(false);
		expect(result[EModule.SEMANTIC_RELEASE]).toBe(false);
		expect(result[EModule.STYLELINT]).toBe(false);
	});
});
