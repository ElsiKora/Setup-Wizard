import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import { ModuleServiceMapper } from "bin/infrastructure/mapper/module-service.mapper.js";
import { EModule } from "bin/domain/enum/module.enum.js";
import { CiModuleService } from "bin/application/service/ci-module.service.js";
import { EslintModuleService } from "bin/application/service/eslint-module.service.js";
import { PrettierModuleService } from "bin/application/service/prettier-module.service.js";
import { LicenseModuleService } from "bin/application/service/license-module.service.js";
import { StylelintModuleService } from "bin/application/service/stylelint-module.service.js";
import { GitignoreModuleService } from "bin/application/service/gitignore-module.service.js";
import { CommitlintModuleService } from "bin/application/service/commitlint-module.service.js";
import { IdeModuleService } from "bin/application/service/ide-module.service.js";
import { LintStagedModuleService } from "bin/application/service/lint-staged-module.service.js";
import { SemanticReleaseModuleService } from "bin/application/service/semantic-release-module.service.js";

// Mock the CosmicConfigService to avoid actual dependency
vi.mock("bin/infrastructure/service/cosmi-config-config.service.js", () => {
	return {
		CosmicConfigService: vi.fn().mockImplementation(() => ({
			getConfig: vi.fn(),
			saveConfig: vi.fn(),
		})),
	};
});

describe("Module Service Mapper E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async () => ({ stdout: "", stderr: "", success: false }),
		fileExists: async () => false,
		readFile: async () => "",
		createPackageJson: async () => {},
		cleanup: async () => {},
	};

	// Mock CLI interface service and file system service
	const mockCliInterfaceService = {
		intro: vi.fn(),
		outro: vi.fn(),
		text: vi.fn(),
		confirm: vi.fn(),
		select: vi.fn(),
		multiselect: vi.fn(),
		spinner: vi.fn(),
		isCancel: vi.fn(),
		clear: vi.fn(),
	};

	const mockFileSystemService = {
		readFile: vi.fn(),
		writeFile: vi.fn(),
		exists: vi.fn(),
		createDirectory: vi.fn(),
	};

	let moduleServiceMapper;

	beforeAll(async () => {
		// Create a temporary test directory and get utility functions
		const utils = await createTestDirectory("module-service-mapper");
		Object.assign(testUtils, utils);

		// Create a TypeScript package.json for testing
		await testUtils.createPackageJson(createTypeScriptPackageJson());

		// Initialize module service mapper with mock services
		moduleServiceMapper = new ModuleServiceMapper(mockCliInterfaceService, mockFileSystemService);
	});

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	it("should return CI module service for CI module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.CI);
		expect(service).toBeInstanceOf(CiModuleService);
	});

	it("should return ESLint module service for ESLint module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.ESLINT);
		expect(service).toBeInstanceOf(EslintModuleService);
	});

	it("should return Prettier module service for Prettier module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.PRETTIER);
		expect(service).toBeInstanceOf(PrettierModuleService);
	});

	it("should return License module service for License module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.LICENSE);
		expect(service).toBeInstanceOf(LicenseModuleService);
	});

	it("should return Stylelint module service for Stylelint module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.STYLELINT);
		expect(service).toBeInstanceOf(StylelintModuleService);
	});

	it("should return Gitignore module service for Gitignore module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.GITIGNORE);
		expect(service).toBeInstanceOf(GitignoreModuleService);
	});

	it("should return Commitlint module service for Commitlint module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.COMMITLINT);
		expect(service).toBeInstanceOf(CommitlintModuleService);
	});

	it("should return IDE module service for IDE module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.IDE);
		expect(service).toBeInstanceOf(IdeModuleService);
	});

	it("should return Lint-Staged module service for Lint-Staged module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.LINT_STAGED);
		expect(service).toBeInstanceOf(LintStagedModuleService);
	});

	it("should return Semantic Release module service for Semantic Release module type", () => {
		const service = moduleServiceMapper.getModuleService(EModule.SEMANTIC_RELEASE);
		expect(service).toBeInstanceOf(SemanticReleaseModuleService);
	});

	it("should throw an error for unsupported module types", () => {
		expect(() => {
			moduleServiceMapper.getModuleService("invalid-module-type");
		}).toThrow(/Module .* is not supported/);
	});

	it("should initialize CONFIG_SERVICE in constructor", () => {
		// Check that the CONFIG_SERVICE was initialized in the constructor
		expect(moduleServiceMapper.CONFIG_SERVICE).toBeDefined();
	});
});
