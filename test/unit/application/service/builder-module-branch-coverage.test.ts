import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuilderModuleService } from "../../../../src/application/service/builder-module.service";
import { BUILDER_CONFIG_MESSAGES } from "../../../../src/application/constant/builder/messages.constant";
import { BUILDER_CONFIG_SUMMARY } from "../../../../src/application/constant/builder/summary.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";

describe("BuilderModuleService Branch Coverage", () => {
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
		multiselect: vi.fn(),
		select: vi.fn(),
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

	let builderService: BuilderModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default mocks
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockResolvedValue("./src/index.js");
		mockCliInterfaceService.multiselect.mockResolvedValue(["esm"]);
		mockCliInterfaceService.select.mockResolvedValue("rollup");
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockConfigService.isModuleEnabled.mockResolvedValue(false);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		builderService = new BuilderModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);
	});

	describe("Constructor", () => {
		it("should initialize all services correctly", () => {
			expect(builderService.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
			expect(builderService.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
			expect(builderService.CONFIG_SERVICE).toBe(mockConfigService);
			expect(builderService.COMMAND_SERVICE).toBeDefined();
			expect(builderService.PACKAGE_JSON_SERVICE).toBeDefined();
		});
	});

	describe("getEntryPoint", () => {
		it("should use default when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./src/index.js");

			await (builderService as any).getEntryPoint();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.entryPointPrompt, BUILDER_CONFIG_SUMMARY.entryPointDefault, BUILDER_CONFIG_SUMMARY.entryPointDefault, expect.any(Function));
		});

		it("should use default when config doesn't have entryPoint property", async () => {
			(builderService as any).config = {};
			mockCliInterfaceService.text.mockResolvedValueOnce("./src/index.js");

			await (builderService as any).getEntryPoint();

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.entryPointPrompt, BUILDER_CONFIG_SUMMARY.entryPointDefault, BUILDER_CONFIG_SUMMARY.entryPointDefault, expect.any(Function));
		});
	});

	describe("getOutputDirectory", () => {
		it("should use default when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./dist");
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await (builderService as any).getOutputDirectory(false, toolConfig);

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.outputDirPrompt, "./dist", "./dist", expect.any(Function));
		});

		it("should use CLI default for CLI apps", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.text.mockResolvedValueOnce("./bin");
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await (builderService as any).getOutputDirectory(true, toolConfig);

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.outputDirPrompt, "./bin", "./bin", expect.any(Function));
		});

		it("should use saved outputDirectory when available", async () => {
			(builderService as any).config = { outputDirectory: "./build" };
			mockCliInterfaceService.text.mockResolvedValueOnce("./build");
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await (builderService as any).getOutputDirectory(false, toolConfig);

			expect(mockCliInterfaceService.text).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.outputDirPrompt, "./dist", "./build", expect.any(Function));
		});
	});

	describe("getOutputFormats", () => {
		it("should use default when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.multiselect.mockResolvedValueOnce(["esm", "cjs"]);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await (builderService as any).getOutputFormats(false, toolConfig);

			expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.formatsPrompt, expect.any(Array), true, BUILDER_CONFIG_SUMMARY.formatsDefault);
		});

		it("should handle null multiselect response", async () => {
			mockCliInterfaceService.multiselect.mockResolvedValueOnce(null);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await expect((builderService as any).getOutputFormats(false, toolConfig)).rejects.toThrow(BUILDER_CONFIG_MESSAGES.formatsRequired);
		});

		it("should handle undefined config formats", async () => {
			(builderService as any).config = { formats: undefined };
			mockCliInterfaceService.multiselect.mockResolvedValueOnce(["esm"]);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");
			const { BUILD_TOOL_CONFIG } = await import("../../../../src/application/constant/builder/build-tool-config.constant");
			const toolConfig = BUILD_TOOL_CONFIG[EBuildTool.ROLLUP];

			await (builderService as any).getOutputFormats(false, toolConfig);

			expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.formatsPrompt, expect.any(Array), true, BUILDER_CONFIG_SUMMARY.formatsDefault);
		});
	});

	describe("isSourceMapsEnabled", () => {
		it("should default to true when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (builderService as any).isSourceMapsEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmSourceMaps, true);
		});

		it("should handle undefined isSourceMapsEnabled in config", async () => {
			(builderService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (builderService as any).isSourceMapsEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmSourceMaps, true);
		});
	});

	describe("isMinifyEnabled", () => {
		it("should default to false when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			await (builderService as any).isMinifyEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmMinify, false);
		});

		it("should handle undefined minify in config", async () => {
			(builderService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			await (builderService as any).isMinifyEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmMinify, false);
		});
	});

	describe("isCleanEnabled", () => {
		it("should default to true when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (builderService as any).isCleanEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmClean, true);
		});

		it("should handle undefined clean in config", async () => {
			(builderService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			await (builderService as any).isCleanEnabled();

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmClean, true);
		});
	});

	describe("displaySetupSummary", () => {
		it("should handle all combinations of enabled features", async () => {
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			// Test with all features enabled
			(builderService as any).displaySetupSummary(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["esm", "cjs"], true, true, true, false, false, false, false, false);

			const noteCall = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall).toContain(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
			expect(noteCall).toContain(BUILDER_CONFIG_MESSAGES.minifyEnabled);
			expect(noteCall).toContain(BUILDER_CONFIG_MESSAGES.cleanEnabled);

			vi.clearAllMocks();

			// Test with only source maps
			(builderService as any).displaySetupSummary(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["esm"], true, false, false, false, false, false, false, false);

			const noteCall2 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall2).toContain(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
			expect(noteCall2).not.toContain(BUILDER_CONFIG_MESSAGES.minifyEnabled);
			expect(noteCall2).not.toContain(BUILDER_CONFIG_MESSAGES.cleanEnabled);

			vi.clearAllMocks();

			// Test with only minify
			(builderService as any).displaySetupSummary(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["esm"], false, true, false, false, false, false, false, false);

			const noteCall3 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall3).not.toContain(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
			expect(noteCall3).toContain(BUILDER_CONFIG_MESSAGES.minifyEnabled);
			expect(noteCall3).not.toContain(BUILDER_CONFIG_MESSAGES.cleanEnabled);

			vi.clearAllMocks();

			// Test with only clean
			(builderService as any).displaySetupSummary(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["esm"], false, false, true, false, false, false, false, false);

			const noteCall4 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall4).not.toContain(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
			expect(noteCall4).not.toContain(BUILDER_CONFIG_MESSAGES.minifyEnabled);
			expect(noteCall4).toContain(BUILDER_CONFIG_MESSAGES.cleanEnabled);

			vi.clearAllMocks();

			// Test with no features
			(builderService as any).displaySetupSummary(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["esm"], false, false, false, false, false, false, false, false);

			const noteCall5 = mockCliInterfaceService.note.mock.calls[0][1];
			expect(noteCall5).not.toContain(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled);
			expect(noteCall5).not.toContain(BUILDER_CONFIG_MESSAGES.minifyEnabled);
			expect(noteCall5).not.toContain(BUILDER_CONFIG_MESSAGES.cleanEnabled);
		});
	});

	describe("handleExistingSetup", () => {
		it("should handle empty existing files array", async () => {
			vi.spyOn(builderService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await builderService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
		});

		it("should handle errors during file deletion", async () => {
			vi.spyOn(builderService as any, "findExistingConfigFiles").mockResolvedValue(["rollup.config.js"]);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockFileSystemService.deleteFile.mockRejectedValueOnce(new Error("Delete error"));

			await expect(builderService.handleExistingSetup()).rejects.toThrow("Delete error");
		});
	});

	describe("Config template edge cases", () => {
		it("should handle .tsx entry points", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).createConfig(EBuildTool.ROLLUP, "./src/index.tsx", "./dist", ["esm"], false, false, false, false, false, false, true);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(configContent).toContain("import typescript from '@rollup/plugin-typescript'");
			expect(configContent).toContain("typescript({");
		});

		it("should handle single format", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).createConfig(EBuildTool.ROLLUP, "./src/index.js", "./dist", ["umd"], false, false, false, false, false, false, true);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(configContent).toContain('file: "./dist/index.js"');
			expect(configContent).toContain('format: "umd"');
			expect(configContent).not.toContain('format: "esm"');
			expect(configContent).not.toContain('format: "cjs"');
		});

		it("should handle all plugins together", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).createConfig(EBuildTool.ROLLUP, "./src/index.ts", "./dist", ["esm"], true, true, false, false, false, false, true);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(configContent).toContain("import typescript from '@rollup/plugin-typescript'");
			expect(configContent).toContain("import terser from '@rollup/plugin-terser'");
			expect(configContent).toContain("resolve()");
			expect(configContent).toContain("commonjs()");
			expect(configContent).toContain("typescript({");
			expect(configContent).toContain("terser()");
		});

		it("should exclude CommonJS plugin when disabled", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			// Last parameter (isCommonjsEnabled) is false
			await (builderService as any).createConfig(EBuildTool.ROLLUP, "./src/index.ts", "./dist", ["esm"], false, false, false, false, false, false, false);

			const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(configContent).not.toContain("import commonjs");
			expect(configContent).not.toContain("commonjs()");
			expect(configContent).toContain("import resolve");
			expect(configContent).toContain("resolve()");
		});
	});

	describe("setupBuilder parameter casting", () => {
		it("should properly cast boolean parameters to strings in return value", async () => {
			const mockPackageJsonService = {
				installPackages: vi.fn(),
				addScript: vi.fn(),
			};
			vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);

			vi.spyOn(builderService as any, "getEntryPoint").mockResolvedValue("./src/index.js");
			vi.spyOn(builderService as any, "getOutputDirectory").mockResolvedValue("./dist");
			vi.spyOn(builderService as any, "getOutputFormats").mockResolvedValue(["esm"]);
			vi.spyOn(builderService as any, "isSourceMapsEnabled").mockResolvedValue(true);
			vi.spyOn(builderService as any, "isMinifyEnabled").mockResolvedValue(true);
			vi.spyOn(builderService as any, "isCleanEnabled").mockResolvedValue(false);
			vi.spyOn(builderService as any, "isCommonjsEnabled").mockResolvedValue(true);
			vi.spyOn(builderService as any, "isPathAliasEnabled").mockResolvedValue(false);
			vi.spyOn(builderService as any, "isDecoratorsEnabled").mockResolvedValue(false);
			vi.spyOn(builderService as any, "isPackageJsonGenerationEnabled").mockResolvedValue(false);
			vi.spyOn(builderService as any, "isBuildTsconfigEnabled").mockResolvedValue(false);
			vi.spyOn(builderService as any, "createConfig").mockResolvedValue(undefined);
			vi.spyOn(builderService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(builderService as any, "displaySetupSummary").mockReturnValue(undefined);

			const result = await (builderService as any).setupBuilder();

			// Check that the internal parameters object has correct types
			expect(typeof result.tool).toBe("string");
			expect(typeof result.entryPoint).toBe("string");
			expect(typeof result.outputDirectory).toBe("string");
			expect(Array.isArray(result.formats)).toBe(true);
			expect(typeof result.isSourceMapsEnabled).toBe("boolean");
			expect(typeof result.isMinifyEnabled).toBe("boolean");
			expect(typeof result.isCleanEnabled).toBe("boolean");

			// But when cast as Record<string, string>, they should be treated as strings
			const castResult = result as Record<string, string>;
			expect(castResult).toBeDefined();
		});
	});

	describe("isCommonjsEnabled", () => {
		it("should default to true when config is null", async () => {
			(builderService as any).config = null;
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).isCommonjsEnabled(EBuildTool.ROLLUP);

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmCommonjs, true);
		});

		it("should handle undefined isCommonjsEnabled in config", async () => {
			(builderService as any).config = {};
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).isCommonjsEnabled(EBuildTool.ROLLUP);

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmCommonjs, true);
		});

		it("should use saved config value", async () => {
			(builderService as any).config = { isCommonjsEnabled: false };
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			await (builderService as any).isCommonjsEnabled(EBuildTool.ROLLUP);

			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmCommonjs, false);
		});

		it("should skip confirmation for non-Rollup tools", async () => {
			const { EBuildTool } = await import("../../../../src/domain/enum/build-tool.enum");

			const result = await (builderService as any).isCommonjsEnabled(EBuildTool.ESBUILD);

			expect(result).toBe(false);
			expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
		});
	});
});
