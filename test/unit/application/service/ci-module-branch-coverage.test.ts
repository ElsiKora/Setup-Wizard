import { describe, it, expect, vi, beforeEach } from "vitest";
import { CiModuleService } from "../../../../src/application/service/ci-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { ECiModule } from "../../../../src/domain/enum/ci-module.enum";
import { ECiProvider } from "../../../../src/domain/enum/ci-provider.enum";
import { ECiModuleType } from "../../../../src/domain/enum/ci-module-type.enum";
import { CI_CONFIG } from "../../../../src/domain/constant/ci-config.constant";

/**
 * This test suite specifically targets the remaining uncovered branches in ci-module.service.ts
 * to achieve 100% branch coverage.
 */
describe("CiModuleService Branch Coverage", () => {
  // Mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();

  // Service instance
  let ciService: CiModuleService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCliInterfaceService.confirm.mockReset();
    mockCliInterfaceService.select.mockReset();
    mockCliInterfaceService.multiselect.mockReset();
    mockCliInterfaceService.text.mockReset();
    mockConfigService.getModuleConfig.mockReset();
    mockConfigService.isModuleEnabled.mockReset();
    mockFileSystemService.isPathExists.mockReset();
    mockFileSystemService.writeFile.mockReset();
    mockFileSystemService.createDirectory.mockReset();

    // Default implementations
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockCliInterfaceService.select.mockResolvedValue(ECiProvider.GITHUB);
    mockCliInterfaceService.multiselect.mockResolvedValue([ECiModule.DEPENDABOT]);
    mockCliInterfaceService.text.mockResolvedValue("main");
    mockConfigService.getModuleConfig.mockResolvedValue(null);
    mockConfigService.isModuleEnabled.mockResolvedValue(true);
    mockFileSystemService.isPathExists.mockResolvedValue(false);
    mockFileSystemService.createDirectory.mockResolvedValue(undefined);
    mockFileSystemService.writeFile.mockResolvedValue(undefined);

    // Create service instance with mocks
    ciService = new CiModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);
  });

  // Target lines 88-90 when moduleProperties[ECiModule.RELEASE_NPM] is false or undefined
  describe("determineModuleType", () => {
    it("should default isConfirmedByDefault to false when isSavedNpmPackage is undefined", async () => {
      // Set expected result for CLI confirm
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false);
      
      // Call the method with undefined
      const result = await (ciService as any).determineModuleType(undefined);
      
      // Verify the correct default (false) was used
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.any(String),
        false
      );
      expect(result).toBe(ECiModuleType.NON_NPM);
    });
    
    it("should respect isSavedNpmPackage when it's false", async () => {
      // Set expected result for CLI confirm
      mockCliInterfaceService.confirm.mockImplementationOnce(async (_, defaultValue) => {
        expect(defaultValue).toBe(false);
        return true; // Return different value to verify the logic
      });
      
      // Call the method with false
      const result = await (ciService as any).determineModuleType(false);
      
      // Verify result is based on user confirmation
      expect(result).toBe(ECiModuleType.NPM_ONLY);
    });
  });

  // Target line 104 - branch where config.moduleProperties is undefined
  describe("install", () => {
    it("should handle undefined moduleProperties in config", async () => {
      // Setup mocks to allow reaching the right code path
      mockConfigService.getModuleConfig.mockResolvedValueOnce({ 
        provider: ECiProvider.GITHUB,
        modules: [ECiModule.DEPENDABOT]
      });
      
      // Mock internal methods
      vi.spyOn(ciService as any, 'shouldInstall').mockResolvedValueOnce(true);
      vi.spyOn(ciService as any, 'determineModuleType').mockResolvedValueOnce(ECiModuleType.NON_NPM);
      vi.spyOn(ciService as any, 'selectProvider').mockResolvedValueOnce(ECiProvider.GITHUB);
      vi.spyOn(ciService as any, 'selectCompatibleModules').mockResolvedValueOnce([ECiModule.DEPENDABOT]);
      vi.spyOn(ciService as any, 'handleExistingSetup').mockResolvedValueOnce(true);
      vi.spyOn(ciService as any, 'setupSelectedModules').mockImplementationOnce(async (props) => {
        // Verify empty object was passed
        expect(props).toEqual({});
        return { [ECiModule.DEPENDABOT]: { devBranchName: 'dev' } };
      });
      
      // Call the method
      const result = await ciService.install();
      
      // Verify the result
      expect(result.wasInstalled).toBe(true);
      expect((ciService as any).setupSelectedModules).toHaveBeenCalledWith({});
    });
    
    it("should pass RELEASE_NPM value to determineModuleType", async () => {
      // Setup config with RELEASE_NPM property
      mockConfigService.getModuleConfig.mockResolvedValueOnce({ 
        moduleProperties: {
          [ECiModule.RELEASE_NPM]: true
        }
      });
      
      // Mock determineModuleType to verify parameter
      const determineModuleTypeSpy = vi.spyOn(ciService as any, 'determineModuleType')
        .mockImplementationOnce((isNpmPackage) => {
          // Verify true is passed from config.moduleProperties[ECiModule.RELEASE_NPM]
          expect(isNpmPackage).toBe(true);
          return Promise.resolve(ECiModuleType.NPM_ONLY);
        });
      
      // Mock other required methods
      vi.spyOn(ciService as any, 'shouldInstall').mockResolvedValueOnce(true);
      vi.spyOn(ciService as any, 'selectProvider').mockResolvedValueOnce(ECiProvider.GITHUB);
      vi.spyOn(ciService as any, 'selectCompatibleModules').mockResolvedValueOnce([]);
      
      // Call the method
      await ciService.install();
      
      // Verify determineModuleType was called with the correct parameter
      expect(determineModuleTypeSpy).toHaveBeenCalledWith(true);
    });
  });

  // Target line 172 - branch for non-skipping code if isPrerelease is defined in config
  describe("collectModuleProperties", () => {
    it("should handle isPrerelease defined in saved properties when semantic-release config exists", async () => {
      // Setup mocks
      (ciService as any).selectedModules = [ECiModule.RELEASE];
      
      // Create saved properties with isPrerelease already defined
      const savedProperties = { 
        isPrerelease: true,
        // Include mainBranch to skip part of semantic-release config logic
        mainBranch: "custom-branch"
      };
      
      // Setup semantic release config mock that shouldn't be used for isPrerelease
      mockConfigService.getModuleConfig.mockResolvedValueOnce({
        mainBranch: "main-from-semantic",
        isPrereleaseEnabled: false, // different from saved value
        preReleaseBranch: "beta-from-semantic"
      });
      
      // Set mock responses for CLI prompts
      mockCliInterfaceService.text.mockResolvedValueOnce("master"); // mainBranch
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true); // shouldEnablePrerelease
      mockCliInterfaceService.text.mockResolvedValueOnce("develop"); // preReleaseBranch
      
      // Call the method
      const result = await (ciService as any).collectModuleProperties(ECiModule.RELEASE, savedProperties);
      
      // Verify the results respect existing isPrerelease setting
      expect(result.isPrerelease).toBe(true);
      
      // Verify the mainBranch text input used the saved value, not semantic-release value
      expect(mockCliInterfaceService.text).toHaveBeenNthCalledWith(
        1, 
        expect.any(String), 
        "main", 
        "custom-branch" // Should use the saved value
      );
      
      // Confirm should use value from saved properties
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.any(String),
        true
      );
      
      // The semantic-release config should not have been used for isPrerelease
      // because it's already defined in saved properties
      expect(result.isPrerelease).not.toBe(false); // semantic-release had false
    });
    
    it("should handle the case where semantic-release config with mainBranch exists but preReleaseBranch is not provided", async () => {
      // Setup mocks
      (ciService as any).selectedModules = [ECiModule.RELEASE];
      
      // Create saved properties without mainBranch and isPrerelease
      const savedProperties = {}; 
      
      // Setup semantic release config with mainBranch but no preReleaseBranch
      mockConfigService.getModuleConfig.mockResolvedValueOnce({
        mainBranch: "main-from-semantic",
        isPrereleaseEnabled: true,
        // No preReleaseBranch
      });
      
      // Set mock responses for CLI prompts
      mockCliInterfaceService.text.mockResolvedValueOnce("master"); // mainBranch
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true); // shouldEnablePrerelease
      mockCliInterfaceService.text.mockResolvedValueOnce("develop"); // preReleaseBranch
      
      // Call the method
      const result = await (ciService as any).collectModuleProperties(ECiModule.RELEASE, savedProperties);
      
      // Verify the mainBranch was taken from the semantic-release config
      expect(mockCliInterfaceService.text).toHaveBeenNthCalledWith(
        1, 
        expect.any(String), 
        "main", 
        "main-from-semantic"
      );
      
      // Verify preReleaseBranch used the default value since it was not in semantic-release config
      expect(mockCliInterfaceService.text).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        "dev",
        "dev" // Default value, not from semantic-release
      );
    });
    
    it("should handle isPrereleaseEnabled being undefined in semantic-release config", async () => {
      // Setup mocks
      (ciService as any).selectedModules = [ECiModule.RELEASE];
      
      // Create saved properties without isPrerelease
      const savedProperties = {}; 
      
      // Setup semantic release config with isPrereleaseEnabled undefined
      mockConfigService.getModuleConfig.mockResolvedValueOnce({
        mainBranch: "main-from-semantic",
        // isPrereleaseEnabled is missing
        preReleaseBranch: "beta"
      });
      
      // Set mock responses for CLI prompts
      mockCliInterfaceService.text.mockResolvedValueOnce("master"); // mainBranch
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true); // shouldEnablePrerelease
      mockCliInterfaceService.text.mockResolvedValueOnce("develop"); // preReleaseBranch
      
      // Call the method
      const result = await (ciService as any).collectModuleProperties(ECiModule.RELEASE, savedProperties);
      
      // Verify the confirm used false as the default value
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.any(String),
        false // Should default to false when isPrereleaseEnabled is undefined
      );
    });
    
    it("should handle isPrereleaseEnabled being null in semantic-release config (line 172)", async () => {
      // Setup mocks
      (ciService as any).selectedModules = [ECiModule.RELEASE];
      
      // Create saved properties without isPrerelease
      const savedProperties = {}; 
      
      // Setup semantic release config with isPrereleaseEnabled set to null
      mockConfigService.getModuleConfig.mockResolvedValueOnce({
        mainBranch: "main-from-semantic",
        isPrereleaseEnabled: null,
        preReleaseBranch: "beta"
      });
      
      // Set mock responses for CLI prompts
      mockCliInterfaceService.text.mockResolvedValueOnce("master"); // mainBranch
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true); // shouldEnablePrerelease
      mockCliInterfaceService.text.mockResolvedValueOnce("develop"); // preReleaseBranch
      
      // Call the method
      const result = await (ciService as any).collectModuleProperties(ECiModule.RELEASE, savedProperties);
      
      // Verify the confirm used false as the default value due to nullish coalescing
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.any(String),
        false // Should default to false when isPrereleaseEnabled is null
      );
    });
  });
  
  // Target line 208 - fallback to false when isSavedNpmPackage is null
  describe("determineModuleType with null parameter", () => {
    it("should handle null parameter", async () => {
      // Mock confirm to verify default parameter
      mockCliInterfaceService.confirm.mockImplementationOnce(async (_, defaultValue) => {
        expect(defaultValue).toBe(false);
        return false;
      });
      
      // Call method with null
      const result = await (ciService as any).determineModuleType(null);
      
      // Verify result
      expect(result).toBe(ECiModuleType.NON_NPM);
    });
  });

  // Target line 208 - branch where isSavedNpmPackage is undefined
  describe("determineModuleType", () => {
    it("should use false as default when isSavedNpmPackage is undefined", async () => {
      mockCliInterfaceService.confirm.mockImplementationOnce(async (_, defaultValue) => {
        expect(defaultValue).toBe(false);
        return false;
      });
      
      // Call the method without arguments (undefined)
      const result = await (ciService as any).determineModuleType();
      
      // Verify the result
      expect(result).toBe(ECiModuleType.NON_NPM);
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.any(String),
        false
      );
    });
  });
});