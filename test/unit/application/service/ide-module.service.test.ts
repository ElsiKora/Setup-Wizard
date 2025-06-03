import { describe, it, expect, vi, beforeEach } from "vitest";
import { IdeModuleService } from "../../../../src/application/service/ide-module.service";
import { EIde } from "../../../../src/domain/enum/ide.enum";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { IDE_CONFIG } from "../../../../src/domain/constant/ide-config.constant";
import { IDE_CONFIG_MESSAGES } from "../../../../src/application/constant/ide/messages.constant";

describe("IdeModuleService", () => {
	let ideModuleService: IdeModuleService;
	let cliInterfaceServiceMock: any;
	let fileSystemServiceMock: any;
	let configServiceMock: any;

	beforeEach(() => {
		// Create mocks for dependencies
		cliInterfaceServiceMock = {
			clear: vi.fn(),
			confirm: vi.fn(),
			handleError: vi.fn(),
			info: vi.fn(),
			intro: vi.fn(),
			multiselect: vi.fn(),
			note: vi.fn(),
			outro: vi.fn(),
			select: vi.fn(),
			spinner: vi.fn(),
			startSpinner: vi.fn(),
			stopSpinner: vi.fn(),
			text: vi.fn(),
			warn: vi.fn(),
		};

		fileSystemServiceMock = {
			absolutePath: vi.fn(),
			createDirectory: vi.fn().mockResolvedValue(undefined),
			createFile: vi.fn(),
			isPathExists: vi.fn().mockResolvedValue(false),
			readFile: vi.fn(),
			writeFile: vi.fn().mockResolvedValue(undefined),
		};

		configServiceMock = {
			getModuleConfig: vi.fn().mockResolvedValue(null),
			isModuleEnabled: vi.fn().mockResolvedValue(false),
		};

		// Create instance of service
		ideModuleService = new IdeModuleService(cliInterfaceServiceMock, fileSystemServiceMock, configServiceMock);
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing files are found", async () => {
			// Mock private method findExistingConfigFiles to return empty array
			vi.spyOn(ideModuleService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await ideModuleService.handleExistingSetup();

			expect(result).toBe(true);
			expect(cliInterfaceServiceMock.warn).not.toHaveBeenCalled();
			expect(cliInterfaceServiceMock.confirm).not.toHaveBeenCalled();
		});

		it("should ask for confirmation when existing files are found", async () => {
			// Mock private method findExistingConfigFiles to return some files
			vi.spyOn(ideModuleService as any, "findExistingConfigFiles").mockResolvedValue([".vscode/settings.json"]);

			cliInterfaceServiceMock.confirm.mockResolvedValue(true);

			const result = await ideModuleService.handleExistingSetup();

			expect(result).toBe(true);
			expect(cliInterfaceServiceMock.warn).toHaveBeenCalledWith(expect.stringContaining(IDE_CONFIG_MESSAGES.existingFilesFound));
			expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.confirmContinue, false);
		});
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			cliInterfaceServiceMock.confirm.mockResolvedValue(true);
			configServiceMock.isModuleEnabled.mockResolvedValue(false);

			const result = await ideModuleService.shouldInstall();

			expect(result).toBe(true);
			expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.confirmSetup, false);
		});

		it("should return false when user rejects installation", async () => {
			cliInterfaceServiceMock.confirm.mockResolvedValue(false);

			const result = await ideModuleService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should use saved configuration if available", async () => {
			cliInterfaceServiceMock.confirm.mockResolvedValue(true);
			configServiceMock.isModuleEnabled.mockResolvedValue(true);

			const result = await ideModuleService.shouldInstall();

			expect(result).toBe(true);
			expect(configServiceMock.isModuleEnabled).toHaveBeenCalledWith(EModule.IDE);
			expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.confirmSetup, true);
		});
	});

	describe("install", () => {
		beforeEach(() => {
			// Setup default mocks for the install method
			cliInterfaceServiceMock.confirm.mockResolvedValue(true);
			cliInterfaceServiceMock.multiselect.mockResolvedValue([EIde.VS_CODE]);

			// Mock private methods
			vi.spyOn(ideModuleService as any, "selectIdes").mockResolvedValue([EIde.VS_CODE]);

			vi.spyOn(ideModuleService as any, "handleExistingSetup").mockResolvedValue(true);

			vi.spyOn(ideModuleService as any, "setupSelectedIdes").mockResolvedValue(undefined);

			// Set properties directly to simulate selected state
			(ideModuleService as any).selectedIdes = [EIde.VS_CODE];
		});

		it("should successfully install IDE configurations", async () => {
			const result = await ideModuleService.install();

			expect(result).toEqual({
				customProperties: {
					ides: [EIde.VS_CODE],
				},
				wasInstalled: true,
			});
		});

		it("should call selectIdes with empty array when config.ides is undefined", async () => {
			configServiceMock.getModuleConfig.mockResolvedValue({
				/* no ides property */
			});
			const selectIdesSpy = vi.spyOn(ideModuleService as any, "selectIdes");

			await ideModuleService.install();

			// This tests line 77: this.selectedIdes = await this.selectIdes(this.config?.ides ?? []);
			expect(selectIdesSpy).toHaveBeenCalledWith([]);
		});

		it("should return wasInstalled: false when shouldInstall returns false", async () => {
			vi.spyOn(ideModuleService, "shouldInstall").mockResolvedValue(false);

			const result = await ideModuleService.install();

			expect(result).toEqual({ wasInstalled: false });
		});

		it("should return wasInstalled: false when no IDEs are selected", async () => {
			vi.spyOn(ideModuleService as any, "selectIdes").mockResolvedValue([]);

			const result = await ideModuleService.install();

			expect(result).toEqual({ wasInstalled: false });
			expect(cliInterfaceServiceMock.warn).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.noIdesSelected);
		});

		it("should return wasInstalled: false when user cancels due to existing setup", async () => {
			vi.spyOn(ideModuleService as any, "handleExistingSetup").mockResolvedValue(false);

			const result = await ideModuleService.install();

			expect(result).toEqual({ wasInstalled: false });
			expect(cliInterfaceServiceMock.warn).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.setupCancelledByUser);
		});

		it("should handle and re-throw errors during installation", async () => {
			const error = new Error("Test error");
			vi.spyOn(ideModuleService as any, "setupSelectedIdes").mockRejectedValue(error);

			await expect(ideModuleService.install()).rejects.toThrow("Test error");

			expect(cliInterfaceServiceMock.handleError).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.failedSetupError, error);
		});
	});

	describe("Private methods", () => {
		describe("selectIdes", () => {
			it("should prompt user to select IDEs", async () => {
				cliInterfaceServiceMock.multiselect.mockResolvedValue([EIde.VS_CODE]);

				const result = await (ideModuleService as any).selectIdes();

				expect(result).toEqual([EIde.VS_CODE]);
				expect(cliInterfaceServiceMock.multiselect).toHaveBeenCalledWith(
					IDE_CONFIG_MESSAGES.selectIdesPrompt,
					expect.arrayContaining([
						expect.objectContaining({
							value: EIde.VS_CODE,
							label: "VS Code",
						}),
					]),
					true,
					undefined,
				);
			});

			it("should use saved IDEs as default if provided", async () => {
				cliInterfaceServiceMock.multiselect.mockResolvedValue([EIde.VS_CODE, EIde.INTELLIJ_IDEA]);

				const result = await (ideModuleService as any).selectIdes([EIde.VS_CODE]);

				expect(result).toEqual([EIde.VS_CODE, EIde.INTELLIJ_IDEA]);
				expect(cliInterfaceServiceMock.multiselect).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.selectIdesPrompt, expect.any(Array), true, [EIde.VS_CODE]);
			});

			it("should filter out invalid saved IDE values", async () => {
				cliInterfaceServiceMock.multiselect.mockResolvedValue([EIde.VS_CODE]);

				// Pass an invalid IDE value along with a valid one
				const result = await (ideModuleService as any).selectIdes([EIde.VS_CODE, "invalid-ide" as EIde]);

				expect(result).toEqual([EIde.VS_CODE]);
				// Should only include the valid IDE in the initial selection
				expect(cliInterfaceServiceMock.multiselect).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.selectIdesPrompt, expect.any(Array), true, [EIde.VS_CODE]);
			});
		});

		describe("setupIde", () => {
			it("should create configuration files for the IDE", async () => {
				const result = await (ideModuleService as any).setupIde(EIde.VS_CODE);

				expect(result).toEqual({
					ide: EIde.VS_CODE,
					isSuccess: true,
				});

				// Should create directory for each config file
				expect(fileSystemServiceMock.createDirectory).toHaveBeenCalledWith(".vscode/settings.json", { isRecursive: true });

				// Should write the file with the template content
				expect(fileSystemServiceMock.writeFile).toHaveBeenCalledWith(".vscode/settings.json", expect.any(String));
			});

			it("should handle errors during setup", async () => {
				fileSystemServiceMock.createDirectory.mockRejectedValue(new Error("Directory error"));

				const result = await (ideModuleService as any).setupIde(EIde.VS_CODE);

				expect(result).toEqual({
					ide: EIde.VS_CODE,
					isSuccess: false,
					error: expect.objectContaining({
						message: "Directory error",
					}),
				});
			});
		});

		describe("setupSelectedIdes", () => {
			beforeEach(() => {
				// Set selectedIdes property for testing
				(ideModuleService as any).selectedIdes = [EIde.VS_CODE, EIde.INTELLIJ_IDEA];

				// Mock setupIde method
				vi.spyOn(ideModuleService as any, "setupIde").mockImplementation((ide) => {
					if (ide === EIde.VS_CODE) {
						return Promise.resolve({ ide, isSuccess: true });
					} else {
						return Promise.resolve({
							ide,
							isSuccess: false,
							error: new Error("Test error"),
						});
					}
				});
			});

			it("should set up all selected IDEs and display summary", async () => {
				await (ideModuleService as any).setupSelectedIdes();

				// Should call setupIde for each selected IDE
				expect((ideModuleService as any).setupIde).toHaveBeenCalledWith(EIde.VS_CODE);
				expect((ideModuleService as any).setupIde).toHaveBeenCalledWith(EIde.INTELLIJ_IDEA);

				// Should use spinner
				expect(cliInterfaceServiceMock.startSpinner).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.settingUpSpinner);
				expect(cliInterfaceServiceMock.stopSpinner).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.setupCompleteSpinner);

				// Should display setup summary
				expect(cliInterfaceServiceMock.note).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.setupSummaryTitle, expect.stringContaining(IDE_CONFIG_MESSAGES.successfulConfiguration));
			});

			it("should handle and re-throw errors", async () => {
				// Instead of mocking Promise.all which is causing issues,
				// let's make one of the method calls throw an error
				vi.spyOn(ideModuleService as any, "setupIde").mockRejectedValueOnce(new Error("Setup error"));

				await expect((ideModuleService as any).setupSelectedIdes()).rejects.toThrow("Setup error");

				// Should stop spinner when error occurs
				expect(cliInterfaceServiceMock.stopSpinner).toHaveBeenCalled();
			});
		});

		describe("findExistingConfigFiles", () => {
			beforeEach(() => {
				// Set selectedIdes property for testing
				(ideModuleService as any).selectedIdes = [EIde.VS_CODE];
			});

			it("should return empty array when no files exist", async () => {
				fileSystemServiceMock.isPathExists.mockResolvedValue(false);

				const result = await (ideModuleService as any).findExistingConfigFiles();

				expect(result).toEqual([]);
				expect(fileSystemServiceMock.isPathExists).toHaveBeenCalledWith(IDE_CONFIG[EIde.VS_CODE].content[0].filePath);
			});

			it("should return array of existing file paths", async () => {
				fileSystemServiceMock.isPathExists.mockResolvedValue(true);

				const result = await (ideModuleService as any).findExistingConfigFiles();

				// Should include the file path for existing configuration
				expect(result).toEqual([IDE_CONFIG[EIde.VS_CODE].content[0].filePath]);
			});

			it("should check all configuration files for all selected IDEs", async () => {
				// Set multiple IDEs with multiple config files
				(ideModuleService as any).selectedIdes = [EIde.VS_CODE, EIde.INTELLIJ_IDEA];

				// Mock isPathExists to return true for some files
				fileSystemServiceMock.isPathExists.mockImplementation((path: string) => {
					return Promise.resolve(path === ".vscode/settings.json");
				});

				const result = await (ideModuleService as any).findExistingConfigFiles();

				// Should only include paths that exist
				expect(result).toEqual([".vscode/settings.json"]);

				// Should check all config files (VS Code has 1, IntelliJ has 2)
				expect(fileSystemServiceMock.isPathExists).toHaveBeenCalledTimes(3);
			});
		});

		describe("displaySetupSummary", () => {
			it("should display successful and failed IDE configurations", () => {
				const successful = [{ ide: EIde.VS_CODE }];
				const failed = [{ ide: EIde.INTELLIJ_IDEA, error: new Error("Setup failed") }];

				(ideModuleService as any).displaySetupSummary(successful, failed);

				// Should display note with summary
				expect(cliInterfaceServiceMock.note).toHaveBeenCalledWith(IDE_CONFIG_MESSAGES.setupSummaryTitle, expect.stringContaining(IDE_CONFIG_MESSAGES.successfulConfiguration));

				// Check both success and failure messages
				const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
				expect(summaryMessage).toContain("✓ VS Code");
				expect(summaryMessage).toContain("✗ IntelliJ IDEA - Setup failed");
			});

			it('should use "Unknown error" when error has no message property', () => {
				const successful = [{ ide: EIde.VS_CODE }];
				// Create error without message property to test line 132
				const failed = [{ ide: EIde.INTELLIJ_IDEA, error: {} as Error }];

				(ideModuleService as any).displaySetupSummary(successful, failed);

				const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
				expect(summaryMessage).toContain(`✗ IntelliJ IDEA - ${IDE_CONFIG_MESSAGES.unknownError}`);
			});

			it("should only display successful configurations when no failures", () => {
				const successful = [{ ide: EIde.VS_CODE }, { ide: EIde.INTELLIJ_IDEA }];

				(ideModuleService as any).displaySetupSummary(successful, []);

				const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
				expect(summaryMessage).toContain("✓ VS Code");
				expect(summaryMessage).toContain("✓ IntelliJ IDEA");
				expect(summaryMessage).not.toContain("Failed configurations:");
			});
		});
	});
});
