import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import * as fs from "fs/promises";
import * as path from "path";
import { COMMAND_FLAG_CONFIG } from "bin/application/constant/command-flag-config.constant.js";
import { EModule } from "bin/domain/enum/module.enum.js";

describe("Command Flag Config Constant E2E test", () => {
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
		const utils = await createTestDirectory("command-flag-config");
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

	it("should have correct flag configuration for each module", async () => {
		// Verify the configuration for each module type
		expect(COMMAND_FLAG_CONFIG[EModule.CI]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.CI].fullFlag).toBe("withCI");
		expect(COMMAND_FLAG_CONFIG[EModule.CI].shortFlag).toBe("i");
		expect(COMMAND_FLAG_CONFIG[EModule.CI].description).toBe("Add GitHub CI configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.COMMITLINT]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.COMMITLINT].fullFlag).toBe("withCommitlint");
		expect(COMMAND_FLAG_CONFIG[EModule.COMMITLINT].shortFlag).toBe("c");
		expect(COMMAND_FLAG_CONFIG[EModule.COMMITLINT].description).toBe("Add commitlint configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.ESLINT]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.ESLINT].fullFlag).toBe("withEslint");
		expect(COMMAND_FLAG_CONFIG[EModule.ESLINT].shortFlag).toBe("e");
		expect(COMMAND_FLAG_CONFIG[EModule.ESLINT].description).toBe("Add ESLint configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.GITIGNORE]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.GITIGNORE].fullFlag).toBe("withGitignore");
		expect(COMMAND_FLAG_CONFIG[EModule.GITIGNORE].shortFlag).toBe("g");
		expect(COMMAND_FLAG_CONFIG[EModule.GITIGNORE].description).toBe("Add .gitignore file");

		expect(COMMAND_FLAG_CONFIG[EModule.IDE]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.IDE].fullFlag).toBe("withIde");
		expect(COMMAND_FLAG_CONFIG[EModule.IDE].shortFlag).toBe("d");
		expect(COMMAND_FLAG_CONFIG[EModule.IDE].description).toBe("Add IDE configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.LICENSE]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.LICENSE].fullFlag).toBe("withLicense");
		expect(COMMAND_FLAG_CONFIG[EModule.LICENSE].shortFlag).toBe("l");
		expect(COMMAND_FLAG_CONFIG[EModule.LICENSE].description).toBe("Add LICENSE file");

		expect(COMMAND_FLAG_CONFIG[EModule.LINT_STAGED]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.LINT_STAGED].fullFlag).toBe("withLintStaged");
		expect(COMMAND_FLAG_CONFIG[EModule.LINT_STAGED].shortFlag).toBe("t");
		expect(COMMAND_FLAG_CONFIG[EModule.LINT_STAGED].description).toBe("Add lint-staged configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.PRETTIER]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.PRETTIER].fullFlag).toBe("withPrettier");
		expect(COMMAND_FLAG_CONFIG[EModule.PRETTIER].shortFlag).toBe("p");
		expect(COMMAND_FLAG_CONFIG[EModule.PRETTIER].description).toBe("Add Prettier configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.PRLINT]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.PRLINT].fullFlag).toBe("withPrlint");
		expect(COMMAND_FLAG_CONFIG[EModule.PRLINT].shortFlag).toBe("n");
		expect(COMMAND_FLAG_CONFIG[EModule.PRLINT].description).toBe("Add PRLint configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.SEMANTIC_RELEASE]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.SEMANTIC_RELEASE].fullFlag).toBe("withSemanticRelease");
		expect(COMMAND_FLAG_CONFIG[EModule.SEMANTIC_RELEASE].shortFlag).toBe("r");
		expect(COMMAND_FLAG_CONFIG[EModule.SEMANTIC_RELEASE].description).toBe("Add semantic-release configuration");

		expect(COMMAND_FLAG_CONFIG[EModule.STYLELINT]).toBeDefined();
		expect(COMMAND_FLAG_CONFIG[EModule.STYLELINT].fullFlag).toBe("withStylelint");
		expect(COMMAND_FLAG_CONFIG[EModule.STYLELINT].shortFlag).toBe("s");
		expect(COMMAND_FLAG_CONFIG[EModule.STYLELINT].description).toBe("Add Stylelint configuration");
	});

	it("should verify all modules have unique flag definitions", async () => {
		// Extract all full and short flags
		const fullFlags = Object.values(COMMAND_FLAG_CONFIG).map((config) => config.fullFlag);
		const shortFlags = Object.values(COMMAND_FLAG_CONFIG).map((config) => config.shortFlag);

		// Check for duplicates in full flags
		const fullFlagSet = new Set(fullFlags);
		expect(fullFlagSet.size).toBe(fullFlags.length);

		// Check for duplicates in short flags
		const shortFlagSet = new Set(shortFlags);
		expect(shortFlagSet.size).toBe(shortFlags.length);
	});

	it("should verify all module types are covered in the config", async () => {
		// Get all the module enum values
		const moduleValues = Object.values(EModule);

		// Ensure all modules have a configuration entry
		for (const moduleValue of moduleValues) {
			expect(COMMAND_FLAG_CONFIG[moduleValue]).toBeDefined();
			expect(COMMAND_FLAG_CONFIG[moduleValue].fullFlag).toBeDefined();
			expect(COMMAND_FLAG_CONFIG[moduleValue].shortFlag).toBeDefined();
			expect(COMMAND_FLAG_CONFIG[moduleValue].description).toBeDefined();
		}
	});
});
