import { describe, it, expect, vi, beforeEach } from "vitest";
import { EslintModuleService } from "../../../../src/application/service/eslint-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { ESLINT_FEATURE_CONFIG } from "../../../../src/domain/constant/eslint-feature-config.constant";

/**
 * This test suite specifically targets the remaining uncovered branches in eslint-module.service.ts
 * to achieve 100% branch coverage.
 */
describe("EslintModuleService Full Coverage", () => {
  // Mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();

  // Service instance
  let eslintService: EslintModuleService;

  // Mock package.json service
  const mockPackageJsonService = {
    addDependency: vi.fn().mockResolvedValue(undefined),
    addScript: vi.fn().mockResolvedValue(undefined),
    getDependencies: vi.fn().mockResolvedValue({}),
    getInstalledDependencyVersion: vi.fn().mockResolvedValue(undefined),
    getProperty: vi.fn().mockResolvedValue({}),
    installPackages: vi.fn().mockResolvedValue(undefined),
    isExistsDependency: vi.fn().mockResolvedValue(false),
    removeDependency: vi.fn().mockResolvedValue(undefined),
    uninstallPackages: vi.fn().mockResolvedValue(undefined),
  };

  // Mock framework service
  const mockFrameworkService = {
    detect: vi.fn().mockResolvedValue([]),
    getFeatures: vi.fn().mockReturnValue([]),
    getIgnorePatterns: vi.fn().mockReturnValue([]),
    getLintPaths: vi.fn().mockReturnValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCliInterfaceService.confirm.mockReset();
    mockCliInterfaceService.groupMultiselect.mockReset();
    mockConfigService.getModuleConfig.mockReset();
    mockConfigService.isModuleEnabled.mockReset();
    mockFileSystemService.isPathExists.mockReset();
    mockFileSystemService.writeFile.mockReset();
    mockFileSystemService.deleteFile.mockReset();

    // Default implementations
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockCliInterfaceService.groupMultiselect.mockResolvedValue([EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]);
    mockConfigService.getModuleConfig.mockResolvedValue({ features: [EEslintFeature.JAVASCRIPT] });
    mockConfigService.isModuleEnabled.mockResolvedValue(true);
    mockFileSystemService.isPathExists.mockResolvedValue(false);

    // Create service instance with mocks
    eslintService = new EslintModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

    // Mock internal services
    vi.spyOn(eslintService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
    vi.spyOn(eslintService as any, "FRAMEWORK_SERVICE", "get").mockReturnValue(mockFrameworkService);
  });

  // Target the uncovered branches in line 242
  describe("collectDependencies", () => {
    it("should include core and feature dependencies", () => {
      // Set selected features with packages
      (eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];
      
      // Call the method
      const result = (eslintService as any).collectDependencies();
      
      // Verify the result includes dependencies from the feature
      expect(result.length).toBeGreaterThan(0);
    });
    
    it("should not include undefined packages", () => {
      // Create a mock feature config with undefined packages
      const mockConfig = { ...ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT] };
      mockConfig.packages = undefined;
      
      // Mock the feature config
      const origConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT];
      ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT] = mockConfig;
      
      // Set selected features
      (eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];
      
      // Call the method
      const result = (eslintService as any).collectDependencies();
      
      // Restore original config
      ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT] = origConfig;
      
      // Verify the result still contains at least core dependencies
      expect(result.length).toBeGreaterThan(0);
    });
  });
  
  // Target the uncovered branch in line 388
  describe("generateLintIgnorePaths", () => {
    it("should handle empty ignore patterns", () => {
      // Mock getIgnorePatterns to return empty array
      vi.spyOn(eslintService as any, 'getIgnorePatterns').mockReturnValueOnce([]);
      
      // Call the method
      const result = (eslintService as any).generateLintIgnorePaths();
      
      // Verify empty array is returned
      expect(result).toEqual([]);
    });
  });
  
  // Target the uncovered branch in line 501
  describe("validateFeatureSelection", () => {
    it("should validate when no TypeScript-dependent features are selected", () => {
      // Set selected features to include only JavaScript
      (eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];
      
      // Call the method
      const result = (eslintService as any).validateFeatureSelection();
      
      // Verify validation passed
      expect(result).toBe(true);
    });
    
    it("should fail validation when TypeScript features are selected but TypeScript isn't detected", () => {
      // Create a mock feature with TypeScript requirement
      const mockTsFeature = EEslintFeature.TYPESCRIPT;
      const mockConfig = ESLINT_FEATURE_CONFIG[mockTsFeature];
      mockConfig.isRequiresTypescript = true;
      
      // Set selected features to include TypeScript-dependent feature
      (eslintService as any).selectedFeatures = [mockTsFeature];
      
      // Set detected frameworks to NOT include TypeScript
      (eslintService as any).detectedFrameworks = [
        { name: EFramework.REACT }
      ];
      
      // Call the method
      const result = (eslintService as any).validateFeatureSelection();
      
      // Verify validation failed and error was shown
      expect(result).toBe(false);
      expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(
        expect.stringContaining("TypeScript")
      );
    });
  });
  
  // Target the uncovered branch in line 184
  describe("install", () => {
    it("should handle null config when accessing features", async () => {
      // Mock config to be null, forcing the fallback to empty array
      mockConfigService.getModuleConfig.mockResolvedValueOnce(null);
      
      // Mock other necessary method calls
      vi.spyOn(eslintService as any, 'shouldInstall').mockResolvedValueOnce(true);
      vi.spyOn(eslintService as any, 'handleExistingSetup').mockResolvedValueOnce(true);
      vi.spyOn(eslintService as any, 'checkEslintVersion').mockResolvedValueOnce(true);
      vi.spyOn(eslintService as any, 'detectFrameworks').mockResolvedValueOnce([]);
      vi.spyOn(eslintService as any, 'selectFeatures').mockResolvedValueOnce([EEslintFeature.JAVASCRIPT]);
      vi.spyOn(eslintService as any, 'validateFeatureSelection').mockReturnValueOnce(true);
      vi.spyOn(eslintService as any, 'setupSelectedFeatures').mockResolvedValueOnce(undefined);
      
      // Call the install method
      const result = await eslintService.install();
      
      // Verify success
      expect(result.wasInstalled).toBe(true);
      // Verify selectFeatures was called with empty array
      expect((eslintService as any).selectFeatures).toHaveBeenCalledWith([]);
    });
  });
});