import { describe, it, expect, vi, beforeEach } from "vitest";
import { EslintModuleService } from "../../../../src/application/service/eslint-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import { ESLINT_FEATURE_CONFIG } from "../../../../src/domain/constant/eslint-feature-config.constant";
import { ESLINT_CONFIG_ESLINT_PACKAGE_NAME } from "../../../../src/application/constant/eslint-config-eslint-package-name.costant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { EPackageJsonDependencyVersionFlag } from "../../../../src/domain/enum/package-json-dependency-version-flag.enum";
import { EModule } from "../../../../src/domain/enum/module.enum";

/**
 * This test suite targets specific uncovered branches in eslint-module.service.ts
 */
describe("EslintModuleService Branch Coverage", () => {
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

  describe("generateLintCommand and generateLintFixCommand", () => {
    it("should handle empty lint paths in generateLintCommand", () => {
      // Setup empty lint paths (uncovered branch in line 367)
      mockFrameworkService.getLintPaths.mockReturnValueOnce([]);

      // Call the method
      const result = (eslintService as any).generateLintCommand();

      // Verify fallback to '.'
      expect(result).toBe("eslint .");
    });

    it("should handle empty lint paths in generateLintFixCommand", () => {
      // Setup empty lint paths (uncovered branch in line 378)
      mockFrameworkService.getLintPaths.mockReturnValueOnce([]);

      // Call the method
      const result = (eslintService as any).generateLintFixCommand();

      // Verify fallback to '.'
      expect(result).toBe("eslint --fix .");
    });
  });

  describe("generateLintIgnorePaths", () => {
    it("should handle empty ignore patterns", () => {
      // Setup empty ignore patterns (uncovered branch in line 388)
      vi.spyOn(eslintService as any, 'getIgnorePatterns').mockReturnValueOnce([]);

      // Call the method
      const result = (eslintService as any).generateLintIgnorePaths();

      // Verify empty array is returned
      expect(result).toEqual([]);
    });

    it("should return ignore patterns when available", () => {
      // Setup non-empty ignore patterns
      vi.spyOn(eslintService as any, 'getIgnorePatterns').mockReturnValueOnce(['node_modules', 'dist']);

      // Call the method
      const result = (eslintService as any).generateLintIgnorePaths();

      // Verify ignore patterns are returned
      expect(result).toEqual(['node_modules', 'dist']);
    });
  });

  describe("displaySetupSummary", () => {
    it("should properly handle no package.json scripts", async () => {
      // Setup for empty package.json scripts (line 319)
      (eslintService as any).detectedFrameworks = [];
      (eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];
      
      // Return undefined for package.json scripts
      mockPackageJsonService.getProperty.mockResolvedValueOnce(undefined);

      // Call the method
      await (eslintService as any).displaySetupSummary();

      // Verify the note function was called
      expect(mockCliInterfaceService.note).toHaveBeenCalled();
    });

    it("should properly handle frameworks with no description", async () => {
      // Setup frameworks with no description (line 326)
      (eslintService as any).detectedFrameworks = [
        { name: EFramework.REACT, displayName: "React", description: "" }
      ];
      (eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.REACT];
      
      mockPackageJsonService.getProperty.mockResolvedValueOnce({
        lint: "eslint src",
      });

      // Call the method
      await (eslintService as any).displaySetupSummary();

      // Verify the note function was called with expected content
      expect(mockCliInterfaceService.note).toHaveBeenCalled();
      const noteCall = mockCliInterfaceService.note.mock.calls[0];
      expect(noteCall[1]).toContain("- React");
      expect(noteCall[1]).not.toContain("- React: ");
    });
  });

  describe("selectFeatures", () => {
    it("should handle invalid saved features", async () => {
      // Mock an invalid feature array (non-existent feature)
      const savedFeatures = ['invalid-feature'] as unknown as Array<EEslintFeature>;
      
      // Mock detect installed features
      vi.spyOn(eslintService as any, "detectInstalledFeatures").mockResolvedValueOnce([
        EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT
      ]);
      
      // User accepts detected features
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
      
      // Mock user selection
      mockCliInterfaceService.groupMultiselect.mockResolvedValueOnce([
        EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT
      ]);
      
      // Call the method
      const result = await (eslintService as any).selectFeatures(savedFeatures);
      
      // Verify that the invalid saved features were ignored and detected features were used
      expect(result).toEqual([EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]);
      expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
    });

    it("should handle only one detected feature", async () => {
      // Mock only one detected feature (covers branch when detectedFeatures.length <= 1)
      vi.spyOn(eslintService as any, "detectInstalledFeatures").mockResolvedValueOnce([
        EEslintFeature.JAVASCRIPT
      ]);
      
      // Mock user selection
      mockCliInterfaceService.groupMultiselect.mockResolvedValueOnce([
        EEslintFeature.JAVASCRIPT
      ]);
      
      // Call the method with empty saved features
      const result = await (eslintService as any).selectFeatures([]);
      
      // Verify result and that confirm wasn't called (since only one feature detected)
      expect(result).toEqual([EEslintFeature.JAVASCRIPT]);
      expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
    });
  });

  describe("detectInstalledFeatures", () => {
    it("should detect features with package dependencies", async () => {
      // Mock frameworks
      (eslintService as any).detectedFrameworks = [{ name: EFramework.REACT }];
      
      // Mock framework features
      mockFrameworkService.getFeatures.mockReturnValueOnce([EEslintFeature.REACT]);
      
      // Mock dependencies to trigger specific feature detection paths
      mockPackageJsonService.getDependencies.mockImplementation((type) => {
        if (type === EPackageJsonDependencyType.PROD) {
          // This package will trigger detection for specific features based on the detect array
          return Promise.resolve({ "next": "12.0.0" });
        }
        return Promise.resolve({});
      });
      
      // Call the method
      const result = await (eslintService as any).detectInstalledFeatures();
      
      // Verify the framework features and required features were detected
      expect(result).toContain(EEslintFeature.REACT);
      expect(result).toContain(EEslintFeature.JAVASCRIPT); // Required feature
      
      // Verify both dependency methods were called
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.PROD);
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.DEV);
    });
  });
});