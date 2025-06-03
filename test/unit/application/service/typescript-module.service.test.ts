import { describe, it, expect, vi, beforeEach } from "vitest";
import { TypescriptModuleService } from "../../../../src/application/service/typescript-module.service";
import { TYPESCRIPT_CONFIG_FILE_NAME } from "../../../../src/application/constant/typescript/config-file-name.constant";
import { TYPESCRIPT_CONFIG } from "../../../../src/application/constant/typescript/config.constant";
import { TYPESCRIPT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/typescript/core-dependencies.constant";
import { TYPESCRIPT_CONFIG_FILE_NAMES } from "../../../../src/application/constant/typescript/file-names.constant";
import { TYPESCRIPT_CONFIG_MESSAGES } from "../../../../src/application/constant/typescript/messages.constant";
import { TYPESCRIPT_CONFIG_SCRIPTS } from "../../../../src/application/constant/typescript/scripts.constant";
import { TYPESCRIPT_CONFIG_SUMMARY } from "../../../../src/application/constant/typescript/summary.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

describe("TypescriptModuleService", () => {
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
	let typescriptService: TypescriptModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockResolvedValue("./src");
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		// Create service instance with mocks
		typescriptService = new TypescriptModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(typescriptService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await typescriptService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmSetup, true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await typescriptService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await typescriptService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(typescriptService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await typescriptService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(typescriptService as any, "findExistingConfigFiles").mockResolvedValue(["tsconfig.json", "tsconfig.base.json"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await typescriptService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(typescriptService as any, "findExistingConfigFiles").mockResolvedValue(["tsconfig.json"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await typescriptService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.existingFilesAborted);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("install", () => {
		it("should install TypeScript when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(typescriptService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(typescriptService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(typescriptService as any, "setupTypescript").mockResolvedValue({
				baseUrl: "./src",
				rootDirectory: "./src",
				outputDirectory: "./dist",
				isCleanArchitectureEnabled: "false",
				isDecoratorsEnabled: "false",
			});

			const result = await typescriptService.install();

			expect(result).toEqual({
				wasInstalled: true,
				customProperties: {
					baseUrl: "./src",
					rootDirectory: "./src",
					outputDirectory: "./dist",
					isCleanArchitectureEnabled: "false",
					isDecoratorsEnabled: "false",
				},
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(typescriptService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(typescriptService as any, "setupTypescript").mockResolvedValue({});

			const result = await typescriptService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should not install when handling existing setup fails", async () => {
			vi.spyOn(typescriptService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(typescriptService, "handleExistingSetup").mockResolvedValue(false);
			const setupSpy = vi.spyOn(typescriptService as any, "setupTypescript").mockResolvedValue({});

			const result = await typescriptService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(typescriptService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(typescriptService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(typescriptService as any, "setupTypescript").mockRejectedValue(new Error("Test error"));

			await expect(typescriptService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});

		it("should use saved config when available", async () => {
			mockConfigService.getModuleConfig.mockResolvedValueOnce({
				baseUrl: "./custom",
				rootDirectory: "./custom",
				outputDirectory: "./build",
				isCleanArchitectureEnabled: true,
				isDecoratorsEnabled: true,
			});

			vi.spyOn(typescriptService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(typescriptService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(typescriptService as any, "setupTypescript").mockResolvedValue({});

			await typescriptService.install();

			expect(mockConfigService.getModuleConfig).toHaveBeenCalledWith(EModule.TYPESCRIPT);
		});
	});

	describe("private methods", () => {
		describe("getBaseUrl", () => {
			it("should prompt for base URL with validation", async () => {
				mockCliInterfaceService.text.mockResolvedValueOnce("./src");

				const result = await (typescriptService as any).getBaseUrl();

				expect(result).toBe("./src");
				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.baseUrlPrompt, TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault, TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault, expect.any(Function));
			});

			it("should validate base URL format", async () => {
				mockCliInterfaceService.text.mockImplementation((_message, _placeholder, _initial, validate) => {
					expect(validate("")).toBe(TYPESCRIPT_CONFIG_MESSAGES.baseUrlRequired);
					expect(validate("src")).toBe(TYPESCRIPT_CONFIG_MESSAGES.baseUrlValidation);
					expect(validate("./src")).toBe(undefined);
					expect(validate(".")).toBe(undefined);
					expect(validate("../src")).toBe(undefined);
					return Promise.resolve("./src");
				});

				await (typescriptService as any).getBaseUrl();
			});

			it("should use saved config value as initial", async () => {
				(typescriptService as any).config = { baseUrl: "./custom" };
				mockCliInterfaceService.text.mockResolvedValueOnce("./custom");

				await (typescriptService as any).getBaseUrl();

				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.baseUrlPrompt, TYPESCRIPT_CONFIG_SUMMARY.baseUrlDefault, "./custom", expect.any(Function));
			});
		});

		describe("getRootDir", () => {
			it("should prompt for root directory with validation", async () => {
				mockCliInterfaceService.text.mockResolvedValueOnce("./src");

				const result = await (typescriptService as any).getRootDir();

				expect(result).toBe("./src");
				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.rootDirPrompt, TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault, TYPESCRIPT_CONFIG_SUMMARY.rootDirDefault, expect.any(Function));
			});

			it("should validate root directory format", async () => {
				mockCliInterfaceService.text.mockImplementation((_message, _placeholder, _initial, validate) => {
					expect(validate("")).toBe(TYPESCRIPT_CONFIG_MESSAGES.rootDirRequired);
					expect(validate("src")).toBe(TYPESCRIPT_CONFIG_MESSAGES.rootDirValidation);
					expect(validate("./src")).toBe(undefined);
					return Promise.resolve("./src");
				});

				await (typescriptService as any).getRootDir();
			});
		});

		describe("getOutDir", () => {
			it("should prompt for output directory with validation", async () => {
				mockCliInterfaceService.text.mockResolvedValueOnce("./dist");

				const result = await (typescriptService as any).getOutDir();

				expect(result).toBe("./dist");
				expect(mockCliInterfaceService.text).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.outDirPrompt, TYPESCRIPT_CONFIG_SUMMARY.outDirDefault, TYPESCRIPT_CONFIG_SUMMARY.outDirDefault, expect.any(Function));
			});

			it("should validate output directory format", async () => {
				mockCliInterfaceService.text.mockImplementation((_message, _placeholder, _initial, validate) => {
					expect(validate("")).toBe(TYPESCRIPT_CONFIG_MESSAGES.outDirRequired);
					expect(validate("dist")).toBe(TYPESCRIPT_CONFIG_MESSAGES.outDirValidation);
					expect(validate("./dist")).toBe(undefined);
					return Promise.resolve("./dist");
				});

				await (typescriptService as any).getOutDir();
			});
		});

		describe("isCleanArchitectureEnabled", () => {
			it("should prompt for clean architecture with info message", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (typescriptService as any).isCleanArchitectureEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.info).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureInfo);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, false);
			});

			it("should use saved config value as default", async () => {
				(typescriptService as any).config = { isCleanArchitectureEnabled: true };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (typescriptService as any).isCleanArchitectureEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmCleanArchitecture, true);
			});
		});

		describe("isDecoratorsEnabled", () => {
			it("should prompt for decorators support", async () => {
				mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

				const result = await (typescriptService as any).isDecoratorsEnabled();

				expect(result).toBe(true);
				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmDecorators, false);
			});

			it("should use saved config value as default", async () => {
				(typescriptService as any).config = { isDecoratorsEnabled: true };
				mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

				await (typescriptService as any).isDecoratorsEnabled();

				expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.confirmDecorators, true);
			});
		});

		describe("createConfig", () => {
			it("should create config file with provided options", async () => {
				await (typescriptService as any).createConfig("./src", "./src", "./dist", false, false);

				expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_FILE_NAME, expect.any(String), "utf8");

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				const config = JSON.parse(configContent);

				expect(config.compilerOptions.baseUrl).toBe("./src");
				expect(config.compilerOptions.rootDir).toBe("./src");
				expect(config.compilerOptions.outDir).toBe("./dist");
				expect(config.compilerOptions.paths).toBeUndefined();
				expect(config.compilerOptions.experimentalDecorators).toBeUndefined();
			});

			it("should include clean architecture paths when enabled", async () => {
				await (typescriptService as any).createConfig("./src", "./src", "./dist", true, false);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				const config = JSON.parse(configContent);

				expect(config.compilerOptions.paths).toEqual({
					"@application/*": ["application/*"],
					"@domain/*": ["domain/*"],
					"@infrastructure/*": ["infrastructure/*"],
					"@presentation/*": ["presentation/*"],
				});
			});

			it("should include decorator options when enabled", async () => {
				await (typescriptService as any).createConfig("./src", "./src", "./dist", false, true);

				const configContent = mockFileSystemService.writeFile.mock.calls[0][1];
				const config = JSON.parse(configContent);

				expect(config.compilerOptions.emitDecoratorMetadata).toBe(true);
				expect(config.compilerOptions.experimentalDecorators).toBe(true);
			});
		});

		describe("setupScripts", () => {
			it("should add TypeScript scripts to package.json", async () => {
				await (typescriptService as any).setupScripts();

				expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(2);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_SCRIPTS.buildTypes.name, TYPESCRIPT_CONFIG_SCRIPTS.buildTypes.command);
				expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_SCRIPTS.lintTypes.name, TYPESCRIPT_CONFIG_SCRIPTS.lintTypes.command);
			});
		});

		describe("findExistingConfigFiles", () => {
			it("should return file paths for existing config files", async () => {
				mockFileSystemService.isPathExists
					.mockResolvedValueOnce(true) // tsconfig.json exists
					.mockResolvedValueOnce(false) // tsconfig.base.json doesn't exist
					.mockResolvedValueOnce(true) // tsconfig.build.json exists
					.mockResolvedValueOnce(false) // tsconfig.dev.json doesn't exist
					.mockResolvedValueOnce(false) // tsconfig.prod.json doesn't exist
					.mockResolvedValueOnce(false); // tsconfig.test.json doesn't exist

				const result = await (typescriptService as any).findExistingConfigFiles();

				expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(TYPESCRIPT_CONFIG_FILE_NAMES.length);
				expect(result).toEqual(["tsconfig.json", "tsconfig.build.json"]);
			});

			it("should return empty array when no config files exist", async () => {
				mockFileSystemService.isPathExists.mockResolvedValue(false);

				const result = await (typescriptService as any).findExistingConfigFiles();

				expect(result).toEqual([]);
			});
		});

		describe("displaySetupSummary", () => {
			it("should display basic setup summary", () => {
				(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", false, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.configurationCreated));
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.summaryBaseUrl("./src")));
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.summaryRootDir("./src")));
				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.summaryOutputDir("./dist")));
			});

			it("should include clean architecture info when enabled", () => {
				(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", true, false);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.cleanArchitectureEnabled));
			});

			it("should include decorators info when enabled", () => {
				(typescriptService as any).displaySetupSummary("./src", "./src", "./dist", false, true);

				expect(mockCliInterfaceService.note).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteTitle, expect.stringContaining(TYPESCRIPT_CONFIG_MESSAGES.decoratorsEnabled));
			});
		});

		describe("setupTypescript", () => {
			beforeEach(() => {
				vi.spyOn(typescriptService as any, "getBaseUrl").mockResolvedValue("./src");
				vi.spyOn(typescriptService as any, "getRootDir").mockResolvedValue("./src");
				vi.spyOn(typescriptService as any, "getOutDir").mockResolvedValue("./dist");
				vi.spyOn(typescriptService as any, "isCleanArchitectureEnabled").mockResolvedValue(false);
				vi.spyOn(typescriptService as any, "isDecoratorsEnabled").mockResolvedValue(false);
				vi.spyOn(typescriptService as any, "createConfig").mockResolvedValue(undefined);
				vi.spyOn(typescriptService as any, "setupScripts").mockResolvedValue(undefined);
				vi.spyOn(typescriptService as any, "displaySetupSummary").mockReturnValue(undefined);
			});

			it("should set up TypeScript configuration successfully", async () => {
				const result = await (typescriptService as any).setupTypescript();

				expect(result).toEqual({
					baseUrl: "./src",
					rootDirectory: "./src",
					outputDirectory: "./dist",
					isCleanArchitectureEnabled: false,
					isDecoratorsEnabled: false,
				});

				expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.settingUpSpinner);
				expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
				expect(typescriptService["createConfig"]).toHaveBeenCalledWith("./src", "./src", "./dist", false, false);
				expect(typescriptService["setupScripts"]).toHaveBeenCalled();
				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.setupCompleteSpinner);
				expect(typescriptService["displaySetupSummary"]).toHaveBeenCalledWith("./src", "./src", "./dist", false, false);
			});

			it("should handle errors during setup", async () => {
				vi.spyOn(typescriptService as any, "createConfig").mockRejectedValue(new Error("Config error"));

				await expect((typescriptService as any).setupTypescript()).rejects.toThrow("Config error");

				expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith(TYPESCRIPT_CONFIG_MESSAGES.failedSetupSpinner);
			});

			it("should collect all configuration options", async () => {
				vi.spyOn(typescriptService as any, "isCleanArchitectureEnabled").mockResolvedValue(true);
				vi.spyOn(typescriptService as any, "isDecoratorsEnabled").mockResolvedValue(true);

				const result = await (typescriptService as any).setupTypescript();

				expect(result.isCleanArchitectureEnabled).toBe(true);
				expect(result.isDecoratorsEnabled).toBe(true);
				expect(typescriptService["createConfig"]).toHaveBeenCalledWith("./src", "./src", "./dist", true, true);
			});
		});
	});
});
