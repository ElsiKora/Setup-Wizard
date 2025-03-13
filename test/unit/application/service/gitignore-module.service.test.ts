import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitignoreModuleService } from "../../../../src/application/service/gitignore-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { GITIGNORE_CONFIG } from "../../../../src/domain/constant/gitignore-config.constant";

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
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        "Do you want to generate .gitignore file for your project?", 
        true
      );
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
      expect(mockFileSystemService.isOneOfPathsExists).toHaveBeenCalledWith([".gitignore"]);
    });

    it("should ask to replace when existing gitignore file is found and user confirms", async () => {
      mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(".gitignore");
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

      const result = await gitignoreService.handleExistingSetup();

      expect(result).toBe(true);
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        "An existing .gitignore file was found (.gitignore). Would you like to replace it?"
      );
      expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith(".gitignore");
      expect(mockCliInterfaceService.success).toHaveBeenCalledWith("Deleted existing .gitignore file.");
    });

    it("should return false when user declines to replace existing gitignore", async () => {
      mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(".gitignore");
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

      const result = await gitignoreService.handleExistingSetup();

      expect(result).toBe(false);
      expect(mockCliInterfaceService.warn).toHaveBeenCalledWith("Keeping existing .gitignore file.");
    });

    it("should handle errors when deleting existing gitignore file", async () => {
      mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(".gitignore");
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
      mockFileSystemService.deleteFile.mockRejectedValueOnce(new Error("Delete error"));

      const result = await gitignoreService.handleExistingSetup();

      expect(result).toBe(false);
      expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(
        "Failed to delete existing .gitignore file", 
        expect.any(Error)
      );
    });

    it("should handle errors when checking for existing gitignore", async () => {
      mockFileSystemService.isOneOfPathsExists.mockRejectedValueOnce(new Error("Check error"));

      const result = await gitignoreService.handleExistingSetup();

      expect(result).toBe(false);
      expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(
        "Failed to check existing .gitignore setup", 
        expect.any(Error)
      );
    });
  });

  describe("generateNewGitignore", () => {
    it("should generate gitignore file successfully", async () => {
      mockFileSystemService.writeFile.mockResolvedValueOnce(undefined);

      const result = await (gitignoreService as any).generateNewGitignore();

      expect(result).toEqual({ isSuccess: true });
      expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Generating .gitignore file...");
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(".gitignore", GITIGNORE_CONFIG);
      expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(".gitignore file generated");
    });

    it("should handle errors when generating gitignore file", async () => {
      const testError = new Error("Write error");
      mockFileSystemService.writeFile.mockRejectedValueOnce(testError);

      const result = await (gitignoreService as any).generateNewGitignore();

      expect(result).toEqual({
        error: testError,
        isSuccess: false
      });
      expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(); // Called without arguments
    });
  });

  describe("displaySetupSummary", () => {
    it("should display successful setup summary", () => {
      (gitignoreService as any).displaySetupSummary(true);

      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Successfully created configuration")
      );
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("The .gitignore configuration includes:")
      );
    });

    it("should display failed setup summary", () => {
      const testError = new Error("Setup failed");
      (gitignoreService as any).displaySetupSummary(false, testError);

      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Failed configuration")
      );
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Setup failed")
      );
    });

    it("should handle unknown errors in summary", () => {
      (gitignoreService as any).displaySetupSummary(false);

      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Unknown error")
      );
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
        wasInstalled: true
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
        wasInstalled: false
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
        wasInstalled: false
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
      expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(
        "Failed to complete .gitignore installation",
        expect.any(Error)
      );
    });

    it("should handle generation failure but not throw", async () => {
      // Setup spies
      const testError = new Error("Generate failed");
      vi.spyOn(gitignoreService, "shouldInstall").mockResolvedValueOnce(true);
      vi.spyOn(gitignoreService, "handleExistingSetup").mockResolvedValueOnce(true);
      vi.spyOn(gitignoreService as any, "generateNewGitignore").mockResolvedValueOnce({ 
        isSuccess: false, 
        error: testError 
      });
      vi.spyOn(gitignoreService as any, "displaySetupSummary").mockImplementationOnce(() => {});

      // Call the method
      const result = await gitignoreService.install();

      // Check results
      expect(result).toEqual({
        wasInstalled: true
      });
      expect(gitignoreService["displaySetupSummary"]).toHaveBeenCalledWith(false, testError);
    });
  });
});