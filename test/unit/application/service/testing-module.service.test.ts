import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestingModuleService } from "../../../../src/application/service/testing-module.service";
import { TESTING_CONFIG_MESSAGES } from "../../../../src/application/constant/testing/messages.constant";
import { TESTING_CONFIG_CORE_DEPENDENCIES, TESTING_CONFIG_OPTIONAL_DEPENDENCIES } from "../../../../src/application/constant/testing/core-dependencies.constant";
import { TESTING_CONFIG_SCRIPTS } from "../../../../src/application/constant/testing/scripts.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

describe("TestingModuleService", () => {
	// Mocks
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
		text: vi.fn(),
		select: vi.fn(),
	};

	const mockFileSystemService = {
		writeFile: vi.fn(),
		deleteFile: vi.fn(),
		isPathExists: vi.fn(),
		createDirectory: vi.fn(),
	};

	const mockConfigService = {
		getModuleConfig: vi.fn(),
		isModuleEnabled: vi.fn(),
	};

	// Mock PackageJsonService
	const mockPackageJsonService = {
		installPackages: vi.fn(),
		addScript: vi.fn(),
	};

	// Service instance
	let testingService: TestingModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		// Create service instance with mocks
		testingService = new TestingModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(testingService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await testingService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmSetup, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await testingService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await testingService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(testingService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await testingService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(testingService as any, "findExistingConfigFiles").mockResolvedValue(["vitest.unit.config.js", "vitest.e2e.config.js"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await testingService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(testingService as any, "findExistingConfigFiles").mockResolvedValue(["vitest.config.js"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await testingService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.existingFilesAborted);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("install", () => {
		it("should install testing framework when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(testingService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(testingService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(testingService as any, "setupTesting").mockResolvedValue({
				framework: "vitest",
				isTypeScript: "true",
				isCoverageEnabled: "true",
				isEndToEndEnabled: "false",
			});

			const result = await testingService.install();

			expect(result).toEqual({
				wasInstalled: true,
				customProperties: {
					framework: "vitest",
					isTypeScript: "true",
					isCoverageEnabled: "true",
					isEndToEndEnabled: "false",
				},
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(testingService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(testingService as any, "setupTesting").mockResolvedValue({});

			const result = await testingService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(testingService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(testingService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(testingService as any, "setupTesting").mockRejectedValue(new Error("Test error"));

			await expect(testingService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("private methods", () => {
		describe("isTypeScriptProject", () => {
			it("should return true when tsconfig.json exists", async () => {
				mockFileSystemService.isPathExists.mockResolvedValueOnce(true);

				const result = await (testingService as any).isTypeScriptProject();

				expect(result).toBe(true);
				expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith("tsconfig.json");
			});

			it("should return false when tsconfig.json does not exist", async () => {
				mockFileSystemService.isPathExists.mockResolvedValueOnce(false);

				const result = await (testingService as any).isTypeScriptProject();

				expect(result).toBe(false);
			});
		});

		describe("isCoverageEnabled", () => {
			it("should prompt for coverage with default true", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (testingService as any).isCoverageEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmCoverage, true);
			});

			it("should use saved config value as default", async () => {
				(testingService as any).config = { isCoverageEnabled: false };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (testingService as any).isCoverageEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmCoverage, false);
			});
		});

		describe("isEndToEndEnabled", () => {
			it("should prompt for e2e with default false", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				const result = await (testingService as any).isEndToEndEnabled();

				expect(result).toBe(false);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmE2e, false);
			});
		});

		describe("createTestDirectories", () => {
			it("should not create any directories when both unit and e2e are disabled", async () => {
				await testingService["createTestDirectories"](false, false);

				expect(mockFileSystemService.createDirectory).not.toHaveBeenCalled();
			});

			it("should create test/unit directory for unit tests only", async () => {
				await testingService["createTestDirectories"](true, false);

				expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith("test/unit", { isRecursive: true });
				expect(mockFileSystemService.createDirectory).toHaveBeenCalledTimes(1);
			});

			it("should create test/e2e directory for e2e tests only", async () => {
				await testingService["createTestDirectories"](false, true);

				expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith("test/e2e", { isRecursive: true });
				expect(mockFileSystemService.createDirectory).toHaveBeenCalledTimes(1);
			});

			it("should create both test/unit and test/e2e directories when both are enabled", async () => {
				await testingService["createTestDirectories"](true, true);

				expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith("test/unit", { isRecursive: true });
				expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith("test/e2e", { isRecursive: true });
				expect(mockFileSystemService.createDirectory).toHaveBeenCalledTimes(2);
			});
		});

		describe("isUnitEnabled", () => {
			it("should prompt for unit tests with default true", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (testingService as any).isUnitEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmUnit, true);
			});

			it("should use saved config value as default", async () => {
				(testingService as any).config = { isUnitEnabled: false };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (testingService as any).isUnitEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.confirmUnit, false);
			});
		});

		describe("selectTestingFramework", () => {
			it("should show all available testing frameworks", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				mockCliInterfaceService.select = vi.fn().mockResolvedValue(ETestingFramework.VITEST);

				await (testingService as any).selectTestingFramework();

				expect(mockCliInterfaceService.select).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.selectFrameworkPrompt, expect.arrayContaining([expect.objectContaining({ value: ETestingFramework.VITEST }), expect.objectContaining({ value: ETestingFramework.JEST }), expect.objectContaining({ value: ETestingFramework.MOCHA }), expect.objectContaining({ value: ETestingFramework.JASMINE })]), ETestingFramework.VITEST);
			});
		});

		describe("setupScripts", () => {
			it("should not add any scripts when both unit and e2e are disabled", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				await (testingService as any).setupScripts(ETestingFramework.VITEST, false, false, false);

				expect(mockPackageJsonService.addScript).not.toHaveBeenCalled();
			});

			it("should add basic unit test scripts when only unit tests are enabled", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				await (testingService as any).setupScripts(ETestingFramework.VITEST, true, false, false);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:unit", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:unit:watch", expect.any(String));
			});

			it("should add coverage script when unit tests and coverage are enabled", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				await (testingService as any).setupScripts(ETestingFramework.VITEST, true, true, false);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(3);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:unit:coverage", expect.any(String));
			});

			it("should add e2e scripts when only e2e is enabled", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				await (testingService as any).setupScripts(ETestingFramework.VITEST, false, false, true);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:e2e", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:e2e:watch", expect.any(String));
			});

			it("should add all scripts including test:all when both unit and e2e are enabled", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				await (testingService as any).setupScripts(ETestingFramework.VITEST, true, false, true);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(5);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:unit", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:unit:watch", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:e2e", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:e2e:watch", expect.any(String));
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("test:all", expect.any(String));
			});
		});

		describe("findExistingConfigFiles", () => {
			it("should return file paths for existing config files", async () => {
				// Mock for all framework config checks
				mockFileSystemService.isPathExists
					.mockResolvedValueOnce(true) // vitest.unit.config.js
					.mockResolvedValueOnce(false) // vitest.e2e.config.js
					.mockResolvedValueOnce(false) // jest.config.js
					.mockResolvedValueOnce(false) // jest.e2e.config.js
					.mockResolvedValueOnce(false) // .mocharc.json
					.mockResolvedValueOnce(false) // .mocharc.e2e.json
					.mockResolvedValueOnce(true) // jasmine.json
					.mockResolvedValueOnce(false) // jasmine.e2e.json
					.mockResolvedValueOnce(true) // vitest.config.js
					.mockResolvedValueOnce(false) // vitest.config.ts
					.mockResolvedValueOnce(false) // vite.config.js
					.mockResolvedValueOnce(false); // vite.config.ts

				const result = await (testingService as any).findExistingConfigFiles();

				expect(result).toContain("vitest.unit.config.js");
				expect(result).toContain("jasmine.json");
				expect(result).toContain("vitest.config.js");
				expect(result).toHaveLength(3);
			});

			it("should return empty array when no config files exist", async () => {
				mockFileSystemService.isPathExists.mockResolvedValue(false);

				const result = await (testingService as any).findExistingConfigFiles();

				expect(result).toEqual([]);
			});
		});

		describe("setupTesting", () => {
			beforeEach(() => {
				vi.spyOn(testingService as any, "selectTestingFramework").mockResolvedValue("vitest");
				vi.spyOn(testingService as any, "isTypeScriptProject").mockResolvedValue(false);
				vi.spyOn(testingService as any, "isUnitEnabled").mockResolvedValue(true);
				vi.spyOn(testingService as any, "isCoverageEnabled").mockResolvedValue(true);
				vi.spyOn(testingService as any, "isEndToEndEnabled").mockResolvedValue(false);
				vi.spyOn(testingService as any, "createTestDirectories").mockResolvedValue(undefined);
				vi.spyOn(testingService as any, "createUnitConfig").mockResolvedValue(undefined);
				vi.spyOn(testingService as any, "createEndToEndConfig").mockResolvedValue(undefined);
				vi.spyOn(testingService as any, "setupScripts").mockResolvedValue(undefined);
				vi.spyOn(testingService as any, "displaySetupSummary").mockReturnValue(undefined);
			});

			it("should set up testing configuration successfully", async () => {
				const result = await (testingService as any).setupTesting();

				expect(result).toEqual({
					framework: "vitest",
					isTypeScript: false,
					isUnitEnabled: true,
					isCoverageEnabled: true,
					isEndToEndEnabled: false,
				});

				expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.settingUpSpinner);
				expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith([...TESTING_CONFIG_CORE_DEPENDENCIES], "latest", EPackageJsonDependencyType.DEV);
				expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith([TESTING_CONFIG_OPTIONAL_DEPENDENCIES.coverage], "latest", EPackageJsonDependencyType.DEV);
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				expect(testingService["createUnitConfig"]).toHaveBeenCalledWith(ETestingFramework.VITEST, false, true);
				expect(testingService["setupScripts"]).toHaveBeenCalledWith(ETestingFramework.VITEST, true, true, false);
				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.setupCompleteSpinner);
			});

			it("should handle TypeScript projects", async () => {
				vi.spyOn(testingService as any, "isTypeScriptProject").mockResolvedValue(true);

				await (testingService as any).setupTesting();

				expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith([TESTING_CONFIG_OPTIONAL_DEPENDENCIES.coverage, TESTING_CONFIG_OPTIONAL_DEPENDENCIES.typescript], "latest", EPackageJsonDependencyType.DEV);
			});

			it("should handle unit and e2e setup", async () => {
				vi.spyOn(testingService as any, "isEndToEndEnabled").mockResolvedValue(true);

				await (testingService as any).setupTesting();

				expect(testingService["createTestDirectories"]).toHaveBeenCalledWith(true, true);
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");
				expect(testingService["createUnitConfig"]).toHaveBeenCalledWith(ETestingFramework.VITEST, false, true);
				expect(testingService["createEndToEndConfig"]).toHaveBeenCalledWith(ETestingFramework.VITEST, false, true);
				expect(testingService["setupScripts"]).toHaveBeenCalledWith(ETestingFramework.VITEST, true, true, true);
			});

			it("should not ask about coverage when no test types are enabled", async () => {
				vi.spyOn(testingService as any, "isUnitEnabled").mockResolvedValue(false);
				vi.spyOn(testingService as any, "isEndToEndEnabled").mockResolvedValue(false);
				const coverageSpy = vi.spyOn(testingService as any, "isCoverageEnabled");

				await (testingService as any).setupTesting();

				expect(coverageSpy).not.toHaveBeenCalled();
			});

			it("should handle errors during setup", async () => {
				vi.spyOn(testingService as any, "createUnitConfig").mockRejectedValue(new Error("Config error"));

				await expect((testingService as any).setupTesting()).rejects.toThrow("Config error");

				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.failedSetupSpinner);
			});
		});

		describe("displaySetupSummary", () => {
			it("should display summary for unit tests only", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");

				(testingService as any).displaySetupSummary(ETestingFramework.VITEST, true, false, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TESTING_CONFIG_MESSAGES.unitEnabled));
			});

			it("should display summary for e2e tests only", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");

				(testingService as any).displaySetupSummary(ETestingFramework.VITEST, false, false, true);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TESTING_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TESTING_CONFIG_MESSAGES.e2eEnabled));
			});

			it("should display summary for both unit and e2e tests with coverage", async () => {
				const { ETestingFramework } = await import("../../../../src/domain/enum/testing-framework.enum");

				(testingService as any).displaySetupSummary(ETestingFramework.VITEST, true, true, true);

				const noteCall = mockCliInterfaceService.note.mock.calls[0];
				const summary = noteCall[1];

				expect(noteCall[0]).toBe(TESTING_CONFIG_MESSAGES.setupCompleteTitle);
				expect(summary).toContain(TESTING_CONFIG_MESSAGES.unitEnabled);
				expect(summary).toContain(TESTING_CONFIG_MESSAGES.e2eEnabled);
				expect(summary).toContain(TESTING_CONFIG_MESSAGES.coverageEnabled);
				expect(summary).toContain(TESTING_CONFIG_MESSAGES.testAllDescription);
			});
		});
	});
});
