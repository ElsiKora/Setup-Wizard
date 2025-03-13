import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CosmicConfigService } from "../../../../src/infrastructure/service/cosmi-config-config.service";
import { createMockFileSystemService } from "../../../helpers/test-utils";
import { CONFIG_MODULE_NAME } from "../../../../src/application/constant/config-module-name.constant";
import { cosmiconfig } from "cosmiconfig";

// Mock dependencies
vi.mock("cosmiconfig");
vi.mock("javascript-stringify", () => ({
  stringify: vi.fn((obj) => JSON.stringify(obj))
}));
vi.mock("yaml", () => ({
  default: {
    stringify: vi.fn((obj) => `YAML:${JSON.stringify(obj)}`)
  }
}));

/**
 * Additional coverage tests for CosmicConfigService
 * 
 * These tests specifically focus on the uncovered code paths in cosmi-config-config.service.ts,
 * particularly lines 235-238 and 241-242 which handle YML file extension and default file format.
 */
describe("CosmicConfigService Coverage Tests", () => {
  // Mock file system service
  const mockFileSystemService = createMockFileSystemService();
  
  // Mock explorer
  const mockExplorer = {
    clearCaches: vi.fn(),
    clearSearchCache: vi.fn(),
    search: vi.fn(),
    load: vi.fn(),
  };
  
  // Service instance
  let configService: CosmicConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    mockFileSystemService.getExtensionFromFilePath.mockReset();
    mockFileSystemService.getDirectoryNameFromFilePath.mockReset();
    mockFileSystemService.isPathExists.mockReset();
    mockFileSystemService.createDirectory.mockReset();
    mockFileSystemService.writeFile.mockReset();
    
    // Default implementations
    mockFileSystemService.getDirectoryNameFromFilePath.mockReturnValue("./");
    mockFileSystemService.isPathExists.mockResolvedValue(true);
    
    // Mock cosmiconfig to return the explorer
    vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);
    
    // Create service instance
    configService = new CosmicConfigService(mockFileSystemService);
  });

  describe("writeFile with additional file extensions", () => {
    it("should write YML config correctly", async () => {
      // Mock file extension for YML
      mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".yml");
      
      const config = { module: "test", setting: true };
      await (configService as any).writeFile("./.elsikora/setuprc.yml", config);
      
      // Verify proper YML content is written
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        "./.elsikora/setuprc.yml", 
        `YAML:${JSON.stringify(config)}`, 
        "utf8"
      );
    });

    it("should handle MJS files correctly", async () => {
      mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".mjs");
      
      const config = { module: "test", setting: true };
      await (configService as any).writeFile("./.elsikora/setup.config.mjs", config);
      
      // Verify MJS module export syntax is used
      const content = mockFileSystemService.writeFile.mock.calls[0][1];
      expect(content).toContain("export default");
    });

    it("should use default JSON format for unknown extensions", async () => {
      // Mock unknown file extension
      mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".unknown");
      
      const config = { module: "test", setting: true };
      await (configService as any).writeFile("config.unknown", config);
      
      // Verify default JSON format is used
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        "config.unknown", 
        JSON.stringify(config, null, 2), 
        "utf8"
      );
    });
  });
});