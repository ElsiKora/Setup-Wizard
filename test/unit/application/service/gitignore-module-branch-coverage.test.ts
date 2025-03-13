import { describe, it, expect, vi, beforeEach } from "vitest";
import { GitignoreModuleService } from "../../../../src/application/service/gitignore-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EModule } from "../../../../src/domain/enum/module.enum";

/**
 * This test suite specifically targets the branch coverage in gitignore-module.service.ts,
 * particularly on lines 77 and 132.
 */
describe("GitignoreModuleService Branch Coverage", () => {
  // Mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();

  // Service instance
  let gitignoreService: GitignoreModuleService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize with mocks
    gitignoreService = new GitignoreModuleService(
      mockCliInterfaceService,
      mockFileSystemService,
      mockConfigService
    );

    // Default mock implementations
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockCliInterfaceService.note.mockReturnValue();
    mockConfigService.isModuleEnabled.mockResolvedValue(true);
    mockFileSystemService.isOneOfPathsExists.mockResolvedValue(undefined);
    mockFileSystemService.writeFile.mockResolvedValue();
  });

  describe("install", () => {
    it("should handle all branches in the install method", async () => {
      // Test the successful path
      const result = await gitignoreService.install();
      expect(result).toEqual({ wasInstalled: true });

      // Mock shouldInstall to return false (line 77 branch)
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false);
      
      const resultNoInstall = await gitignoreService.install();
      expect(resultNoInstall).toEqual({ wasInstalled: false });

      // Mock handleExistingSetup to return false
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true); // shouldInstall true
      mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(".gitignore");
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false); // don't replace existing
      
      const resultExistingKept = await gitignoreService.install();
      expect(resultExistingKept).toEqual({ wasInstalled: false });
    });
  });

  describe("displaySetupSummary", () => {
    it("should handle the success branch in displaySetupSummary", () => {
      // Call with success=true
      (gitignoreService as any).displaySetupSummary(true);
      
      // Verify success message
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Successfully created configuration:")
      );
      
      // Verify configuration details are included (line 132)
      const noteText = mockCliInterfaceService.note.mock.calls[0][1];
      expect(noteText).toContain("The .gitignore configuration includes:");
      expect(noteText).toContain("- Build outputs and dependencies");
    });
    
    it("should handle the failure branch in displaySetupSummary", () => {
      // Mock error
      const error = new Error("Test error");
      
      // Call with success=false and error
      (gitignoreService as any).displaySetupSummary(false, error);
      
      // Verify failure message
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Gitignore Setup Summary",
        expect.stringContaining("Failed configuration:")
      );
      
      // Verify error message is included
      const noteText = mockCliInterfaceService.note.mock.calls[0][1];
      expect(noteText).toContain("Test error");
      
      // Verify configuration details are still included (line 132)
      expect(noteText).toContain("The .gitignore configuration includes:");
      expect(noteText).toContain("- Build outputs and dependencies");
    });
    
    it("should handle failure with unknown error in displaySetupSummary", () => {
      // Call with success=false and no error
      (gitignoreService as any).displaySetupSummary(false);
      
      // Verify unknown error message
      const noteText = mockCliInterfaceService.note.mock.calls[0][1];
      expect(noteText).toContain("Unknown error");
    });
  });
});