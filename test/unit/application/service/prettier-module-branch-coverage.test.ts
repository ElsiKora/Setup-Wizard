import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrettierModuleService } from "../../../../src/application/service/prettier-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { PRETTIER_CONFIG } from "../../../../src/application/constant/prettier/config.constant";
import { PRETTIER_CONFIG_FILE_NAME } from "../../../../src/application/constant/prettier/config-file-name.constant";
import { PRETTIER_CONFIG_IGNORE_FILE_NAME } from "../../../../src/application/constant/prettier/ignore-file-name.constant";
import { PRETTIER_CONFIG_IGNORE_PATHS } from "../../../../src/application/constant/prettier/ignore-paths.constant";

/**
 * This test file is specifically designed to improve branch coverage
 * for the prettier-module.service.ts file.
 * It targets the uncovered branches at lines 77 and 132.
 */
describe("PrettierModuleService Additional Branch Coverage", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();
	const mockPackageJsonService = {
		installPackages: vi.fn().mockResolvedValue(undefined),
		addScript: vi.fn().mockResolvedValue(undefined),
	};

	// Service instance
	let prettierService: PrettierModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.writeFile.mockResolvedValue(undefined);
		mockFileSystemService.deleteFile.mockResolvedValue(undefined);

		// Create service instance with mocks
		prettierService = new PrettierModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

		// Mock internal services
		vi.spyOn(prettierService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("handleExistingSetup", () => {
		// This test specifically targets the branch in line 77 where shouldDelete is true
		it("should delete existing files when user confirms", async () => {
			// Mock finding multiple config files
			const existingFiles = [PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG_IGNORE_FILE_NAME];
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue(existingFiles);

			// Mock confirm to return true (user confirms deletion)
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			// Call the method
			const result = await prettierService.handleExistingSetup();

			// Check that files were deleted and true was returned
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(existingFiles.length);
			for (const file of existingFiles) {
				expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith(file);
			}
			expect(result).toBe(true);
		});
	});

	describe("createConfigs", () => {
		// This test specifically targets line 132-138
		it("should create both config and ignore files", async () => {
			// Call the method directly
			await (prettierService as any).createConfigs();

			// Verify both file writing calls were made with correct content
			expect(mockFileSystemService.writeFile).toHaveBeenCalledTimes(2);

			// Check config file was written
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");

			// Check ignore file was written
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRETTIER_CONFIG_IGNORE_FILE_NAME, PRETTIER_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
		});

		it("should handle errors when writing files", async () => {
			// Mock writeFile to throw an error on first call
			mockFileSystemService.writeFile.mockRejectedValueOnce(new Error("Test error writing config")).mockResolvedValueOnce(undefined);

			// Verify error propagation
			await expect((prettierService as any).createConfigs()).rejects.toThrow("Test error writing config");

			// Verify first call was made
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");

			// Verify second call was not made
			expect(mockFileSystemService.writeFile).toHaveBeenCalledTimes(1);
		});
	});

	describe("handleExistingSetup edge case", () => {
		// This test covers the potential branch where existingFiles.length equals exactly 0
		it("should handle case with no existing files", async () => {
			// Mock finding no config files
			vi.spyOn(prettierService as any, "findExistingConfigFiles").mockResolvedValue([]);

			// Call the method
			const result = await prettierService.handleExistingSetup();

			// Verify we skip the confirmation and file deletion
			expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});
});
