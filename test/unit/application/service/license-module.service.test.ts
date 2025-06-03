import { describe, it, expect, vi, beforeEach } from "vitest";
import { LicenseModuleService } from "../../../../src/application/service/license-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { ELicense } from "../../../../src/domain/enum/license.enum";
import { LICENSE_FILE_NAMES } from "../../../../src/application/constant/license/file-names.constant";
import { LICENSE_CONFIG_MESSAGES } from "../../../../src/application/constant/license/messages.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { LICENSE_CONFIG } from "../../../../src/domain/constant/license-config.constant";

describe("LicenseModuleService", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();
	const mockPackageJsonService = {
		getProperty: vi.fn(),
		setProperty: vi.fn(),
	};

	// Service instance
	let licenseService: LicenseModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock implementations
		mockCliInterfaceService.confirm.mockReset();
		mockCliInterfaceService.text.mockReset();
		mockCliInterfaceService.select.mockReset();
		mockConfigService.getModuleConfig.mockReset();
		mockConfigService.isModuleEnabled.mockReset();
		mockFileSystemService.isOneOfPathsExists.mockReset();
		mockFileSystemService.writeFile.mockReset();
		mockFileSystemService.deleteFile.mockReset();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockResolvedValue("Test Author");
		mockCliInterfaceService.select.mockResolvedValue(ELicense.MIT);
		mockConfigService.getModuleConfig.mockResolvedValue({ license: ELicense.MIT, author: "Default Author" });
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isOneOfPathsExists.mockResolvedValue(undefined);
		mockPackageJsonService.getProperty.mockResolvedValue({ name: "Package Author" });
		mockPackageJsonService.setProperty.mockResolvedValue(undefined);

		// Create service instance with mocks
		licenseService = new LicenseModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

		// Mock PACKAGE_JSON_SERVICE property
		vi.spyOn(licenseService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await licenseService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.confirmLicenseGeneration, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await licenseService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await licenseService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing license file is found", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce(undefined);

			const result = await licenseService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockFileSystemService.isOneOfPathsExists).toHaveBeenCalledWith(LICENSE_FILE_NAMES);
		});

		it("should ask to replace when existing license file is found and user confirms", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce("LICENSE");
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await licenseService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.confirmReplaceExisting("LICENSE"));
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("LICENSE");
			expect(mockCliInterfaceService.success).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.deletedExistingLicense);
		});

		it("should return false when user declines to replace existing license", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce("LICENSE");
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await licenseService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.keepingExistingLicense);
		});

		it("should handle errors when deleting existing license file", async () => {
			mockFileSystemService.isOneOfPathsExists.mockResolvedValueOnce("LICENSE");
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockFileSystemService.deleteFile.mockRejectedValueOnce(new Error("Delete error"));

			const result = await licenseService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.failedDeleteExistingLicense, expect.any(Error));
		});

		it("should handle errors when checking for existing license", async () => {
			mockFileSystemService.isOneOfPathsExists.mockRejectedValueOnce(new Error("Check error"));

			const result = await licenseService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.failedCheckExistingSetup, expect.any(Error));
		});
	});

	describe("install", () => {
		it("should complete successful installation with valid inputs", async () => {
			// Setup mocks
			vi.spyOn(licenseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(licenseService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(licenseService as any, "selectLicense").mockResolvedValueOnce(ELicense.MIT);
			vi.spyOn(licenseService as any, "createLicenseFile").mockResolvedValueOnce({ author: "Test Author" });
			vi.spyOn(licenseService as any, "displaySetupSummary").mockImplementationOnce(() => {});

			const result = await licenseService.install();

			expect(result).toEqual({
				customProperties: {
					author: "Test Author",
					license: ELicense.MIT,
					year: expect.any(Number),
				},
				wasInstalled: true,
			});
			expect(mockConfigService.getModuleConfig).toHaveBeenCalledWith(EModule.LICENSE);
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(licenseService, "shouldInstall").mockResolvedValueOnce(false);

			const result = await licenseService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
		});

		it("should not install when existing setup cannot be handled", async () => {
			vi.spyOn(licenseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(licenseService, "handleExistingSetup").mockResolvedValueOnce(false);

			const result = await licenseService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
		});

		it("should handle errors during installation", async () => {
			// Create an error that will propagate to the outer try-catch
			vi.spyOn(licenseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(licenseService, "handleExistingSetup").mockResolvedValueOnce(true);
			// This will cause an error that isn't caught by generateNewLicense's try-catch
			vi.spyOn(licenseService as any, "generateNewLicense").mockRejectedValueOnce(new Error("Unhandled error"));

			// This should now throw since the error isn't caught in generateNewLicense
			await expect(licenseService.install()).rejects.toThrow();
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.failedCompleteInstallation, expect.any(Error));
		});

		it("should handle license generation failures", async () => {
			vi.spyOn(licenseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(licenseService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(licenseService as any, "generateNewLicense").mockResolvedValueOnce({
				isSuccess: false,
				error: new Error("Generation failed"),
			});
			vi.spyOn(licenseService as any, "displaySetupSummary").mockImplementationOnce(() => {});

			const result = await licenseService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
		});
	});

	describe("createLicenseFile", () => {
		it("should create license file with author from package.json", async () => {
			// Mock date for consistent testing
			const currentYear = new Date().getFullYear();

			// Setup mocks
			mockPackageJsonService.getProperty.mockResolvedValueOnce({ name: "Package Author" });
			mockCliInterfaceService.text.mockResolvedValueOnce("Final Author");

			// Call the method
			const result = await (licenseService as any).createLicenseFile(ELicense.MIT);

			// Verify results
			expect(result).toEqual({ author: "Final Author" });
			expect(mockPackageJsonService.getProperty).toHaveBeenCalledWith("author");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "Package Author");
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.generatingLicenseSpinner);
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("LICENSE", LICENSE_CONFIG[ELicense.MIT].template(currentYear.toString(), "Final Author"));
			expect(mockPackageJsonService.setProperty).toHaveBeenCalledWith("license", ELicense.MIT);
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseFileGenerated);
		});

		it("should use saved author name when provided", async () => {
			// Call with saved author
			await (licenseService as any).createLicenseFile(ELicense.MIT, "Saved Author");

			// Verify the saved author was used
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "Saved Author");
		});

		it("should handle string author in package.json", async () => {
			// Setup string author
			mockPackageJsonService.getProperty.mockResolvedValueOnce("String Author");

			// Call the method
			await (licenseService as any).createLicenseFile(ELicense.MIT);

			// Verify string author was processed correctly
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "String Author");
		});

		it("should use default author when package.json author is empty", async () => {
			// Setup empty author
			mockPackageJsonService.getProperty.mockResolvedValueOnce("");

			// Call the method
			await (licenseService as any).createLicenseFile(ELicense.MIT);

			// Verify default was used
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "Your Name");
		});

		it("should use default author when package.json author is an empty object", async () => {
			// Setup empty object author
			mockPackageJsonService.getProperty.mockResolvedValueOnce({});

			// Call the method
			await (licenseService as any).createLicenseFile(ELicense.MIT);

			// Verify default was used
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "Your Name");
		});

		it("should handle errors when getting author from package.json", async () => {
			// Setup error scenario
			mockPackageJsonService.getProperty.mockRejectedValueOnce(new Error("Package access error"));

			// Call the method
			await (licenseService as any).createLicenseFile(ELicense.MIT);

			// Verify warning and fallback to default
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.failedGetAuthorFromPackageJson);
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.enterCopyrightHolderName, "Your Name", "Your Name");
		});

		it("should handle errors during license file creation", async () => {
			// Setup error scenario
			mockFileSystemService.writeFile.mockRejectedValueOnce(new Error("Write error"));

			// Call and expect rejection
			await expect((licenseService as any).createLicenseFile(ELicense.MIT)).rejects.toThrow();

			// Verify spinner was stopped
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith();
		});
	});

	describe("selectLicense", () => {
		it("should prompt user to select a license", async () => {
			// Mock the CLI interface select method
			mockCliInterfaceService.select.mockResolvedValueOnce(ELicense.MIT);

			// Call the method
			const result = await (licenseService as any).selectLicense();

			// Verify the result and interactions
			expect(result).toBe(ELicense.MIT);
			expect(mockCliInterfaceService.select).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.selectLicensePrompt, expect.any(Array), undefined);
		});

		it("should use saved license as initial value if provided", async () => {
			// Call with saved license
			await (licenseService as any).selectLicense(ELicense.APACHE_2_0);

			// Verify saved license was used as initial value
			expect(mockCliInterfaceService.select).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.selectLicensePrompt, expect.any(Array), ELicense.APACHE_2_0);
		});

		it("should handle errors during license selection", async () => {
			// Setup error scenario
			mockCliInterfaceService.select.mockRejectedValueOnce(new Error("Selection error"));

			// Call and expect rejection
			await expect((licenseService as any).selectLicense()).rejects.toThrow();

			// Verify error handling
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.failedSelectLicense, expect.any(Error));
		});
	});

	describe("generateNewLicense", () => {
		it("should generate license with saved config", async () => {
			// Mock methods
			vi.spyOn(licenseService as any, "selectLicense").mockResolvedValueOnce(ELicense.MIT);
			vi.spyOn(licenseService as any, "createLicenseFile").mockResolvedValueOnce({ author: "Test Author" });

			// Setup saved config
			const savedConfig = {
				license: ELicense.APACHE_2_0,
				author: "Saved Author",
				year: 2023,
			};

			// Call the method
			const result = await (licenseService as any).generateNewLicense(savedConfig);

			// Verify the result
			expect(result).toEqual({
				isSuccess: true,
				license: ELicense.MIT,
				author: "Test Author",
			});

			// Verify method calls
			expect(licenseService["selectLicense"]).toHaveBeenCalledWith(ELicense.APACHE_2_0);
			expect(licenseService["createLicenseFile"]).toHaveBeenCalledWith(ELicense.MIT, "Saved Author");
		});

		it("should handle errors during license generation", async () => {
			// Setup error scenario
			vi.spyOn(licenseService as any, "selectLicense").mockRejectedValueOnce(new Error("License error"));

			// Call the method
			const result = await (licenseService as any).generateNewLicense();

			// Verify the error result
			expect(result).toEqual({
				isSuccess: false,
				error: expect.any(Error),
			});
		});
	});

	describe("displaySetupSummary", () => {
		it("should display successful setup summary", () => {
			// Call with successful params
			(licenseService as any).displaySetupSummary(true, ELicense.MIT, "Test Author");

			// Verify the note call with success message
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining(LICENSE_CONFIG_MESSAGES.successfulConfiguration));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining(`- Type: ${LICENSE_CONFIG[ELicense.MIT].name}`));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining("- Author: Test Author"));
		});

		it("should display failed setup summary", () => {
			// Call with failure params
			(licenseService as any).displaySetupSummary(false, undefined, undefined, new Error("Setup failed"));

			// Verify the note call with error message
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining(LICENSE_CONFIG_MESSAGES.failedConfiguration));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining("Setup failed"));
		});

		it("should display 'Unknown error' when error has no message", () => {
			// Call with empty error object to test line 218
			(licenseService as any).displaySetupSummary(false, undefined, undefined, {} as Error);

			// Verify the note call with "Unknown error" message
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining(`✗ LICENSE - ${LICENSE_CONFIG_MESSAGES.unknownError}`));
		});

		it("should use default author name when not provided", () => {
			// Call without author
			(licenseService as any).displaySetupSummary(true, ELicense.MIT);

			// Verify default author name was used
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith(LICENSE_CONFIG_MESSAGES.licenseSetupSummaryTitle, expect.stringContaining("- Author: Your Name"));
		});
	});
});
