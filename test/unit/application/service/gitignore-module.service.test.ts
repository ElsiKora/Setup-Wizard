import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitignoreModuleService } from "../../../../src/application/service/gitignore-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { GITIGNORE_CONFIG } from "../../../../src/application/constant/gitignore/config.constant";
import { GITIGNORE_CONFIG_FILE_NAME } from "../../../../src/application/constant/gitignore/file-name.constant";
import { GITIGNORE_CONFIG_FILE_NAMES } from "../../../../src/application/constant/gitignore/file-names.constant";
import { GITIGNORE_CONFIG_MESSAGES } from "../../../../src/application/constant/gitignore/messages.constant";
import { GITIGNORE_CONFIG_SUMMARY } from "../../../../src/application/constant/gitignore/summary.constant";

describe("GitignoreModuleService", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();

	// Service instance
	let gitignoreService: GitignoreModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock implementations
		mockCliInterfaceService.confirm.mockReset();
		mockCliInterfaceService.startSpinner.mockReset();
		mockCliInterfaceService.stopSpinner.mockReset();
		mockCliInterfaceService.note.mockReset();
		mockCliInterfaceService.warn.mockReset();
		mockCliInterfaceService.success.mockReset();
		mockConfigService.isModuleEnabled.mockReset();
		mockFileSystemService.isOneOfPathsExists.mockReset();
		mockFileSystemService.writeFile.mockReset();
		mockFileSystemService.deleteFile.mockReset();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isOneOfPathsExists.mockResolvedValue(undefined);

		// Create service instance with mocks
		gitignoreService = new GitignoreModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await gitignoreService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.confirmGenerate, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await gitignoreService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await gitignoreService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing gitignore file is found", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(undefined);

			const result = await gitignoreService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockFileSystemService.isOneOfPathsExists).toHaveBeenCalledWith(GITIGNORE_CONFIG_FILE_NAMES);
		});

		it("should ask to replace when existing gitignore file is found and user confirms", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(GITIGNORE_CONFIG_FILE_NAME);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await gitignoreService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.existingFileFound(GITIGNORE_CONFIG_FILE_NAME));
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith(GITIGNORE_CONFIG_FILE_NAME);
			expect(mockCliInterfaceService.success).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.deletedExisting);
		});

		it("should return false when user declines to replace existing gitignore", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(GITIGNORE_CONFIG_FILE_NAME);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await gitignoreService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.keepingExisting);
		});

		it("should handle errors when deleting existing gitignore file", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(GITIGNORE_CONFIG_FILE_NAME);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockFileSystemService.deleteFile.mockRejectedValueOnce(new Error("Delete error"));

			const result = await gitignoreService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.failedDeleteExisting, expect.any(Error));
		});

		it("should handle errors when checking for existing gitignore", async () => {
			mockFileSystemService.isOneOfPathsExists.mockRejectedValueOnce(new Error("Check error"));

			const result = await gitignoreService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.failedCheckExisting, expect.any(Error));
		});
	});

	describe("generateNewGitignore", () => {
		it("should generate gitignore file successfully", async () => {
			mockFileSystemService.writeFile.mockResolvedValueOnce(undefined);

			const result = await (gitignoreService as any).generateNewGitignore();

			expect(result).toEqual({ isSuccess: true });
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.generatingFile);
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(GITIGNORE_CONFIG_FILE_NAME, GITIGNORE_CONFIG);
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.fileGenerated);
		});

		it("should handle errors when generating gitignore file", async () => {
			const testError = new Error("Write error");
			mockFileSystemService.writeFile.mockRejectedValueOnce(testError);

			const result = await (gitignoreService as any).generateNewGitignore();

			expect(result).toEqual({
				error: testError,
				isSuccess: false,
			});
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(); // Called without arguments
		});
	});

	describe("displaySetupSummary", () => {
		it("should display successful setup summary", () => {
			(gitignoreService as any).displaySetupSummary(true);

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(GITIGNORE_CONFIG_SUMMARY.title, expect.stringContaining(GITIGNORE_CONFIG_SUMMARY.successConfig));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(GITIGNORE_CONFIG_SUMMARY.title, expect.stringContaining("The .gitignore configuration includes:"));
		});

		it("should display failed setup summary", () => {
			const testError = new Error("Setup failed");
			(gitignoreService as any).displaySetupSummary(false, testError);

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(GITIGNORE_CONFIG_SUMMARY.title, expect.stringContaining(GITIGNORE_CONFIG_SUMMARY.failedConfig));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(GITIGNORE_CONFIG_SUMMARY.title, expect.stringContaining("Setup failed"));
		});

		it("should handle unknown errors in summary", () => {
			(gitignoreService as any).displaySetupSummary(false);

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(GITIGNORE_CONFIG_SUMMARY.title, expect.stringContaining("Unknown error"));
		});
	});

	describe("install", () => {
		it("should complete successful installation", async () => {
			// Setup spies
			vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService as any, "generateNewGitignore").mockResolvedValueOnce({ isSuccess: true });
			vi.spyOn(gitignoreService as any, "displaySetupSummary").mockImplementationOnce(() => {});

			// Call the method
			const result = await gitignoreService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: true,
			});
			expect(gitignoreService.shouldInstall).toHaveBeenCalled();
			expect(gitignoreService.handleExistingSetup).toHaveBeenCalled();
			expect(gitignoreService["generateNewGitignore"]).toHaveBeenCalled();
			expect(gitignoreService["displaySetupSummary"]).toHaveBeenCalledWith(true, undefined);
		});

		it("should not install when user declines installation", async () => {
			// Setup spies
			vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(false);
			const generateNewGitignoreSpy = vi.spyOn(gitignoreService as any, "generateNewGitignore");

			// Call the method
			const result = await gitignoreService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(generateNewGitignoreSpy).not.toHaveBeenCalled();
		});

		it("should not install when existing setup cannot be handled", async () => {
			// Setup spies
			vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService, "handleExistingSetup").mockResolvedValueOnce(false);
			const generateNewGitignoreSpy = vi.spyOn(gitignoreService as any, "generateNewGitignore");

			// Call the method
			const result = await gitignoreService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(generateNewGitignoreSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			// Setup spies
			vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService as any, "generateNewGitignore").mockRejectedValueOnce(new Error("Generate error"));

			// Call and expect rejection
			await expect(gitignoreService.install()).rejects.toThrow("Generate error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(GITIGNORE_CONFIG_MESSAGES.failedComplete, expect.any(Error));
		});

		it("should handle generation failure but not throw", async () => {
			// Setup spies
			const testError = new Error("Generate failed");
			vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(gitignoreService as any, "generateNewGitignore").mockResolvedValueOnce({
				isSuccess: false,
				error: testError,
			});
			vi.spyOn(gitignoreService as any, "displaySetupSummary").mockImplementationOnce(() => {});

			// Call the method
			const result = await gitignoreService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: true,
			});
			expect(gitignoreService["displaySetupSummary"]).toHaveBeenCalledWith(false, testError);
		});
	});
});
