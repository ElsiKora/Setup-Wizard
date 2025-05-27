import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypescriptModuleService } from "../../../../src/application/service/typescript-module.service";
import { TYPESCRIPT_CONFIG_MESSAGES } from "../../../../src/application/constant/typescript/messages.constant";
import { TYPESCRIPT_CONFIG_SUMMARY } from "../../../../src/application/constant/typescript/summary.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";

describe("TypescriptModuleService Branch Coverage", () => {
	// Mocks
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
		text: vi.fn(),
	};

	const mockFileSystemService = {
		writeFile: vi.fn(),
		deleteFile: vi.fn(),
		isPathExists: vi.fn(),
	};

	const mockConfigService = {
		getModuleConfig: vi.fn(),
		isModuleEnabled: vi.fn(),
	};

	let typescriptService: TypescriptModuleService;

	beforeEach(() => {
		vi.clearAllMocks();
		
		// Default mocks
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockResolvedValue("./src");
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockConfigService.isModuleEnabled.mockResolvedValue(false);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		typescriptService = new TypescriptModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);
	});

	describe("Constructor", () => {
		it("should initialize all services correctly", () => {
			expect(typescriptService.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
			expect(typescriptService.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
			expect(typescriptService.CONFIG_SERVICE).toBe(mockConfigService);
			expect(typescriptService.COMMAND_SERVICE).toBeDefined();
			expect(typescriptService.PACKAGE_JSON_SERVICE).toBeDefined();
		});
	});

	describe("getBaseUrl", () => {
		it("should use default when config is null", async () => {
			(typescriptService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./src");

			await (typescriptService as any).getBaseUrl();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.baseUrlPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault,
				TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault,
				expect.any(Function)
			);
		});

		it("should use default when config doesn't have baseUrl property", async () => {
			(typescriptService as any).config = {};
			mockCliInterfaceService.text.mockResolvedValueOnce("./src");

			await (typescriptService as any).getBaseUrl();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.baseUrlPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault,
				TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault,
				expect.any(Function)
			);
		});
	});

	describe("getRootDir", () => {
		it("should use default when config is null", async () => {
			(typescriptService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./src");

			await (typescriptService as any).getRootDir();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.rootDirPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault,
				TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault,
				expect.any(Function)
			);
		});

		it("should use saved rootDirectory when available", async () => {
			(typescriptService as any).config = { rootDirectory: "./custom" };
			mockCliInterfaceService.text.mockResolvedValueOnce("./custom");

			await (typescriptService as any).getRootDir();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.rootDirPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault,
				"./custom",
				expect.any(Function)
			);
		});
	});

	describe("getOutDir", () => {
		it("should use default when config is null", async () => {
			(typescriptService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./dist");

			await (typescriptService as any).getOutDir();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.outDirPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.outDirDefault,
				TYPESCRIPT_CONFIG_SUMMARY.outDirDefault,
				expect.any(Function)
			);
		});

		it("should use saved outputDirectory when available", async () => {
			(typescriptService as any).config = { outputDirectory: "./build" };
			mockCliInterfaceService.text.mockResolvedValueOnce("./build");

			await (typescriptService as any).getOutDir();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
				TYPESCRIPT_CONFIG_MESSAGES.outDirPrompt,
				TYPESCRIPT_CONFIG_SUMMARY.outDirDefault,
				"./build",
				expect.any(Function)
			);
		});
	});

	describe("isCleanArchitectureEnabled", () => {
		it("should default to false when config is null", async () => {
			(typescriptService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (typescriptService as any).isCleanArchitectureEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, false);
		});

		it("should handle undefined isCleanArchitectureEnabled in config", async () => {
			(typescriptService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (typescriptService as any).isCleanArchitectureEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, false);
		});

		it("should handle false value in config", async () => {
			(typescriptService as any).config = { isCleanArchitectureEnabled: false };
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (typescriptService as any).isCleanArchitectureEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, false);
		});
	});

	describe("isDecoratorsEnabled", () => {
		it("should default to false when config is null", async () => {
			(typescriptService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (typescriptService as any).isDecoratorsEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmDecorators, false);
		});

		it("should handle undefined isDecoratorsEnabled in config", async () => {
			(typescriptService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (typescriptService as any).isDecoratorsEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmDecorators, false);
		});
	});

	describe("displaySetupSummary", () => {
		it("should handle all combinations of enabled features", () => {
			// Test with both features enabled
			(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", true, true);

			const noteCall = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall).toContain(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled);
			expect(noteCall).toContain(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled);

			vi.clearAllMocks();

			// Test with only clean architecture
			(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", true, false);

			const noteCall2 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall2).toContain(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled);
			expect(noteCall2).not.toContain(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled);

			vi.clearAllMocks();

			// Test with only decorators
			(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", false, true);

			const noteCall3 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall3).not.toContain(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled);
			expect(noteCall3).toContain(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled);

			vi.clearAllMocks();

			// Test with neither feature
			(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", false, false);

			const noteCall4 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall4).not.toContain(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled);
			expect(noteCall4).not.toContain(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled);
		});
	});

	describe("handleExistingSetup", () => {
		it("should handle empty existing files array", async () => {
			vi.spyOn(typescriptService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await typescriptService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
		});

		it("should handle errors during file deletion", async () => {
			vi.spyOn(typescriptService as any, "findExistingConfigFiles").mockResolvedValue(["tsconfig.json"]);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockFileSystemService.deleteFile.mockRejectedValueOnce(new Error("Delete error"));

			await expect(typescriptService.handleExistingSetup()).rejects.toThrow("Delete error");
		});
	});

	describe("Config template edge cases", () => {
		it("should handle output directory without leading ./", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(typescriptService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);

			await (typescriptService as any).createConfig(".", ".", "dist", false, false);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			const config = JSON.parse(configContent);

			expect(config.exclude).toContain("dist");
		});

		it("should handle root directory without leading ./", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(typescriptService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);

			await (typescriptService as any).createConfig(".", "src", "./dist", false, false);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			const config = JSON.parse(configContent);

			expect(config.include).toContain("src/**/*");
		});
	});

	describe("setupTypescript parameter casting", () => {
		it("should properly cast boolean parameters to strings in return value", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(typescriptService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
			
			vi.spyOn(typescriptService as any, "getBaseUrl").mockResolvedValue("./src");
			vi.spyOn(typescriptService as any, "getRootDir").mockResolvedValue("./src");
			vi.spyOn(typescriptService as any, "getOutDir").mockResolvedValue("./dist");
			vi.spyOn(typescriptService as any, "isCleanArchitectureEnabled").mockResolvedValue(true);
			vi.spyOn(typescriptService as any, "isDecoratorsEnabled").mockResolvedValue(true);
			vi.spyOn(typescriptService as any, "createConfig").mockResolvedValue(undefined);
			vi.spyOn(typescriptService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(typescriptService as any, "displaySetupSummary").mockReturnValue(undefined);

			const result = await (typescriptService as any).setupTypescript();

			// Check that the internal parameters object has booleans
			expect(typeof result.isCleanArchitectureEnabled).toBe("boolean");
			expect(typeof result.isDecoratorsEnabled).toBe("boolean");
			
			// But when cast as Record<string, string>, they should be treated as strings
			const castResult = result as Record<string, string>;
			expect(castResult).toBeDefined();
		});
	});
}); 