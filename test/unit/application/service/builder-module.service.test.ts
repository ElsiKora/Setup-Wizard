import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuilderModuleService } from "../../../../src/application/service/builder-module.service";
import { BUILDER_CONFIG_FILE_NAME } from "../../../../src/application/constant/builder/config-file-name.constant";
import { BUILDER_CONFIG } from "../../../../src/application/constant/builder/config.constant";
import { BUILDER_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/builder/core-dependencies.constant";
import { BUILDER_CONFIG_FILE_NAMES } from "../../../../src/application/constant/builder/file-names.constant";
import { BUILDER_CONFIG_MESSAGES } from "../../../../src/application/constant/builder/messages.constant";
import { BUILDER_CONFIG_SCRIPTS } from "../../../../src/application/constant/builder/scripts.constant";
import { BUILDER_CONFIG_SUMMARY } from "../../../../src/application/constant/builder/summary.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

describe("BuilderModuleService", () => {
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
	};

	const mockFileSystemService = {
		writeFile: vi.fn(),
		readFile: vi.fn(),
		deleteFile: vi.fn(),
		isPathExists: vi.fn(),
	};

	const mockConfigService = {
		getModuleConfig: vi.fn(),
		isModuleEnabled: vi.fn(),
	};

	// Mock PackageJsonService
	const mockPackageJsonService = {
		installPackages: vi.fn(),
		addScript: vi.fn(),
	};

	// Service instance
	let builderService: BuilderModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockResolvedValue("./src/index.js");
		mockCliInterfaceService.multiselect.mockResolvedValue(["esm", "cjs"]);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		// Create service instance with mocks
		builderService = new BuilderModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(builderService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await builderService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmSetup, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await builderService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await builderService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(builderService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await builderService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(builderService as any, "findExistingConfigFiles").mockResolvedValue(["rollup.config.js", "webpack.config.js"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await builderService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(builderService as any, "findExistingConfigFiles").mockResolvedValue(["rollup.config.js"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await builderService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.existingFilesAborted);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("install", () => {
		it("should install builder when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(builderService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(builderService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(builderService as any, "setupBuilder").mockResolvedValue({
				tool: "rollup",
				entryPoint: "./src/index.js",
				outputDirectory: "./dist",
				formats: '["esm","cjs"]',
				isSourceMapsEnabled: "true",
				isMinifyEnabled: "false",
				isCleanEnabled: "true",
			});

			const result = await builderService.install();

			expect(result).toEqual({
				wasInstalled: true,
				customProperties: {
					tool: "rollup",
					entryPoint: "./src/index.js",
					outputDirectory: "./dist",
					formats: '["esm","cjs"]',
					isSourceMapsEnabled: "true",
					isMinifyEnabled: "false",
					isCleanEnabled: "true",
				},
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(builderService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(builderService as any, "setupBuilder").mockResolvedValue({});

			const result = await builderService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should not install when handling existing setup fails", async () => {
			vi.spyOn(builderService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(builderService, "handleExistingSetup").mockResolvedValue(false);
			const setupSpy = vi.spyOn(builderService as any, "setupBuilder").mockResolvedValue({});

			const result = await builderService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(builderService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(builderService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(builderService as any, "setupBuilder").mockRejectedValue(new Error("Test error"));

			await expect(builderService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});

		it("should use saved config when available", async () => {
			mockConfigService.getModuleConfig.mockResolvedValueOnce({
				tool: "rollup",
				entryPoint: "./custom/index.ts",
				outputDirectory: "./build",
				formats: ["esm"],
				isSourceMapsEnabled: false,
				isMinifyEnabled: true,
				isCleanEnabled: false,
			});

			vi.spyOn(builderService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(builderService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(builderService as any, "setupBuilder").mockResolvedValue({});

			await builderService.install();

			expect(mockConfigService.getModuleConfig).toHaveBeenCalledWith(EModule.BUILDER);
		});
	});

	describe("private methods", () => {
		describe("getEntryPoint", () => {
			it("should prompt for entry point with validation", async () => {
				mockCliInterfaceService.text.mockResolvedValueOnce("./src/index.js");

				const result = await (builderService as any).getEntryPoint();

				expect(result).toBe("./src/index.js");
				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.entryPointPrompt,
					BUILDER_CONFIG_SUMMARY.entryPointDefault,
					BUILDER_CONFIG_SUMMARY.entryPointDefault,
					expect.any(Function)
				);
			});

			it("should validate entry point format", async () => {
				mockCliInterfaceService.text.mockImplementation((_message, _placeholder, _initial, validate) => {
					expect(validate("")).toBe(BUILDER_CONFIG_MESSAGES.entryPointRequired);
					expect(validate("./src/index")).toBe(BUILDER_CONFIG_MESSAGES.entryPointValidation);
					expect(validate("./src/index.js")).toBe(undefined);
					expect(validate("./src/index.ts")).toBe(undefined);
					expect(validate("./src/index.mjs")).toBe(undefined);
					expect(validate("./src/index.cjs")).toBe(undefined);
					expect(validate("./src/index.tsx")).toBe(undefined);
					return Promise.resolve("./src/index.js");
				});

				await (builderService as any).getEntryPoint();
			});

			it("should use saved config value as initial", async () => {
				(builderService as any).config = { entryPoint: "./custom/main.ts" };
				mockCliInterfaceService.text.mockResolvedValueOnce("./custom/main.ts");

				await (builderService as any).getEntryPoint();

				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.entryPointPrompt,
					BUILDER_CONFIG_SUMMARY.entryPointDefault,
					"./custom/main.ts",
					expect.any(Function)
				);
			});
		});

		describe("getOutputDirectory", () => {
			it("should prompt for output directory with validation", async () => {
				mockCliInterfaceService.text.mockResolvedValueOnce("./dist");

				const result = await (builderService as any).getOutputDirectory();

				expect(result).toBe("./dist");
				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.outputDirPrompt,
					BUILDER_CONFIG_SUMMARY.outputDirDefault,
					BUILDER_CONFIG_SUMMARY.outputDirDefault,
					expect.any(Function)
				);
			});

			it("should validate output directory format", async () => {
				mockCliInterfaceService.text.mockImplementation((_message, _placeholder, _initial, validate) => {
					expect(validate("")).toBe(BUILDER_CONFIG_MESSAGES.outputDirRequired);
					expect(validate("dist")).toBe(BUILDER_CONFIG_MESSAGES.outputDirValidation);
					expect(validate("./dist")).toBe(undefined);
					expect(validate(".")).toBe(undefined);
					expect(validate("../dist")).toBe(undefined);
					return Promise.resolve("./dist");
				});

				await (builderService as any).getOutputDirectory();
			});
		});

		describe("getOutputFormats", () => {
			it("should prompt for output formats with multiselect", async () => {
				mockCliInterfaceService.multiselect.mockResolvedValueOnce(["esm", "cjs"]);

				const result = await (builderService as any).getOutputFormats();

				expect(result).toEqual(["esm", "cjs"]);
				expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.formatsPrompt,
					expect.any(Array),
					true,
					BUILDER_CONFIG_SUMMARY.formatsDefault
				);
			});

			it("should throw error when no formats selected", async () => {
				mockCliInterfaceService.multiselect.mockResolvedValueOnce([]);

				await expect((builderService as any).getOutputFormats()).rejects.toThrow(BUILDER_CONFIG_MESSAGES.formatsRequired);
			});

			it("should use saved config formats as default", async () => {
				(builderService as any).config = { formats: ["umd"] };
				mockCliInterfaceService.multiselect.mockResolvedValueOnce(["umd"]);

				await (builderService as any).getOutputFormats();

				expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.formatsPrompt,
					expect.any(Array),
					true,
					["umd"]
				);
			});
		});

		describe("isSourceMapsEnabled", () => {
			it("should prompt for source maps with default true", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (builderService as any).isSourceMapsEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmSourceMaps, true);
			});

			it("should use saved config value as default", async () => {
				(builderService as any).config = { isSourceMapsEnabled: false };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (builderService as any).isSourceMapsEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmSourceMaps, false);
			});
		});

		describe("isMinifyEnabled", () => {
			it("should prompt for minification with default false", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				const result = await (builderService as any).isMinifyEnabled();

				expect(result).toBe(false);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmMinify, false);
			});

			it("should use saved config value as default", async () => {
				(builderService as any).config = { isMinifyEnabled: true };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				await (builderService as any).isMinifyEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmMinify, true);
			});
		});

		describe("isCleanEnabled", () => {
			it("should prompt for clean with default true", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (builderService as any).isCleanEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmClean, true);
			});

			it("should use saved config value as default", async () => {
				(builderService as any).config = { isCleanEnabled: false };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (builderService as any).isCleanEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.confirmClean, false);
			});
		});

		describe("createConfig", () => {
			it("should create config file with provided options", async () => {
				await (builderService as any).createConfig("./src/index.js", "./dist", ["esm", "cjs"], true, false, false, false, false, false, true);

				expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
					BUILDER_CONFIG_FILE_NAME,
					expect.any(String),
					"utf8"
				);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				expect(configContent).toContain("import resolve from '@rollup/plugin-node-resolve'");
				expect(configContent).toContain("import commonjs");
				expect(configContent).not.toContain("import typescript");
				expect(configContent).not.toContain("import terser");
				expect(configContent).toContain("input: \"./src/index.js\"");
				expect(configContent).toContain("dir: \"./dist/esm\"");
				expect(configContent).toContain("dir: \"./dist/cjs\"");
				expect(configContent).toContain("format: \"esm\"");
				expect(configContent).toContain("format: \"cjs\"");
				expect(configContent).toContain("sourcemap: true");
			});

			it("should include TypeScript plugin for .ts entry points", async () => {
				await (builderService as any).createConfig("./src/index.ts", "./dist", ["esm"], false, false, false, false, false, false, true);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				expect(configContent).toContain("import typescript from '@rollup/plugin-typescript'");
				expect(configContent).toContain("typescript({");
			});

			it("should include terser plugin when minification is enabled", async () => {
				await (builderService as any).createConfig("./src/index.js", "./dist", ["esm"], false, true, false, false, false, false, true);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				expect(configContent).toContain("import terser from '@rollup/plugin-terser'");
				expect(configContent).toContain("terser()");
			});

			it("should handle different output formats correctly", async () => {
				await (builderService as any).createConfig("./src/index.js", "./dist", ["esm", "cjs", "umd", "iife"], false, false, false, false, false, false, true);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				expect(configContent).toContain("dir: \"./dist/esm\"");
				expect(configContent).toContain("dir: \"./dist/cjs\"");
				expect(configContent).toContain("dir: \"./dist/umd\"");
				expect(configContent).toContain("dir: \"./dist/iife\"");
				expect(configContent).toMatch(/format: "esm"/);
				expect(configContent).toMatch(/format: "cjs"/);
				expect(configContent).toMatch(/format: "umd"/);
				expect(configContent).toMatch(/format: "iife"/);
			});
		});

		describe("setupScripts", () => {
			it("should add build scripts to package.json with clean enabled", async () => {
				await (builderService as any).setupScripts(true);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(3);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(
					BUILDER_CONFIG_SCRIPTS.build.name,
					BUILDER_CONFIG_SCRIPTS.build.command
				);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(
					BUILDER_CONFIG_SCRIPTS.buildWatch.name,
					BUILDER_CONFIG_SCRIPTS.buildWatch.command
				);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(
					BUILDER_CONFIG_SCRIPTS.prebuild.name,
					BUILDER_CONFIG_SCRIPTS.prebuild.command
				);
			});

			it("should skip prebuild script when clean is disabled", async () => {
				await (builderService as any).setupScripts(false);

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
				expect(mockPackageJsonService.addScript).not.toHaveBeenCalledWith(
					BUILDER_CONFIG_SCRIPTS.prebuild.name,
					BUILDER_CONFIG_SCRIPTS.prebuild.command
				);
			});
		});

		describe("findExistingConfigFiles", () => {
			it("should return file paths for existing config files", async () => {
				mockFileSystemService.isPathExists
					.mockResolvedValueOnce(true) // rollup.config.js exists
					.mockResolvedValueOnce(false) // rollup.config.mjs doesn't exist
					.mockResolvedValueOnce(false) // rollup.config.cjs doesn't exist
					.mockResolvedValueOnce(false) // rollup.config.ts doesn't exist
					.mockResolvedValueOnce(true) // webpack.config.js exists
					.mockResolvedValueOnce(false); // ... rest don't exist

				const result = await (builderService as any).findExistingConfigFiles();

				expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(BUILDER_CONFIG_FILE_NAMES.length);
				expect(result).toEqual(["rollup.config.js", "webpack.config.js"]);
			});

			it("should return empty array when no config files exist", async () => {
				mockFileSystemService.isPathExists.mockResolvedValue(false);

				const result = await (builderService as any).findExistingConfigFiles();

				expect(result).toEqual([]);
			});
		});

		describe("displaySetupSummary", () => {
			it("should display basic setup summary", () => {
				(builderService as any).displaySetupSummary("rollup", "./src/index.js", "./dist", ["esm", "cjs"], false, false, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.configurationCreated)
				);
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.summaryTool("rollup"))
				);
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.summaryEntryPoint("./src/index.js"))
				);
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.summaryOutputDirectory("./dist"))
				);
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.summaryFormats("esm, cjs"))
				);
			});

			it("should include source maps info when enabled", () => {
				(builderService as any).displaySetupSummary("rollup", "./src/index.js", "./dist", ["esm"], true, false, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.sourceMapsEnabled)
				);
			});

			it("should include minification info when enabled", () => {
				(builderService as any).displaySetupSummary("rollup", "./src/index.js", "./dist", ["esm"], false, true, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.minifyEnabled)
				);
			});

			it("should include clean info when enabled", () => {
				(builderService as any).displaySetupSummary("rollup", "./src/index.js", "./dist", ["esm"], false, false, true);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(
					BUILDER_CONFIG_MESSAGES.setupCompleteTitle,
					expect.stringContaining(BUILDER_CONFIG_MESSAGES.cleanEnabled)
				);
			});
		});

		describe("setupBuilder", () => {
			beforeEach(() => {
				vi.spyOn(builderService as any, "isCliApp").mockResolvedValue(false);
				vi.spyOn(builderService as any, "getEntryPoint").mockResolvedValue("./src/index.js");
				vi.spyOn(builderService as any, "getOutputDirectory").mockResolvedValue("./dist");
				vi.spyOn(builderService as any, "getOutputFormats").mockResolvedValue(["esm", "cjs"]);
				vi.spyOn(builderService as any, "isSourceMapsEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "isMinifyEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isCleanEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "isPathAliasEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isDecoratorsEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isPackageJsonGenerationEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isBuildTsconfigEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isCommonjsEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "createConfig").mockResolvedValue(undefined);
				vi.spyOn(builderService as any, "createBuildTsconfig").mockResolvedValue(undefined);
				vi.spyOn(builderService as any, "setupScripts").mockResolvedValue(undefined);
				vi.spyOn(builderService as any, "displaySetupSummary").mockReturnValue(undefined);
			});

			it("should set up builder configuration successfully", async () => {
				const result = await (builderService as any).setupBuilder();

				expect(result).toEqual({
					tool: "rollup",
					isCliApp: false,
					entryPoint: "./src/index.js",
					outputDirectory: "./dist",
					formats: ["esm", "cjs"],
					isSourceMapsEnabled: true,
					isMinifyEnabled: false,
					isCleanEnabled: true,
					isCommonjsEnabled: true,
					isPathAliasEnabled: false,
					isDecoratorsEnabled: false,
					isPackageJsonGenerationEnabled: false,
					isBuildTsconfigEnabled: false,
				});

				expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.settingUpSpinner);
				expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(
					[...BUILDER_CONFIG_CORE_DEPENDENCIES],
					"latest",
					EPackageJsonDependencyType.DEV
				);
				expect(builderService["createConfig"]).toHaveBeenCalledWith("./src/index.js", "./dist", ["esm", "cjs"], true, false, false, false, false, false, true);
				expect(builderService["setupScripts"]).toHaveBeenCalledWith(true);
				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.setupCompleteSpinner);
				expect(builderService["displaySetupSummary"]).toHaveBeenCalledWith("rollup", "./src/index.js", "./dist", ["esm", "cjs"], true, false, true, false, false, false, false, false);
			});

			it("should handle errors during setup", async () => {
				vi.spyOn(builderService as any, "createConfig").mockRejectedValue(new Error("Config error"));

				await expect((builderService as any).setupBuilder()).rejects.toThrow("Config error");

				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(BUILDER_CONFIG_MESSAGES.failedSetupSpinner);
			});

			it("should collect all configuration options", async () => {
				vi.spyOn(builderService as any, "isSourceMapsEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isMinifyEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "isCleanEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isCliApp").mockResolvedValue(true);
				vi.spyOn(builderService as any, "isDecoratorsEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "isPathAliasEnabled").mockResolvedValue(false);
				vi.spyOn(builderService as any, "isCommonjsEnabled").mockResolvedValue(true);
				vi.spyOn(builderService as any, "getOutputFormats").mockResolvedValue(["esm"]);

				const result = await (builderService as any).setupBuilder();

				expect(result.isSourceMapsEnabled).toBe(false);
				expect(result.isMinifyEnabled).toBe(true);
				expect(result.isCleanEnabled).toBe(false);
				expect(builderService["createConfig"]).toHaveBeenCalledWith("./src/index.js", "./dist", ["esm"], false, true, true, false, true, false, true);
				expect(builderService["setupScripts"]).toHaveBeenCalledWith(false);
			});
		});
	});
}); 