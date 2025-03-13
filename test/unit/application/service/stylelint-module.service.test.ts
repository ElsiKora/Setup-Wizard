import { describe, it, expect, vi, beforeEach } from "vitest";
import { StylelintModuleService } from "../../../../src/application/service/stylelint-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { STYLELINT_CONFIG_FILE_NAMES } from "../../../../src/application/constant/stylelint-config-file-names.constant";
import { STYLELINT_CONFIG_FILE_NAME } from "../../../../src/application/constant/stylelint-config-file-name.constant";
import { STYLELINT_CONFIG_IGNORE_FILE_NAME } from "../../../../src/application/constant/stylelint-config-ignore-file-name.constant";
import { STYLELINT_CONFIG } from "../../../../src/application/constant/stylelint-config.constant";
import { STYLELINT_CONFIG_IGNORE_PATHS } from "../../../../src/application/constant/stylelint-config-ignore-paths.constant";
import { STYLELINT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/stylelint-config-core-dependencies.constant";

describe("StylelintModuleService", () => {
  // Mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();
  const mockPackageJsonService = {
    addScript: vi.fn(),
    installPackages: vi.fn()
  };

  // Service instance
  let stylelintService: StylelintModuleService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockCliInterfaceService.confirm.mockReset();
    mockCliInterfaceService.startSpinner.mockReset();
    mockCliInterfaceService.stopSpinner.mockReset();
    mockCliInterfaceService.note.mockReset();
    mockConfigService.isModuleEnabled.mockReset();
    mockFileSystemService.isPathExists.mockReset();
    mockFileSystemService.writeFile.mockReset();
    mockFileSystemService.deleteFile.mockReset();
    mockPackageJsonService.addScript.mockReset();
    mockPackageJsonService.installPackages.mockReset();

    // Default implementations
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockConfigService.isModuleEnabled.mockResolvedValue(true);
    mockFileSystemService.isPathExists.mockResolvedValue(false);
    mockPackageJsonService.addScript.mockResolvedValue(undefined);
    mockPackageJsonService.installPackages.mockResolvedValue(undefined);

    // Create service instance with mocks
    stylelintService = new StylelintModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

    // Mock PACKAGE_JSON_SERVICE property
    vi.spyOn(stylelintService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
  });

  describe("shouldInstall", () => {
    it("should return true when user confirms installation", async () => {
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
      mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

      const result = await stylelintService.shouldInstall();

      expect(result).toBe(true);
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        "Do you want to set up Stylelint for your project?", 
        true
      );
    });

    it("should return false when user declines installation", async () => {
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

      const result = await stylelintService.shouldInstall();

      expect(result).toBe(false);
    });

    it("should return false when an error occurs", async () => {
      mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

      const result = await stylelintService.shouldInstall();

      expect(result).toBe(false);
      expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
    });
  });

  describe("findExistingConfigFiles", () => {
    it("should find existing stylelint config files", async () => {
      // Mock finding two config files
      mockFileSystemService.isPathExists.mockImplementation(async (file) => {
        return file === 'stylelint.config.js' || file === '.stylelintrc';
      });

      const result = await (stylelintService as any).findExistingConfigFiles();

      expect(result).toEqual(['stylelint.config.js', '.stylelintrc']);
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(STYLELINT_CONFIG_FILE_NAMES.length);
    });

    it("should return empty array when no config files exist", async () => {
      mockFileSystemService.isPathExists.mockResolvedValue(false);

      const result = await (stylelintService as any).findExistingConfigFiles();

      expect(result).toEqual([]);
    });
  });

  describe("handleExistingSetup", () => {
    it("should return true when no existing configuration is found", async () => {
      vi.spyOn(stylelintService as any, "findExistingConfigFiles").mockResolvedValueOnce([]);

      const result = await stylelintService.handleExistingSetup();

      expect(result).toBe(true);
    });

    it("should ask to delete when existing files are found and user confirms", async () => {
      vi.spyOn(stylelintService as any, "findExistingConfigFiles").mockResolvedValueOnce(['stylelint.config.js', '.stylelintrc']);
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

      const result = await stylelintService.handleExistingSetup();

      expect(result).toBe(true);
      expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(
        expect.stringContaining("Existing Stylelint configuration files detected"), 
        true
      );
      expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
      expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith('stylelint.config.js');
      expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith('.stylelintrc');
    });

    it("should return false when user declines to delete existing files", async () => {
      vi.spyOn(stylelintService as any, "findExistingConfigFiles").mockResolvedValueOnce(['stylelint.config.js']);
      mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

      const result = await stylelintService.handleExistingSetup();

      expect(result).toBe(false);
      expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(
        "Existing Stylelint configuration files detected. Setup aborted."
      );
      expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe("createConfigs", () => {
    it("should create stylelint configuration files", async () => {
      await (stylelintService as any).createConfigs();

      expect(mockFileSystemService.writeFile).toHaveBeenCalledTimes(2);
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        STYLELINT_CONFIG_FILE_NAME, 
        STYLELINT_CONFIG, 
        "utf8"
      );
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        STYLELINT_CONFIG_IGNORE_FILE_NAME, 
        STYLELINT_CONFIG_IGNORE_PATHS.join("\n"), 
        "utf8"
      );
    });
  });

  describe("setupScripts", () => {
    it("should add stylelint scripts to package.json", async () => {
      await (stylelintService as any).setupScripts();

      expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
      expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(
        "lint:style", 
        'stylelint "**/*.{css,scss}"'
      );
      expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(
        "lint:style:fix", 
        'stylelint "**/*.{css,scss}" --fix'
      );
    });
  });

  describe("displaySetupSummary", () => {
    it("should display setup summary with correct information", () => {
      (stylelintService as any).displaySetupSummary();

      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Stylelint Setup",
        expect.stringContaining("Stylelint configuration has been created.")
      );
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Stylelint Setup",
        expect.stringContaining("Generated scripts:")
      );
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Stylelint Setup",
        expect.stringContaining(`- ${STYLELINT_CONFIG_FILE_NAME}`)
      );
      expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
        "Stylelint Setup",
        expect.stringContaining(`- ${STYLELINT_CONFIG_IGNORE_FILE_NAME}`)
      );
    });
  });

  describe("setupStylelint", () => {
    it("should set up stylelint configuration successfully", async () => {
      vi.spyOn(stylelintService as any, "createConfigs").mockResolvedValueOnce(undefined);
      vi.spyOn(stylelintService as any, "setupScripts").mockResolvedValueOnce(undefined);
      vi.spyOn(stylelintService as any, "displaySetupSummary").mockImplementationOnce(() => {});

      await (stylelintService as any).setupStylelint();

      expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Setting up Stylelint configuration...");
      expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(
        STYLELINT_CONFIG_CORE_DEPENDENCIES, 
        "latest", 
        EPackageJsonDependencyType.DEV
      );
      expect(stylelintService["createConfigs"]).toHaveBeenCalled();
      expect(stylelintService["setupScripts"]).toHaveBeenCalled();
      expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Stylelint configuration completed successfully!");
      expect(stylelintService["displaySetupSummary"]).toHaveBeenCalled();
    });

    it("should handle errors during stylelint setup", async () => {
      mockPackageJsonService.installPackages.mockRejectedValueOnce(new Error("Install error"));

      await expect((stylelintService as any).setupStylelint()).rejects.toThrow("Install error");

      expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup Stylelint configuration");
    });
  });

  describe("install", () => {
    it("should complete successful installation", async () => {
      vi.spyOn(stylelintService, "shouldInstall").mockResolvedValueOnce(true);
      vi.spyOn(stylelintService, "handleExistingSetup").mockResolvedValueOnce(true);
      vi.spyOn(stylelintService as any, "setupStylelint").mockResolvedValueOnce(undefined);

      const result = await stylelintService.install();

      expect(result).toEqual({
        wasInstalled: true
      });
      expect(stylelintService.shouldInstall).toHaveBeenCalled();
      expect(stylelintService.handleExistingSetup).toHaveBeenCalled();
      expect(stylelintService["setupStylelint"]).toHaveBeenCalled();
    });

    it("should not install when user declines installation", async () => {
      // Setup spies
      vi.spyOn(stylelintService, "shouldInstall").mockResolvedValueOnce(false);
      const setupStylelintSpy = vi.spyOn(stylelintService as any, "setupStylelint");

      // Call the method
      const result = await stylelintService.install();

      // Check results
      expect(result).toEqual({
        wasInstalled: false
      });
      expect(setupStylelintSpy).not.toHaveBeenCalled();
    });

    it("should not install when existing setup cannot be handled", async () => {
      // Setup spies
      vi.spyOn(stylelintService, "shouldInstall").mockResolvedValueOnce(true);
      vi.spyOn(stylelintService, "handleExistingSetup").mockResolvedValueOnce(false);
      const setupStylelintSpy = vi.spyOn(stylelintService as any, "setupStylelint");

      // Call the method
      const result = await stylelintService.install();

      // Check results
      expect(result).toEqual({
        wasInstalled: false
      });
      expect(setupStylelintSpy).not.toHaveBeenCalled();
    });

    it("should handle errors during installation", async () => {
      vi.spyOn(stylelintService, "shouldInstall").mockResolvedValueOnce(true);
      vi.spyOn(stylelintService, "handleExistingSetup").mockResolvedValueOnce(true);
      vi.spyOn(stylelintService as any, "setupStylelint").mockRejectedValueOnce(new Error("Setup error"));

      await expect(stylelintService.install()).rejects.toThrow("Setup error");
      expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(
        "Failed to complete Stylelint setup",
        expect.any(Error)
      );
    });
  });
});