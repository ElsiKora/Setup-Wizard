import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrettierModuleService } from "../../../../src/application/service/prettier-module.service";
import { PRETTIER_CONFIG_FILE_NAME } from "../../../../src/application/constant/prettier/config-file-name.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../../../../src/application/constant/prettier/ignore-file-name.constant";
import { PRETTIER_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/prettier/core-dependencies.constant";
import { PRETTIER_CONFIG_MESSAGES } from "../../../../src/application/constant/prettier/messages.constant";
import { PRETTIER_CONFIG_SCRIPTS } from "../../../../src/application/constant/prettier/scripts.constant";
import { PRETTIER_CONFIG_SUMMARY } from "../../../../src/application/constant/prettier/summary.constant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

describe("PrettierModuleService", () => {
	// Mocks
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
	};

	const mockFileSystemService = {
		writeFile: vi.fn(),
		readFile: vi.fn(),
		deleteFile: vi.fn(),
		isPathExists: vi.fn(),
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
	let prettierService: PrettierModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		// Create service instance with mocks
		prettierService = new PrettierModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(prettierService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await prettierService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.confirmSetup, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await prettierService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await prettierService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await prettierService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue([PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG_IGNORE_FILE_NAME]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await prettierService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue([PRETTIER_CONFIG_FILE_NAME]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await prettierService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.existingFilesAborted);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("install", () => {
		it("should install Prettier when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(prettierService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(prettierService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(prettierService as any, "setupPrettier").mockResolvedValue(undefined);

			const result = await prettierService.install();

			expect(result).toEqual({
				wasInstalled: true,
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(prettierService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(prettierService as any, "setupPrettier").mockResolvedValue(undefined);

			const result = await prettierService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should not install when handling existing setup fails", async () => {
			vi.spyOn(prettierService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(prettierService, "handleExistingSetup").mockResolvedValue(false);
			const setupSpy = vi.spyOn(prettierService as any, "setupPrettier").mockResolvedValue(undefined);

			const result = await prettierService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(prettierService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(prettierService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(prettierService as any, "setupPrettier").mockRejectedValue(new Error("Test error"));

			await expect(prettierService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("private methods", () => {
		it("setupPrettier should install dependencies, create configs and setup scripts", async () => {
			// Mock internal methods
			vi.spyOn(prettierService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(prettierService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(prettierService as any, "displaySetupSummary").mockReturnValue(undefined);

			await (prettierService as any).setupPrettier();

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(PRETTIER_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			expect(prettierService["createConfigs"]).toHaveBeenCalled();
			expect(prettierService["setupScripts"]).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalled();
			expect(prettierService["displaySetupSummary"]).toHaveBeenCalled();
		});

		it("setupPrettier should handle errors properly", async () => {
			// Mock internal methods to throw an error
			vi.spyOn(prettierService as any, "createConfigs").mockRejectedValue(new Error("Config error"));

			await expect((prettierService as any).setupPrettier()).rejects.toThrow("Config error");

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.failedSetupSpinner);
		});

		it("createConfigs should write configuration files", async () => {
			await (prettierService as any).createConfigs();

			expect(mockFileSystemService.writeFile).toHaveBeenCalledTimes(2);
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRETTIER_CONFIG_FILE_NAME, expect.any(String), "utf8");
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRETTIER_CONFIG_IGNORE_FILE_NAME, expect.any(String), "utf8");
		});

		it("setupScripts should add npm scripts for prettier", async () => {
			await (prettierService as any).setupScripts();

			expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(PRETTIER_CONFIG_SCRIPTS.format.name, PRETTIER_CONFIG_SCRIPTS.format.command);
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(PRETTIER_CONFIG_SCRIPTS.formatFix.name, PRETTIER_CONFIG_SCRIPTS.formatFix.command);
		});

		it("findExistingConfigFiles should return file paths for existing config files", async () => {
			mockFileSystemService.isPathExists
				.mockResolvedValueOnce(true) // First file exists
				.mockResolvedValueOnce(false); // Second file doesn't exist

			const result = await (prettierService as any).findExistingConfigFiles();

			expect(mockFileSystemService.isPathExists).toHaveBeenCalled();
			expect(result.length).toBeGreaterThan(0);
		});

		it("displaySetupSummary should show the proper summary information", () => {
			(prettierService as any).displaySetupSummary();

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(PRETTIER_CONFIG_MESSAGES.prettierConfigCreated));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining("npm run format"));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(PRETTIER_CONFIG_FILE_NAME));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(PRETTIER_CONFIG_IGNORE_FILE_NAME));
		});
	});
});
