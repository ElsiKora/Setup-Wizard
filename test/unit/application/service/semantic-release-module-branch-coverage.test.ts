import { describe, it, expect, vi, beforeEach } from "vitest";
import { SemanticReleaseModuleService } from "../../../../src/application/service/semantic-release-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import type { IPackageJson } from "../../../../src/domain/interface/package-json.interface";

/**
 * This test file specifically targets branch coverage in semantic-release-module.service.ts
 * for lines 208, 225, 242, 259, and 283.
 */
describe("SemanticReleaseModuleService Branch Coverage", () => {
  // Mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();
  const mockPackageJsonService = {
    addScript: vi.fn(),
    installPackages: vi.fn(),
    get: vi.fn(),
  };

  // Service instance
  let semanticReleaseService: SemanticReleaseModuleService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default implementations
    mockCliInterfaceService.text.mockImplementation((message, placeholder, defaultValue) => {
      // Return the default value that was passed
      return Promise.resolve(defaultValue);
    });
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockPackageJsonService.get.mockResolvedValue({});

    // Create service instance with mocks
    semanticReleaseService = new SemanticReleaseModuleService(
      mockCliInterfaceService,
      mockFileSystemService,
      mockConfigService
    );

    // Mock PACKAGE_JSON_SERVICE property
    vi.spyOn(semanticReleaseService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
  });

  describe("getDevelopBranch", () => {
    // Test for line 208: const initialBranch: string = this.config?.developBranch ?? "dev";
    it("should use specific develop branch from config when available", async () => {
      // Set config with developBranch property
      (semanticReleaseService as any).config = {
        developBranch: "development"
      };
      
      // Call the method
      const result = await (semanticReleaseService as any).getDevelopBranch();
      
      // Verify specific branch from config was used as default
      expect(result).toBe("development");
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your development branch for backmerge:",
        "dev",
        "development",
        expect.any(Function)
      );
    });
    
    it("should use undefined as developBranch when config is null", async () => {
      // Set config to null
      (semanticReleaseService as any).config = null;
      
      // Call the method
      await (semanticReleaseService as any).getDevelopBranch();
      
      // Verify default "dev" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your development branch for backmerge:",
        "dev",
        "dev",
        expect.any(Function)
      );
    });
    
    it("should use undefined as developBranch when config doesn't have developBranch property", async () => {
      // Set config without developBranch property
      (semanticReleaseService as any).config = {};
      
      // Call the method
      await (semanticReleaseService as any).getDevelopBranch();
      
      // Verify default "dev" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your development branch for backmerge:",
        "dev",
        "dev",
        expect.any(Function)
      );
    });
  });

  describe("getMainBranch", () => {
    // Test for line 225: const initialBranch: string = this.config?.mainBranch ?? "main";
    it("should use specific main branch from config when available", async () => {
      // Set config with mainBranch property
      (semanticReleaseService as any).config = {
        mainBranch: "master"
      };
      
      // Call the method
      const result = await (semanticReleaseService as any).getMainBranch();
      
      // Verify specific branch from config was used as default
      expect(result).toBe("master");
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your main release branch:",
        "main",
        "master",
        expect.any(Function)
      );
    });
    
    it("should use default main branch when config is null", async () => {
      // Set config to null
      (semanticReleaseService as any).config = null;
      
      // Call the method
      await (semanticReleaseService as any).getMainBranch();
      
      // Verify default "main" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your main release branch:",
        "main",
        "main",
        expect.any(Function)
      );
    });
    
    it("should use default main branch when config doesn't have mainBranch property", async () => {
      // Set config without mainBranch property
      (semanticReleaseService as any).config = {};
      
      // Call the method
      await (semanticReleaseService as any).getMainBranch();
      
      // Verify default "main" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your main release branch:",
        "main",
        "main",
        expect.any(Function)
      );
    });
  });

  describe("getPreReleaseBranch", () => {
    // Test for line 242: const initialBranch: string = this.config?.preReleaseBranch ?? "dev";
    it("should use specific pre-release branch from config when available", async () => {
      // Set config with preReleaseBranch property
      (semanticReleaseService as any).config = {
        preReleaseBranch: "develop"
      };
      
      // Call the method
      const result = await (semanticReleaseService as any).getPreReleaseBranch();
      
      // Verify specific branch from config was used as default
      expect(result).toBe("develop");
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your pre-release branch:",
        "dev",
        "develop",
        expect.any(Function)
      );
    });
    
    it("should use default pre-release branch when config is null", async () => {
      // Set config to null
      (semanticReleaseService as any).config = null;
      
      // Call the method
      await (semanticReleaseService as any).getPreReleaseBranch();
      
      // Verify default "dev" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your pre-release branch:",
        "dev",
        "dev",
        expect.any(Function)
      );
    });
    
    it("should use default pre-release branch when config doesn't have preReleaseBranch property", async () => {
      // Set config without preReleaseBranch property
      (semanticReleaseService as any).config = {};
      
      // Call the method
      await (semanticReleaseService as any).getPreReleaseBranch();
      
      // Verify default "dev" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the name of your pre-release branch:",
        "dev",
        "dev",
        expect.any(Function)
      );
    });
  });

  describe("getPreReleaseChannel", () => {
    // Test for line 259: const initialChannel: string = this.config?.preReleaseChannel ?? "beta";
    it("should use specific pre-release channel from config when available", async () => {
      // Set config with preReleaseChannel property
      (semanticReleaseService as any).config = {
        preReleaseChannel: "alpha"
      };
      
      // Call the method
      const result = await (semanticReleaseService as any).getPreReleaseChannel();
      
      // Verify specific channel from config was used as default
      expect(result).toBe("alpha");
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the pre-release channel name (e.g., beta, alpha, next):",
        "beta",
        "alpha",
        expect.any(Function)
      );
    });
    
    it("should use default pre-release channel when config is null", async () => {
      // Set config to null
      (semanticReleaseService as any).config = null;
      
      // Call the method
      await (semanticReleaseService as any).getPreReleaseChannel();
      
      // Verify default "beta" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the pre-release channel name (e.g., beta, alpha, next):",
        "beta",
        "beta",
        expect.any(Function)
      );
    });
    
    it("should use default pre-release channel when config doesn't have preReleaseChannel property", async () => {
      // Set config without preReleaseChannel property
      (semanticReleaseService as any).config = {};
      
      // Call the method
      await (semanticReleaseService as any).getPreReleaseChannel();
      
      // Verify default "beta" was used
      expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
        "Enter the pre-release channel name (e.g., beta, alpha, next):",
        "beta",
        "beta",
        expect.any(Function)
      );
    });
  });

  describe("getRepositoryUrl", () => {
    // Test for line 283: savedRepoUrl = typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository.url || "";
    it("should handle repository as object with missing url property", async () => {
      // First set config with a saved repo URL to trigger a different branch
      (semanticReleaseService as any).config = {
        // Empty config so it uses package.json
      };
      
      // Mock package.json with repository object that has no url property
      const packageJson: IPackageJson = {
        name: "test-package",
        version: "1.0.0",
        repository: {
          type: "git",
          // No url property!
        } as any
      };
      mockPackageJsonService.get.mockResolvedValueOnce(packageJson);
      
      // For this test, we need to avoid the confirm call and go straight to text input
      // since the empty url won't trigger the confirm
      mockCliInterfaceService.text.mockResolvedValueOnce("https://github.com/user/repo");
      
      // Call the method
      const result = await (semanticReleaseService as any).getRepositoryUrl();
      
      // Since the URL was empty, it should skip confirm and call text directly
      expect(mockCliInterfaceService.text).toHaveBeenCalled();
      expect(result).toBe("https://github.com/user/repo");
    });
    
    it("should handle repository as object with url property", async () => {
      // Mock package.json with repository object that has url property
      const packageJson: IPackageJson = {
        name: "test-package",
        version: "1.0.0",
        repository: {
          type: "git",
          url: "https://github.com/user/repo-obj"
        }
      };
      mockPackageJsonService.get.mockResolvedValueOnce(packageJson);
      
      // Accept the found URL
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
      
      // Call the method
      const result = await (semanticReleaseService as any).getRepositoryUrl();
      
      // Should use the repository.url value
      expect(result).toBe("https://github.com/user/repo-obj");
    });
    
    it("should handle repository as string", async () => {
      // Mock package.json with repository as string
      const packageJson: IPackageJson = {
        name: "test-package",
        version: "1.0.0",
        repository: "https://github.com/user/repo-string"
      };
      mockPackageJsonService.get.mockResolvedValueOnce(packageJson);
      
      // Accept the found URL
      mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
      
      // Call the method
      const result = await (semanticReleaseService as any).getRepositoryUrl();
      
      // Should use the repository string value
      expect(result).toBe("https://github.com/user/repo-string");
    });
  });
});