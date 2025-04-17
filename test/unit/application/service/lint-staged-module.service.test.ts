import { describe, it, expect, vi, beforeEach } from "vitest";
import { LintStagedModuleService } from "../../../../src/application/service/lint-staged-module.service";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { ELintStagedFeature } from "../../../../src/domain/enum/lint-staged-feature.enum";
import { LINT_STAGED_CONFIG_FILE_NAMES } from "../../../../src/application/constant/lint-staged-config-file-names.constant";
import { LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT } from "../../../../src/application/constant/lint-staged-config-husky-pre-commit-script.constant";
import { LINT_STAGED_CORE_DEPENDENCIES } from "../../../../src/application/constant/lint-staged-core-dependencies.constant";
import { LINT_STAGED_FEATURE_CONFIG } from "../../../../src/domain/constant/lint-staged-feature-config.constant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

/**
 * Comprehensive test suite for LintStagedModuleService
 * Includes tests for all methods and edge cases to ensure full coverage
 */
describe("LintStagedModuleService", () => {
	// Mocks
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
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

	// Mock package.json service
	const mockPackageJsonService = {
		installPackages: vi.fn(),
		addScript: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
	};

	// Mock command service
	const mockCommandService = {
		execute: vi.fn(),
	};

	// Service instance
	let lintStagedService: LintStagedModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockPackageJsonService.get.mockResolvedValue({});
		mockCliInterfaceService.multiselect.mockResolvedValue([ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT]);

		// Create service instance with mocks
		lintStagedService = new LintStagedModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(lintStagedService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
		vi.spyOn(lintStagedService as any, "COMMAND_SERVICE", "get").mockReturnValue(mockCommandService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await lintStagedService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to set up lint-staged with Husky pre-commit hooks?", true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await lintStagedService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await lintStagedService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue([]);
			mockPackageJsonService.get.mockResolvedValueOnce({});

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue(["lint-staged.config.js", ".husky/pre-commit"]);
			mockPackageJsonService.get.mockResolvedValueOnce({});

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should handle package.json lint-staged config", async () => {
			// Mock finding no config files but lint-staged in package.json
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue([]);
			mockPackageJsonService.get.mockResolvedValueOnce({ "lint-staged": {} });

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockPackageJsonService.set).toHaveBeenCalled();
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue(["lint-staged.config.js"]);
			mockPackageJsonService.get.mockResolvedValueOnce({});

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});

		it("should handle complex package.json with lint-staged configuration", async () => {
			// Mock finding no config files but lint-staged in package.json
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue([]);

			// Create a complex package.json with lint-staged configuration
			const complexPackageJson = {
				name: "test-package",
				version: "1.0.0",
				scripts: {
					test: "jest",
				},
				dependencies: {
					"some-package": "^1.0.0",
				},
				"lint-staged": {
					"*.js": "eslint --fix",
					"*.{css,scss}": "stylelint --fix",
					"*.md": "prettier --write",
				},
			};

			mockPackageJsonService.get.mockResolvedValueOnce(complexPackageJson);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockPackageJsonService.set).toHaveBeenCalled();

			// Verify the lint-staged key is removed but other parts are preserved
			const updatedPackageJson = mockPackageJsonService.set.mock.calls[0][0];
			expect(updatedPackageJson["lint-staged"]).toBeUndefined();
			expect(updatedPackageJson.name).toBe("test-package");
			expect(updatedPackageJson.scripts.test).toBe("jest");
		});

		it("should preserve package.json when deleting other config files", async () => {
			// Mock finding both config files and package.json with lint-staged
			vi.spyOn(lintStagedService as any, "findExistingConfigFiles").mockResolvedValue(["lint-staged.config.js", ".husky/pre-commit"]);

			const packageJsonWithLintStaged = {
				"lint-staged": {
					"*.js": "eslint --fix",
				},
			};

			mockPackageJsonService.get.mockResolvedValueOnce(packageJsonWithLintStaged);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await lintStagedService.handleExistingSetup();

			expect(result).toBe(true);

			// Verify that deleteFile is only called for actual files, not package.json
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("lint-staged.config.js");
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith(".husky/pre-commit");
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalledWith("package.json");
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalledWith("package.json (lint-staged config)");

			// Verify package.json is updated correctly
			expect(mockPackageJsonService.set).toHaveBeenCalled();
			const updatedPackageJson = mockPackageJsonService.set.mock.calls[0][0];
			expect(updatedPackageJson["lint-staged"]).toBeUndefined();
		});
	});

	describe("install", () => {
		it("should install lint-staged when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockResolvedValue(undefined);
			mockConfigService.getModuleConfig.mockResolvedValueOnce({ features: [] });

			const result = await lintStagedService.install();

			expect(result).toEqual({
				customProperties: {
					features: [],
				},
				wasInstalled: true,
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockResolvedValue(undefined);

			const result = await lintStagedService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should not install when handling existing setup fails", async () => {
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(false);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockResolvedValue(undefined);

			const result = await lintStagedService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			mockConfigService.getModuleConfig.mockResolvedValueOnce({ features: [] });
			vi.spyOn(lintStagedService as any, "setupLintStaged").mockRejectedValue(new Error("Test error"));

			await expect(lintStagedService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});

		it("should use saved features when available", async () => {
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockResolvedValue(undefined);

			mockConfigService.getModuleConfig.mockResolvedValueOnce({
				features: [ELintStagedFeature.ESLINT],
			});

			await lintStagedService.install();

			expect(setupSpy).toHaveBeenCalledWith([ELintStagedFeature.ESLINT]);
		});

		it("should handle invalid config features in install method", async () => {
			// Mock methods
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockImplementation(async (features) => {
				// Set selected features based on what was passed
				(lintStagedService as any).selectedFeatures = [ELintStagedFeature.ESLINT];
			});

			// Return invalid features from config
			mockConfigService.getModuleConfig.mockResolvedValueOnce({
				features: ["INVALID_FEATURE"],
			});

			const result = await lintStagedService.install();

			// Should pass the invalid features to setupLintStaged
			expect(setupSpy).toHaveBeenCalledWith(["INVALID_FEATURE"]);

			// Result should contain the selected features set during setupLintStaged
			expect(result).toEqual({
				customProperties: {
					features: [ELintStagedFeature.ESLINT],
				},
				wasInstalled: true,
			});
		});

		it("should install with valid saved features", async () => {
			// Mock methods
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockImplementation(async (features) => {
				// Set selected features based on what was passed
				(lintStagedService as any).selectedFeatures = features;
			});

			// Return valid features from config
			const validFeatures = [ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT];
			mockConfigService.getModuleConfig.mockResolvedValueOnce({
				features: validFeatures,
			});

			const result = await lintStagedService.install();

			// Should pass the valid features to setupLintStaged
			expect(setupSpy).toHaveBeenCalledWith(validFeatures);

			// Result should contain the selected features
			expect(result).toEqual({
				customProperties: {
					features: validFeatures,
				},
				wasInstalled: true,
			});
		});

		it("should handle null config during install", async () => {
			// Mock methods
			vi.spyOn(lintStagedService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(lintStagedService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(lintStagedService as any, "setupLintStaged").mockImplementation(async (features) => {
				// Set selected features
				(lintStagedService as any).selectedFeatures = [ELintStagedFeature.PRETTIER];
			});

			// Return null config
			mockConfigService.getModuleConfig.mockResolvedValueOnce(null);

			const result = await lintStagedService.install();

			// Should pass empty array to setupLintStaged
			expect(setupSpy).toHaveBeenCalledWith([]);

			// Result should contain the selected features set during setupLintStaged
			expect(result).toEqual({
				customProperties: {
					features: [ELintStagedFeature.PRETTIER],
				},
				wasInstalled: true,
			});
		});
	});

	describe("private setupLintStaged method", () => {
		it("should install dependencies, create configs, setup husky and display summary", async () => {
			// Mock internal methods
			vi.spyOn(lintStagedService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "setupHusky").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "displaySetupSummary").mockReturnValue(undefined);

			await (lintStagedService as any).setupLintStaged([]);

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(LINT_STAGED_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			expect(lintStagedService["createConfigs"]).toHaveBeenCalled();
			expect(lintStagedService["setupHusky"]).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalled();
			expect(lintStagedService["displaySetupSummary"]).toHaveBeenCalled();
		});

		it("should use saved features when valid", async () => {
			// Mock internal methods
			vi.spyOn(lintStagedService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "setupHusky").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "displaySetupSummary").mockReturnValue(undefined);

			const savedFeatures = [ELintStagedFeature.ESLINT];
			await (lintStagedService as any).setupLintStaged(savedFeatures);

			expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(expect.any(String), expect.any(Array), true, savedFeatures);
		});

		it("should handle errors in setupLintStaged", async () => {
			// Mock error occurring during installation
			mockPackageJsonService.installPackages.mockRejectedValueOnce(new Error("Installation failed"));

			await expect((lintStagedService as any).setupLintStaged([])).rejects.toThrow("Installation failed");

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup lint-staged configuration");
		});

		it("should handle invalid saved features in setupLintStaged", async () => {
			// Set up mocks for internal methods
			vi.spyOn(lintStagedService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "setupHusky").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "displaySetupSummary").mockReturnValue(undefined);

			// Pass invalid saved features (not in ELintStagedFeature enum)
			const invalidFeatures = ["INVALID_FEATURE"];
			await (lintStagedService as any).setupLintStaged(invalidFeatures as any);

			// Should pass empty array as initialValues, not the invalid features
			expect(mockCliInterfaceService.multiselect).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Array),
				true,
				[], // Should be empty, not invalidFeatures
			);
		});

		it("should handle case when no features are selected", async () => {
			// Mock internal methods
			vi.spyOn(lintStagedService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "setupHusky").mockResolvedValue(undefined);
			vi.spyOn(lintStagedService as any, "displaySetupSummary").mockReturnValue(undefined);

			// Multiselect returns empty array (no features selected)
			mockCliInterfaceService.multiselect.mockResolvedValueOnce([]);

			await (lintStagedService as any).setupLintStaged([]);

			// Should still continue with the setup
			expect(mockPackageJsonService.installPackages).toHaveBeenCalled();
			expect(lintStagedService["createConfigs"]).toHaveBeenCalledWith([]);
			expect(lintStagedService["setupHusky"]).toHaveBeenCalled();
			expect(lintStagedService["displaySetupSummary"]).toHaveBeenCalledWith([]);
		});
	});

	describe("private createConfigs method", () => {
		it("should write configuration file with only Prettier", async () => {
			await (lintStagedService as any).createConfigs([ELintStagedFeature.PRETTIER]);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("lint-staged.config.js", expect.stringContaining('commands.push("prettier --write --ignore-unknown")'), "utf8");
			// Verify the generated content doesn't include other features
			const writtenContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(writtenContent).not.toContain("eslintFiles");
			expect(writtenContent).not.toContain("styleFiles");
		});

		it("should write configuration file with only ESLint", async () => {
			await (lintStagedService as any).createConfigs([ELintStagedFeature.ESLINT]);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("lint-staged.config.js", expect.stringContaining("const eslintFiles = files.filter"), "utf8");
			// Verify the generated content includes eslint but not others
			const writtenContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(writtenContent).not.toContain("prettier --write");
			expect(writtenContent).not.toContain("styleFiles");
			// Verify we're accessing the LINT_STAGED_FEATURE_CONFIG
			expect(writtenContent).toContain("eslint --fix --max-warnings=0 --no-warn-ignored");
		});

		it("should write configuration file with only Stylelint", async () => {
			await (lintStagedService as any).createConfigs([ELintStagedFeature.STYLELINT]);

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("lint-staged.config.js", expect.stringContaining("const styleFiles = files.filter"), "utf8");
			// Verify the generated content includes stylelint but not others
			const writtenContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(writtenContent).not.toContain("prettier --write");
			expect(writtenContent).not.toContain("eslintFiles");
			// Verify we're accessing the LINT_STAGED_FEATURE_CONFIG
			expect(writtenContent).toContain("stylelint --fix");
		});

		it("should write configuration file with all features enabled", async () => {
			await (lintStagedService as any).createConfigs([ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT, ELintStagedFeature.STYLELINT]);

			// Verify all features are included in the configuration
			const writtenContent = mockFileSystemService.writeFile.mock.calls[0][1];
			expect(writtenContent).toContain('commands.push("prettier --write --ignore-unknown")');
			expect(writtenContent).toContain("const eslintFiles = files.filter");
			expect(writtenContent).toContain("eslint --fix --max-warnings=0 --no-warn-ignored");
			expect(writtenContent).toContain("const styleFiles = files.filter");
			expect(writtenContent).toContain("stylelint --fix");
		});

		it("should directly access all properties in selectedFeatures array", async () => {
			// Test with all three features to ensure each branch is covered
			const allFeatures = [ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT, ELintStagedFeature.STYLELINT];

			// Call createConfigs with all features
			await (lintStagedService as any).createConfigs(allFeatures);

			// Get the content that was written
			const fileContent = mockFileSystemService.writeFile.mock.calls[0][1];

			// Verify coverage of specific branches
			// For PRETTIER (lines 298-303)
			expect(fileContent).toContain('commands.push("prettier --write --ignore-unknown")');

			// For ESLINT (lines 304-309)
			expect(fileContent).toContain("const eslintFiles = files.filter");
			expect(fileContent).toContain("eslint --fix --max-warnings=0 --no-warn-ignored");

			// For STYLELINT (lines 310-316)
			expect(fileContent).toContain("const styleFiles = files.filter");
			expect(fileContent).toContain("stylelint --fix");
		});
	});

	describe("private setupHusky method", () => {
		it("should execute commands and create pre-commit hook", async () => {
			await (lintStagedService as any).setupHusky();

			expect(mockCommandService.execute).toHaveBeenCalledWith("npx husky");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("prepare", "husky");
			expect(mockCommandService.execute).toHaveBeenCalledWith("mkdir -p .husky");
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(".husky/pre-commit", LINT_STAGED_CONFIG_HUSKY_PRE_COMMIT_SCRIPT, "utf8");
			expect(mockCommandService.execute).toHaveBeenCalledWith("chmod +x .husky/pre-commit");
		});
	});

	describe("private displaySetupSummary method", () => {
		it("should show summary information", async () => {
			(lintStagedService as any).displaySetupSummary([ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT]);

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith("lint-staged Setup", expect.any(String));
		});

		it("should show all required packages in displaySetupSummary", () => {
			// Use all lint-staged features
			const allFeatures = Object.values(ELintStagedFeature);

			(lintStagedService as any).displaySetupSummary(allFeatures);

			// Get the summary content
			const summaryContent = mockCliInterfaceService.note.mock.calls[0][1];

			// Verify it contains all feature labels
			for (const feature of allFeatures) {
				expect(summaryContent).toContain(LINT_STAGED_FEATURE_CONFIG[feature].label);
			}

			// Verify it contains all required packages
			for (const feature of allFeatures) {
				for (const pkg of LINT_STAGED_FEATURE_CONFIG[feature].requiredPackages) {
					expect(summaryContent).toContain(`- ${pkg}`);
				}
			}
		});
	});

	describe("private findExistingConfigFiles method", () => {
		it("should return file paths for existing config files", async () => {
			mockFileSystemService.isPathExists.mockImplementation((path) => {
				if (path === LINT_STAGED_CONFIG_FILE_NAMES[0] || path === ".husky/pre-commit") {
					return Promise.resolve(true);
				}
				return Promise.resolve(false);
			});

			const result = await (lintStagedService as any).findExistingConfigFiles();

			expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith(LINT_STAGED_CONFIG_FILE_NAMES[0]);
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith(".husky/pre-commit");
			expect(result).toContain(LINT_STAGED_CONFIG_FILE_NAMES[0]);
			expect(result).toContain(".husky/pre-commit");
			expect(result.length).toBe(2);
		});

		it("should find all possible config files", async () => {
			// Mock all files existing
			mockFileSystemService.isPathExists.mockResolvedValue(true);

			const result = await (lintStagedService as any).findExistingConfigFiles();

			// Should find all config files listed in LINT_STAGED_CONFIG_FILE_NAMES
			for (const fileName of LINT_STAGED_CONFIG_FILE_NAMES) {
				expect(result).toContain(fileName);
			}

			// Should also find the husky pre-commit hook
			expect(result).toContain(".husky/pre-commit");

			// Should have the correct total number of files
			expect(result.length).toBe(LINT_STAGED_CONFIG_FILE_NAMES.length + 1);
		});
	});
});
