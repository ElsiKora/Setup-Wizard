import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrettierModuleService } from "../../../../src/application/service/prettier-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { PRETTIER_CONFIG_FILE_NAMES } from "../../../../src/application/constant/prettier/file-names.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../../../../src/application/constant/prettier/ignore-file-name.constant";
import { PRETTIER_CONFIG_FILE_NAME } from "../../../../src/application/constant/prettier/config-file-name.constant";
import { PRETTIER_CONFIG_MESSAGES } from "../../../../src/application/constant/prettier/messages.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";

/**
 * This test file is specifically designed to improve branch coverage
 * for the prettier-module.service.ts file.
 * It targets the uncovered branches at lines 77 and 132.
 */
describe("PrettierModuleService Branch Coverage", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();
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
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);

		// Create service instance with mocks
		prettierService = new PrettierModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

		// Mock internal services
		vi.spyOn(prettierService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("handleExistingSetup", () => {
		// This test specifically targets the branch in line 77 where shouldDelete is false
		it("should handle when user declines to delete existing files", async () => {
			// Mock finding a config file
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue([PRETTIER_CONFIG_FILE_NAME]);

			// Mock confirm to return false (user declines)
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			// Call the method
			const result = await prettierService.handleExistingSetup();

			// Check that confirm was called and false was returned
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.existingFilesAborted);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});
	});

	describe("shouldInstall", () => {
		// This test specifically targets the catch branch at line 124-127
		it("should return false and handle error when confirm throws", async () => {
			// Mock confirm to throw an error
			mockCliInterfaceService.confirm.mockImplementation(() => {
				throw new Error("Test error");
			});

			// Call the method
			const result = await prettierService.shouldInstall();

			// Check that handleError was called and false was returned
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.failedConfirmation, expect.any(Error));
			expect(result).toBe(false);
		});

		// Additional test for normal path
		it("should return true when user confirms installation", async () => {
			// Mock isModuleEnabled
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			// Mock confirm to return true
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			// Call the method
			const result = await prettierService.shouldInstall();

			// Check results
			expect(mockConfigService.isModuleEnabled).toHaveBeenCalledWith(EModule.PRETTIER);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(PRETTIER_CONFIG_MESSAGES.confirmSetup, true);
			expect(result).toBe(true);
		});
	});

	describe("findExistingConfigFiles", () => {
		// This test specifically ensures that the for loop in findExistingConfigFiles (lines 157-161)
		// is fully covered by testing both branches of the if condition inside the loop
		it("should correctly identify mixed existing and non-existing files", async () => {
			// Setup isPathExists to return different values for different files
			mockFileSystemService.isPathExists.mockImplementation(async (path) => {
				// Return true for specific files to test both branches
				return PRETTIER_CONFIG_FILE_NAMES.indexOf(path) % 2 === 0;
			});

			// Call the method directly
			const result = await (prettierService as any).findExistingConfigFiles();

			// Verify result contains only the files that "exist"
			expect(result.length).toBeGreaterThan(0);
			expect(result.length).toBeLessThan(PRETTIER_CONFIG_FILE_NAMES.length);

			// Verify isPathExists was called for each config file
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(PRETTIER_CONFIG_FILE_NAMES.length);

			// Verify each call to isPathExists
			for (const file of PRETTIER_CONFIG_FILE_NAMES) {
				expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith(file);
			}
		});
	});
});
