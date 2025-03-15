import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CosmicConfigService } from "../../../../src/infrastructure/service/cosmi-config-config.service";
import { createMockFileSystemService } from "../../../helpers/test-utils";
import { CONFIG_MODULE_NAME } from "../../../../src/application/constant/config-module-name.constant";
import { cosmiconfig } from "cosmiconfig";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { CONFIG_FILE_DIRECTORY } from "../../../../src/application/constant/config-file-directory.constant";

// Mock dependencies
vi.mock("cosmiconfig");
vi.mock("javascript-stringify", () => ({
	stringify: vi.fn((obj) => JSON.stringify(obj)),
}));
vi.mock("yaml", () => ({
	default: {
		stringify: vi.fn((obj) => `YAML:${JSON.stringify(obj)}`),
	},
}));

describe("CosmicConfigService", () => {
	// Console mocks
	const originalConsoleError = console.error;
	const mockConsoleError = vi.fn();

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

		// Replace console functions with mocks
		console.error = mockConsoleError;

		// Reset mock implementations
		mockFileSystemService.getExtensionFromFilePath.mockReset();
		mockFileSystemService.getDirectoryNameFromFilePath.mockReset();
		mockFileSystemService.isPathExists.mockReset();
		mockFileSystemService.createDirectory.mockReset();
		mockFileSystemService.writeFile.mockReset();

		// Default implementations
		mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".json");
		mockFileSystemService.getDirectoryNameFromFilePath.mockReturnValue("./");
		mockFileSystemService.isPathExists.mockResolvedValue(true);

		// Mock cosmiconfig to return the explorer
		vi.mocked(cosmiconfig).mockReturnValue(mockExplorer as any);

		// Create service instance
		configService = new CosmicConfigService(mockFileSystemService);
	});

	afterEach(() => {
		// Restore console functions
		console.error = originalConsoleError;
	});

	describe("constructor", () => {
		it("should initialize with the correct configuration", () => {
			expect(cosmiconfig).toHaveBeenCalledWith(CONFIG_MODULE_NAME, expect.any(Object));
		});
	});

	describe("clearCaches", () => {
		it("should clear cached config and explorer caches", () => {
			// Set cached config
			(configService as any).cachedConfig = { test: true };

			configService.clearCaches();

			expect((configService as any).cachedConfig).toBeNull();
			expect(mockExplorer.clearCaches).toHaveBeenCalled();
		});
	});

	describe("exists", () => {
		it("should return true when config exists and is not empty", async () => {
			mockExplorer.search.mockResolvedValueOnce({
				config: { test: true },
				filepath: "./.elsikora/setuprc.json",
				isEmpty: false,
			});

			const result = await configService.exists();

			expect(result).toBe(true);
		});

		it("should return false when config does not exist", async () => {
			mockExplorer.search.mockResolvedValueOnce(null);

			const result = await configService.exists();

			expect(result).toBe(false);
		});

		it("should return false when config is empty", async () => {
			mockExplorer.search.mockResolvedValueOnce({
				config: {},
				filepath: "./.elsikora/setuprc.json",
				isEmpty: true,
			});

			const result = await configService.exists();

			expect(result).toBe(false);
		});
	});

	describe("get", () => {
		it("should return cached config when available", async () => {
			const cachedConfig = { test: true };
			(configService as any).cachedConfig = cachedConfig;

			const result = await configService.get();

			expect(result).toBe(cachedConfig);
			expect(mockExplorer.search).not.toHaveBeenCalled();
		});

		it("should search and return config when not cached", async () => {
			const config = { test: true };
			mockExplorer.search.mockResolvedValueOnce({
				config,
				filepath: "./.elsikora/setuprc.json",
			});

			const result = await configService.get();

			expect(result).toBe(config);
			expect((configService as any).cachedConfig).toBe(config);
		});

		it("should return empty object when no config found", async () => {
			mockExplorer.search.mockResolvedValueOnce(null);

			const result = await configService.get();

			expect(result).toEqual({});
		});
	});

	describe("getModuleConfig", () => {
		it("should return module config when available", async () => {
			const moduleConfig = { isEnabled: true, feature: "test" };
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: moduleConfig,
			};

			const result = await configService.getModuleConfig(EModule.ESLINT);

			expect(result).toBe(moduleConfig);
		});

		it("should return null when module config not available", async () => {
			(configService as any).cachedConfig = {
				[EModule.PRETTIER]: { isEnabled: true },
			};

			const result = await configService.getModuleConfig(EModule.ESLINT);

			expect(result).toBeNull();
		});

		it("should return null when error occurs", async () => {
			vi.spyOn(configService, "get").mockRejectedValueOnce(new Error("Test error"));

			const result = await configService.getModuleConfig(EModule.ESLINT);

			expect(result).toBeNull();
		});
	});

	describe("getProperty", () => {
		it("should return property value when available", async () => {
			const propertyValue = { isEnabled: true };
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: propertyValue,
			};

			const result = await configService.getProperty(EModule.ESLINT);

			expect(result).toBe(propertyValue);
		});
	});

	describe("isModuleEnabled", () => {
		it("should return true when module is enabled", async () => {
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: { isEnabled: true },
			};

			const result = await configService.isModuleEnabled(EModule.ESLINT);

			expect(result).toBe(true);
		});

		it("should return true when isEnabled is not explicitly set to false", async () => {
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: { feature: "test" },
			};

			const result = await configService.isModuleEnabled(EModule.ESLINT);

			expect(result).toBe(true);
		});

		it("should return false when module is disabled", async () => {
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: { isEnabled: false },
			};

			const result = await configService.isModuleEnabled(EModule.ESLINT);

			expect(result).toBe(false);
		});

		it("should return false when module is not configured", async () => {
			(configService as any).cachedConfig = {};

			const result = await configService.isModuleEnabled(EModule.ESLINT);

			expect(result).toBe(false);
		});

		it("should return false when error occurs", async () => {
			vi.spyOn(configService, "get").mockRejectedValueOnce(new Error("Test error"));

			const result = await configService.isModuleEnabled(EModule.ESLINT);

			expect(result).toBe(false);
		});
	});

	describe("merge", () => {
		it("should merge partial config with existing config", async () => {
			// Setup initial config
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: { isEnabled: true },
				[EModule.PRETTIER]: { isEnabled: false },
			};

			// Mock set method
			const setSpy = vi.spyOn(configService, "set").mockResolvedValueOnce();

			// Execute merge
			const partial = {
				[EModule.PRETTIER]: { isEnabled: true },
				[EModule.STYLELINT]: { isEnabled: true },
			};
			await configService.merge(partial);

			// Verify merged config
			expect(setSpy).toHaveBeenCalledWith({
				[EModule.ESLINT]: { isEnabled: true },
				[EModule.PRETTIER]: { isEnabled: true },
				[EModule.STYLELINT]: { isEnabled: true },
			});
		});

		it("should use partial as complete config when error getting current config", async () => {
			// Mock get method to throw error
			vi.spyOn(configService, "get").mockRejectedValueOnce(new Error("Test error"));

			// Mock set method
			const setSpy = vi.spyOn(configService, "set").mockResolvedValueOnce();

			// Execute merge
			const partial = {
				[EModule.PRETTIER]: { isEnabled: true },
			};
			await configService.merge(partial);

			// Verify set with partial only
			expect(mockConsoleError).toHaveBeenCalledWith("Error merging config:", expect.any(Error));
			expect(setSpy).toHaveBeenCalledWith(partial);
		});
	});

	describe("set", () => {
		it("should save config to existing file path", async () => {
			// Mock explorer search
			mockExplorer.search.mockResolvedValueOnce({
				config: {},
				filepath: "./.elsikora/setuprc.json",
			});

			// Execute set
			const config = { [EModule.ESLINT]: { isEnabled: true } };
			await configService.set(config);

			// Verify file is written
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("./.elsikora/setuprc.json", expect.any(String), "utf8");
			expect((configService as any).cachedConfig).toBe(config);
			expect(mockExplorer.clearSearchCache).toHaveBeenCalled();
		});

		it("should save config to default file path when none exists", async () => {
			// Mock explorer search
			mockExplorer.search.mockResolvedValueOnce(null);

			// Execute set
			const config = { [EModule.ESLINT]: { isEnabled: true } };
			await configService.set(config);

			// Verify file is written to default path
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(`${CONFIG_FILE_DIRECTORY}/${CONFIG_MODULE_NAME}.config.js`, expect.any(String), "utf8");
		});

		it("should handle errors when saving config", async () => {
			// Mock explorer search
			mockExplorer.search.mockResolvedValueOnce({
				config: {},
				filepath: "./.elsikora/setuprc.json",
			});

			// Mock writeFile to throw error
			mockFileSystemService.writeFile.mockRejectedValueOnce(new Error("Write error"));

			// Execute set
			const config = { [EModule.ESLINT]: { isEnabled: true } };
			await expect(configService.set(config)).rejects.toThrow("Write error");

			// Verify error is logged
			expect(mockConsoleError).toHaveBeenCalledWith("Error saving configuration:", expect.any(Error));
		});
	});

	describe("setProperty", () => {
		it("should update specific property and save config", async () => {
			// Setup initial config
			(configService as any).cachedConfig = {
				[EModule.ESLINT]: { isEnabled: false },
				[EModule.PRETTIER]: { isEnabled: true },
			};

			// Mock set method
			const setSpy = vi.spyOn(configService, "set").mockResolvedValueOnce();

			// Execute setProperty
			const property = EModule.ESLINT;
			const value = { isEnabled: true, features: ["typescript"] };
			await configService.setProperty(property, value);

			// Verify set is called with updated config
			expect(setSpy).toHaveBeenCalledWith({
				[EModule.ESLINT]: { isEnabled: true, features: ["typescript"] },
				[EModule.PRETTIER]: { isEnabled: true },
			});
		});
	});

	describe("writeFile", () => {
		it("should write JSON config", async () => {
			mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".json");

			const config = { test: true };
			await (configService as any).writeFile("./.elsikora/setuprc.json", config);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("./.elsikora/setuprc.json", expect.any(String), "utf8");
		});

		it("should write YAML config", async () => {
			mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".yaml");

			const config = { test: true };
			await (configService as any).writeFile("./.elsikora/setuprc.yaml", config);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("./.elsikora/setuprc.yaml", `YAML:${JSON.stringify(config)}`, "utf8");
		});

		it("should write JS module config", async () => {
			mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".js");

			const config = { test: true };
			await (configService as any).writeFile("./.elsikora/setup.config.js", config);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("./.elsikora/setup.config.js", expect.any(String), "utf8");
		});

		it("should write CJS module config", async () => {
			mockFileSystemService.getExtensionFromFilePath.mockReturnValue(".cjs");

			const config = { test: true };
			await (configService as any).writeFile("./.elsikora/setup.config.cjs", config);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("./.elsikora/setup.config.cjs", expect.any(String), "utf8");
		});

		it("should create directory if it doesn't exist", async () => {
			mockFileSystemService.isPathExists.mockResolvedValueOnce(false);

			const config = { test: true };
			await (configService as any).writeFile("./.elsikora/setuprc.json", config);

			expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith("./", { isRecursive: true });
		});
	});
});
