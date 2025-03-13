import { describe, it, expect, vi, beforeEach } from "vitest";
import { LicenseModuleService } from "../../../../src/application/service/license-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { ELicense } from "../../../../src/domain/enum/license.enum";
import { NodeCommandService } from "../../../../src/infrastructure/service/node-command.service";
import { PackageJsonService } from "../../../../src/application/service/package-json.service";

/**
 * This test file specifically targets the specific lines in license-module.service.ts 
 * that still need branch coverage.
 */
describe("LicenseModuleService Branch Coverage", () => {
  // Create mocks
  const mockCliInterfaceService = createMockCLIInterfaceService();
  const mockFileSystemService = createMockFileSystemService();
  const mockConfigService = createMockConfigService();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Common mock implementations
    mockCliInterfaceService.confirm.mockResolvedValue(true);
    mockCliInterfaceService.text.mockResolvedValue("Test Author");
    mockCliInterfaceService.select.mockResolvedValue(ELicense.MIT);
    mockConfigService.getModuleConfig.mockResolvedValue(null);
  });

  // Testing for line 53 (COMMAND_SERVICE initialization with cliInterfaceService)
  describe("Constructor (line 53)", () => {
    it("should initialize COMMAND_SERVICE with cliInterfaceService", () => {
      // Spy on NodeCommandService constructor
      const nodeCommandSpy = vi.spyOn(NodeCommandService.prototype, "constructor");
      // Need to save original to restore later
      const originalNodeCommandCtor = NodeCommandService.prototype.constructor;
      
      // Create an instance - this will trigger the code in lines 50-56
      const licenseService = new LicenseModuleService(
        mockCliInterfaceService,
        mockFileSystemService, 
        mockConfigService
      );
      
      // Check services got assigned
      expect(licenseService.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
      expect(licenseService.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
      expect(licenseService.CONFIG_SERVICE).toBe(mockConfigService);
      
      // Verify the non-public services exist
      expect((licenseService as any).COMMAND_SERVICE).toBeDefined();
      expect((licenseService as any).PACKAGE_JSON_SERVICE).toBeDefined();
      
      // Restore original constructor
      NodeCommandService.prototype.constructor = originalNodeCommandCtor;
    });
  });

  // Testing for line 244 (savedConfig?.license access)
  describe("generateNewLicense (line 244)", () => {
    it("should pass undefined to selectLicense when savedConfig is null", async () => {
      // Create service
      const licenseService = new LicenseModuleService(
        mockCliInterfaceService,
        mockFileSystemService,
        mockConfigService
      );
      
      // Spy on the selectLicense method
      const selectLicenseSpy = vi.spyOn(licenseService as any, "selectLicense");
      // Mock createLicenseFile to avoid actually running it
      vi.spyOn(licenseService as any, "createLicenseFile").mockResolvedValue({
        author: "Test Author"
      });
      
      // Call generateNewLicense with null
      await (licenseService as any).generateNewLicense(null);
      
      // Check the parameters passed to selectLicense
      expect(selectLicenseSpy).toHaveBeenCalledWith(undefined);
    });
    
    it("should pass savedConfig.license to selectLicense when license property exists", async () => {
      // Create service
      const licenseService = new LicenseModuleService(
        mockCliInterfaceService,
        mockFileSystemService,
        mockConfigService
      );
      
      // Spy on the selectLicense method
      const selectLicenseSpy = vi.spyOn(licenseService as any, "selectLicense");
      // Mock createLicenseFile to avoid actually running it
      vi.spyOn(licenseService as any, "createLicenseFile").mockResolvedValue({
        author: "Test Author"
      });
      
      // Call generateNewLicense with config containing license
      await (licenseService as any).generateNewLicense({
        license: ELicense.APACHE_2_0
      });
      
      // Check the parameters passed to selectLicense
      expect(selectLicenseSpy).toHaveBeenCalledWith(ELicense.APACHE_2_0);
    });
    
    it("should pass savedConfig?.author to createLicenseFile", async () => {
      // Create service
      const licenseService = new LicenseModuleService(
        mockCliInterfaceService,
        mockFileSystemService,
        mockConfigService
      );
      
      // Spy on the selectLicense method and make it return a fixed value
      vi.spyOn(licenseService as any, "selectLicense").mockResolvedValue(ELicense.MIT);
      // Spy on createLicenseFile to check parameters
      const createLicenseFileSpy = vi.spyOn(licenseService as any, "createLicenseFile")
        .mockResolvedValue({ author: "Test Author" });
      
      // Call generateNewLicense with config containing author
      await (licenseService as any).generateNewLicense({
        author: "Saved Author"
      });
      
      // Check the parameters passed to createLicenseFile
      expect(createLicenseFileSpy).toHaveBeenCalledWith(ELicense.MIT, "Saved Author");
    });
  });
});