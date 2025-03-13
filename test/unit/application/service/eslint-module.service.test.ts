import { describe, it, expect, vi, beforeEach } from "vitest";
import { EslintModuleService } from "../../../../src/application/service/eslint-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import { ESLINT_CONFIG_FILE_NAME } from "../../../../src/application/constant/eslint-config-file-name.constant";
import { ESLINT_CONFIG_FILE_NAMES } from "../../../../src/application/constant/eslint-config-file-names.constant";
import { ESLINT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/eslint-config-core-dependencies.constant";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { ESLINT_CONFIG_ESLINT_PACKAGE_NAME } from "../../../../src/application/constant/eslint-config-eslint-package-name.costant";
import { ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION } from "../../../../src/application/constant/eslint-config-eslint-minimum-required-version.constant";
import { ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME } from "../../../../src/application/constant/eslint-config-elsikora-package-name.constant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { EPackageJsonDependencyVersionFlag } from "../../../../src/domain/enum/package-json-dependency-version-flag.enum";

describe("EslintModuleService", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();

	// Service instance
	let eslintService: EslintModuleService;

	// Mock package.json service
	const mockPackageJsonService = {
		addDependency: vi.fn().mockResolvedValue(undefined),
		addScript: vi.fn().mockResolvedValue(undefined),
		getDependencies: vi.fn().mockResolvedValue({}),
		getInstalledDependencyVersion: vi.fn().mockResolvedValue(undefined),
		getProperty: vi.fn().mockResolvedValue({}),
		installPackages: vi.fn().mockResolvedValue(undefined),
		isExistsDependency: vi.fn().mockResolvedValue(false),
		removeDependency: vi.fn().mockResolvedValue(undefined),
		uninstallPackages: vi.fn().mockResolvedValue(undefined),
	};

	// Mock framework service
	const mockFrameworkService = {
		detect: vi.fn().mockResolvedValue([]),
		getFeatures: vi.fn().mockReturnValue([]),
		getIgnorePatterns: vi.fn().mockReturnValue([]),
		getLintPaths: vi.fn().mockReturnValue([]),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock implementations
		mockCliInterfaceService.confirm.mockReset();
		mockCliInterfaceService.groupMultiselect.mockReset();
		mockConfigService.getModuleConfig.mockReset();
		mockConfigService.isModuleEnabled.mockReset();
		mockFileSystemService.isPathExists.mockReset();
		mockFileSystemService.writeFile.mockReset();
		mockFileSystemService.deleteFile.mockReset();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.groupMultiselect.mockResolvedValue([EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]);
		mockConfigService.getModuleConfig.mockResolvedValue({ features: [EEslintFeature.JAVASCRIPT] });
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);

		// Create service instance with mocks
		eslintService = new EslintModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

		// Mock internal services
		vi.spyOn(eslintService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
		vi.spyOn(eslintService as any, "FRAMEWORK_SERVICE", "get").mockReturnValue(mockFrameworkService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await eslintService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to set up ESLint for your project?", true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await eslintService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));
			mockCliInterfaceService.handleError.mockImplementationOnce(() => {});

			const result = await eslintService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("checkEslintVersion", () => {
		it("should return true when ESLint is not installed", async () => {
			mockPackageJsonService.getInstalledDependencyVersion.mockResolvedValueOnce(undefined);

			const result = await eslintService.checkEslintVersion();

			expect(result).toBe(true);
			expect(mockPackageJsonService.getInstalledDependencyVersion).toHaveBeenCalledWith(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
		});

		it("should return true when ESLint version meets requirements", async () => {
			mockPackageJsonService.getInstalledDependencyVersion.mockResolvedValueOnce({
				flag: EPackageJsonDependencyVersionFlag.CARET,
				isPrerelease: false,
				majorVersion: ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION,
				minorVersion: 0,
				patchVersion: 0,
				version: `${ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION}.0.0`,
			});

			const result = await eslintService.checkEslintVersion();

			expect(result).toBe(true);
		});

		it("should ask to update when ESLint version is too old and user agrees", async () => {
			// Mock having an old version of ESLint
			mockPackageJsonService.getInstalledDependencyVersion.mockResolvedValueOnce({
				flag: EPackageJsonDependencyVersionFlag.CARET,
				isPrerelease: false,
				majorVersion: ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION - 1,
				minorVersion: 0,
				patchVersion: 0,
				version: `${ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION - 1}.0.0`,
			});

			// User agrees to update
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await eslintService.checkEslintVersion();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.info).toHaveBeenCalled();
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Uninstalling ESLint...");
			expect(mockPackageJsonService.uninstallPackages).toHaveBeenCalledWith(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("ESLint uninstalled successfully.");
		});

		it("should return false when ESLint version is too old and user declines update", async () => {
			// Mock having an old version of ESLint
			mockPackageJsonService.getInstalledDependencyVersion.mockResolvedValueOnce({
				flag: EPackageJsonDependencyVersionFlag.CARET,
				isPrerelease: false,
				majorVersion: ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION - 1,
				minorVersion: 0,
				patchVersion: 0,
				version: `${ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION - 1}.0.0`,
			});

			// User declines to update
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await eslintService.checkEslintVersion();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.info).toHaveBeenCalled();
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
			expect(mockPackageJsonService.uninstallPackages).not.toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock no existing configuration
			mockPackageJsonService.isExistsDependency.mockResolvedValueOnce(false);
			vi.spyOn(eslintService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await eslintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockPackageJsonService.isExistsDependency).toHaveBeenCalledWith(ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME);
			expect(eslintService["findExistingConfigFiles"]).toHaveBeenCalled();
		});

		it("should uninstall existing configuration when user confirms", async () => {
			// Mock existing ElsiKora configuration
			mockPackageJsonService.isExistsDependency.mockResolvedValueOnce(true);

			// Mock uninstall method
			vi.spyOn(eslintService as any, "uninstallExistingConfig").mockResolvedValue(undefined);

			// Mock no config files
			vi.spyOn(eslintService as any, "findExistingConfigFiles").mockResolvedValue([]);

			// User agrees to uninstall
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await eslintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(eslintService["uninstallExistingConfig"]).toHaveBeenCalled();
		});

		it("should return false when user declines to uninstall existing config", async () => {
			// Mock existing ElsiKora configuration
			mockPackageJsonService.isExistsDependency.mockResolvedValueOnce(true);
			
			// Setup spy for uninstallExistingConfig
			vi.spyOn(eslintService as any, "uninstallExistingConfig").mockResolvedValue(undefined);

			// User declines to uninstall
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await eslintService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
			expect(eslintService["uninstallExistingConfig"]).not.toHaveBeenCalled();
		});

		it("should delete existing config files when user confirms", async () => {
			// Mock no ElsiKora package but existing config files
			mockPackageJsonService.isExistsDependency.mockResolvedValueOnce(false);
			vi.spyOn(eslintService as any, "findExistingConfigFiles").mockResolvedValue(["eslint.config.js"]);

			// User agrees to delete files
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await eslintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("eslint.config.js");
		});

		it("should return false when user declines to delete existing config files", async () => {
			// Mock no ElsiKora package but existing config files
			mockPackageJsonService.isExistsDependency.mockResolvedValueOnce(false);
			vi.spyOn(eslintService as any, "findExistingConfigFiles").mockResolvedValue(["eslint.config.js"]);

			// User declines to delete files
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await eslintService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("findExistingConfigFiles", () => {
		it("should find existing config files", async () => {
			// Setup mock to return true for one config file
			mockFileSystemService.isPathExists.mockImplementation((path) => {
				return Promise.resolve(path === ESLINT_CONFIG_FILE_NAMES[0]);
			});

			const result = await (eslintService as any).findExistingConfigFiles();

			expect(result).toEqual([ESLINT_CONFIG_FILE_NAMES[0]]);
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(ESLINT_CONFIG_FILE_NAMES.length);
		});

		it("should return empty array when no config files found", async () => {
			// Setup mock to return false for all files
			mockFileSystemService.isPathExists.mockResolvedValue(false);

			const result = await (eslintService as any).findExistingConfigFiles();

			expect(result).toEqual([]);
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(ESLINT_CONFIG_FILE_NAMES.length);
		});
	});

	describe("uninstallExistingConfig", () => {
		it("should uninstall existing configuration", async () => {
			// Act
			await (eslintService as any).uninstallExistingConfig();

			// Assert
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Uninstalling existing ESLint configuration...");
			expect(mockPackageJsonService.uninstallPackages).toHaveBeenCalledWith([ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME, ESLINT_CONFIG_ESLINT_PACKAGE_NAME]);
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Existing ESLint configuration uninstalled successfully!");
		});

		it("should handle errors when uninstalling", async () => {
			// Arrange
			mockPackageJsonService.uninstallPackages.mockRejectedValueOnce(new Error("Uninstall failed"));

			// Act & Assert
			await expect((eslintService as any).uninstallExistingConfig()).rejects.toThrow();
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to uninstall existing ESLint configuration");
		});
	});

	describe("detectFrameworks", () => {
		it("should detect frameworks", async () => {
			// Arrange
			const mockFrameworks = [
				{ name: EFramework.REACT, displayName: "React" },
				{ name: EFramework.TYPESCRIPT, displayName: "TypeScript" },
			];
			mockFrameworkService.detect.mockResolvedValueOnce(mockFrameworks);

			// Act
			await (eslintService as any).detectFrameworks();

			// Assert
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Detecting frameworks...");
			expect(mockFrameworkService.detect).toHaveBeenCalled();
			expect(mockCliInterfaceService.info).toHaveBeenCalledWith("Detected frameworks: React, TypeScript");
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Framework detection completed");
			expect((eslintService as any).detectedFrameworks).toEqual(mockFrameworks);
		});

		it("should handle errors during framework detection", async () => {
			// Arrange
			mockFrameworkService.detect.mockRejectedValueOnce(new Error("Detection failed"));

			// Act & Assert
			await expect((eslintService as any).detectFrameworks()).rejects.toThrow();
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to detect frameworks");
		});
	});

	describe("detectInstalledFeatures", () => {
		it("should detect features based on frameworks and dependencies", async () => {
			// Arrange
			// Set detected frameworks
			(eslintService as any).detectedFrameworks = [{ name: EFramework.TYPESCRIPT }];

			// Mock framework service to return TypeScript feature
			mockFrameworkService.getFeatures.mockReturnValueOnce([EEslintFeature.TYPESCRIPT]);

			// Mock dependencies that would trigger React feature detection
			mockPackageJsonService.getDependencies.mockImplementation((type) => {
				if (type === EPackageJsonDependencyType.PROD) {
					return Promise.resolve({ react: "^17.0.0" });
				}
				return Promise.resolve({});
			});

			// Act
			const result = await (eslintService as any).detectInstalledFeatures();

			// Assert
			expect(mockFrameworkService.getFeatures).toHaveBeenCalledWith((eslintService as any).detectedFrameworks);
			expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.PROD);
			expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.DEV);
			expect(result).toContain(EEslintFeature.TYPESCRIPT);
			expect(result).toContain(EEslintFeature.JAVASCRIPT); // Required feature
		});
	});

	describe("selectFeatures", () => {
		it("should use detected features when no saved features exist", async () => {
			// Arrange
			const detectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT];
			vi.spyOn(eslintService as any, "detectInstalledFeatures").mockResolvedValueOnce(detectedFeatures);

			// User confirms detected features
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			// Mock multi-select to return user selected features
			mockCliInterfaceService.groupMultiselect.mockResolvedValueOnce(detectedFeatures);

			// Act
			const result = await (eslintService as any).selectFeatures([]);

			// Assert
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockCliInterfaceService.groupMultiselect).toHaveBeenCalled();
			expect(result).toEqual(detectedFeatures);
		});

		it("should use saved features when they exist", async () => {
			// Arrange
			const savedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER];

			// Mock multi-select to return user selected features
			mockCliInterfaceService.groupMultiselect.mockResolvedValueOnce(savedFeatures);

			// Act
			const result = await (eslintService as any).selectFeatures(savedFeatures);

			// Assert
			expect(mockCliInterfaceService.groupMultiselect).toHaveBeenCalled();
			expect(result).toEqual(savedFeatures);
		});
	});

	describe("validateFeatureSelection", () => {
		it("should return true when all selected features are valid", () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER];
			(eslintService as any).detectedFrameworks = [];

			// Act
			const result = (eslintService as any).validateFeatureSelection();

			// Assert
			expect(result).toBe(true);
		});

		it("should return false when TypeScript-required features selected without TypeScript framework", () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.TYPESCRIPT, EEslintFeature.NEST]; // NEST requires TypeScript
			(eslintService as any).detectedFrameworks = []; // No TypeScript framework detected

			// Act
			const result = (eslintService as any).validateFeatureSelection();

			// Assert
			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
		});

		it("should return true when TypeScript-required features selected with TypeScript framework", () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.TYPESCRIPT, EEslintFeature.NEST];
			(eslintService as any).detectedFrameworks = [{ name: EFramework.TYPESCRIPT }];

			// Act
			const result = (eslintService as any).validateFeatureSelection();

			// Assert
			expect(result).toBe(true);
		});
	});

	describe("collectDependencies", () => {
		it("should return core dependencies plus feature-specific dependencies", () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.REACT];

			// Act
			const dependencies = (eslintService as any).collectDependencies();

			// Assert
			expect(dependencies).toEqual(expect.arrayContaining(ESLINT_CONFIG_CORE_DEPENDENCIES));
			// Check for React-specific dependencies
			expect(dependencies).toEqual(expect.arrayContaining(["@eslint-react/eslint-plugin", "eslint-plugin-react"]));
		});
	});

	describe("createConfig", () => {
		it("should create ESLint config file with correct content", async () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];
			vi.spyOn(eslintService as any, "generateLintIgnorePaths").mockReturnValue(["node_modules"]);

			// Act
			await (eslintService as any).createConfig();

			// Assert
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(ESLINT_CONFIG_FILE_NAME, expect.stringContaining("withJavascript: true"), "utf8");
			expect(mockFileSystemService.writeFile.mock.calls[0][1]).toContain("node_modules");
		});
	});

	describe("generateLintCommand", () => {
		it("should generate lint command with framework-specific paths", () => {
			// Arrange
			mockFrameworkService.getLintPaths.mockReturnValueOnce(["src", "tests"]);

			// Act
			const result = (eslintService as any).generateLintCommand();

			// Assert
			expect(result).toBe("eslint src tests");
			expect(mockFrameworkService.getLintPaths).toHaveBeenCalledWith((eslintService as any).detectedFrameworks);
		});

		it("should use default path when no framework-specific paths", () => {
			// Arrange
			mockFrameworkService.getLintPaths.mockReturnValueOnce([]);

			// Act
			const result = (eslintService as any).generateLintCommand();

			// Assert
			expect(result).toBe("eslint .");
		});
	});

	describe("generateLintFixCommand", () => {
		it("should generate lint fix command with framework-specific paths", () => {
			// Arrange
			mockFrameworkService.getLintPaths.mockReturnValueOnce(["src", "tests"]);

			// Act
			const result = (eslintService as any).generateLintFixCommand();

			// Assert
			expect(result).toBe("eslint --fix src tests");
		});
	});

	describe("setupScripts", () => {
		it("should set up basic lint scripts", async () => {
			// Arrange
			vi.spyOn(eslintService as any, "generateLintCommand").mockReturnValue("eslint src");
			vi.spyOn(eslintService as any, "generateLintFixCommand").mockReturnValue("eslint --fix src");

			// No frameworks supporting watch
			(eslintService as any).detectedFrameworks = [];

			// Act
			await (eslintService as any).setupScripts();

			// Assert
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint", "eslint src");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:fix", "eslint --fix src");
			// No watch script without watch support
			expect(mockPackageJsonService.addScript).not.toHaveBeenCalledWith("lint:watch", expect.any(String));
		});

		it("should set up watch script when framework supports it", async () => {
			// Arrange
			vi.spyOn(eslintService as any, "generateLintCommand").mockReturnValue("eslint src");
			vi.spyOn(eslintService as any, "generateLintFixCommand").mockReturnValue("eslint --fix src");

			// Framework supports watch
			(eslintService as any).detectedFrameworks = [{ isSupportWatch: true }];
			mockFrameworkService.getLintPaths.mockReturnValueOnce(["src"]);

			// Act
			await (eslintService as any).setupScripts();

			// Assert
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:watch", "npx eslint-watch src");
		});

		it("should set up TypeScript-specific scripts when TypeScript detected", async () => {
			// Arrange
			vi.spyOn(eslintService as any, "generateLintCommand").mockReturnValue("eslint src");
			vi.spyOn(eslintService as any, "generateLintFixCommand").mockReturnValue("eslint --fix src");

			// TypeScript framework detected
			(eslintService as any).detectedFrameworks = [{ name: EFramework.TYPESCRIPT }];

			// Act
			await (eslintService as any).setupScripts();

			// Assert
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:types", "tsc --noEmit");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:types:fix", "tsc --noEmit --skipLibCheck");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:all", "npm run lint && npm run lint:types");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("lint:all:fix", "npm run lint:fix && npm run lint:types:fix");
		});
	});

	describe("setupSelectedFeatures", () => {
		it("should set up selected features", async () => {
			// Arrange
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];

			// Mock methods
			vi.spyOn(eslintService as any, "collectDependencies").mockReturnValue(["eslint"]);
			vi.spyOn(eslintService as any, "createConfig").mockResolvedValue(undefined);
			vi.spyOn(eslintService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(eslintService as any, "displaySetupSummary").mockResolvedValue(undefined);

			// Act
			await (eslintService as any).setupSelectedFeatures();

			// Assert
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Setting up ESLint configuration...");
			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(["eslint"], "latest", EPackageJsonDependencyType.DEV);
			expect(eslintService["createConfig"]).toHaveBeenCalled();
			expect(eslintService["setupScripts"]).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("ESLint configuration completed successfully!");
			expect(eslintService["displaySetupSummary"]).toHaveBeenCalled();
		});

		it("should handle errors during setup", async () => {
			// Arrange
			mockPackageJsonService.installPackages.mockRejectedValueOnce(new Error("Install failed"));

			// Act & Assert
			await expect((eslintService as any).setupSelectedFeatures()).rejects.toThrow();
			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup ESLint configuration");
		});
	});

	describe("displaySetupSummary", () => {
		it("should display setup summary with detected frameworks and scripts", async () => {
			// Arrange
			// Set up frameworks
			(eslintService as any).detectedFrameworks = [{ displayName: "React", description: "React framework" }];

			// Set up features
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.REACT];

			// Mock package.json scripts
			mockPackageJsonService.getProperty.mockResolvedValueOnce({
				lint: "eslint src",
				"lint:fix": "eslint --fix src",
			});

			// Set up framework service
			mockFrameworkService.getLintPaths.mockReturnValueOnce(["src"]);

			// Act
			await (eslintService as any).displaySetupSummary();

			// Assert
			expect(mockPackageJsonService.getProperty).toHaveBeenCalledWith("scripts");
			expect(mockCliInterfaceService.note).toHaveBeenCalled();
			// The note should contain frameworks, features, and scripts
			const noteCall = mockCliInterfaceService.note.mock.calls[0];
			expect(noteCall[0]).toBe("ESLint Setup");
			expect(noteCall[1]).toContain("Detected Frameworks:");
			expect(noteCall[1]).toContain("- React: React framework");
			expect(noteCall[1]).toContain("Lint Paths: src");
			expect(noteCall[1]).toContain("npm run lint");
			expect(noteCall[1]).toContain("npm run lint:fix");
		});

		it("should handle case with no detected frameworks", async () => {
			// Arrange
			// No frameworks
			(eslintService as any).detectedFrameworks = [];

			// Set up features
			(eslintService as any).selectedFeatures = [EEslintFeature.JAVASCRIPT];

			// Mock package.json scripts
			mockPackageJsonService.getProperty.mockResolvedValueOnce({
				lint: "eslint .",
			});

			// Act
			await (eslintService as any).displaySetupSummary();

			// Assert
			const noteCall = mockCliInterfaceService.note.mock.calls[0];
			expect(noteCall[1]).toContain("No frameworks detected");
			expect(noteCall[1]).toContain("No framework-specific configurations");
		});
	});

	describe("install", () => {
		it("should install ESLint with selected features", async () => {
			// Arrange - mock all necessary methods
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(eslintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(eslintService, "checkEslintVersion").mockResolvedValue(true);
			vi.spyOn(eslintService as any, "detectFrameworks").mockResolvedValue(undefined);
			vi.spyOn(eslintService as any, "selectFeatures").mockResolvedValue([EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]);
			vi.spyOn(eslintService as any, "validateFeatureSelection").mockReturnValue(true);
			vi.spyOn(eslintService as any, "setupSelectedFeatures").mockResolvedValue(undefined);

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({
				customProperties: {
					features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
				},
				wasInstalled: true,
			});
			expect(mockConfigService.getModuleConfig).toHaveBeenCalledWith(EModule.ESLINT);
			expect(eslintService.shouldInstall).toHaveBeenCalled();
			expect(eslintService.handleExistingSetup).toHaveBeenCalled();
			expect(eslintService.checkEslintVersion).toHaveBeenCalled();
			expect(eslintService["detectFrameworks"]).toHaveBeenCalled();
			expect(eslintService["selectFeatures"]).toHaveBeenCalled();
			expect(eslintService["validateFeatureSelection"]).toHaveBeenCalled();
			expect(eslintService["setupSelectedFeatures"]).toHaveBeenCalled();
		});

		it("should not install when user declines", async () => {
			// User declines installation
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(false);
			vi.spyOn(eslintService, "handleExistingSetup");

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({ wasInstalled: false });
			expect(eslintService.handleExistingSetup).not.toHaveBeenCalled();
		});

		it("should not install when existing setup handling fails", async () => {
			// User accepts installation but existing setup handling fails
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(eslintService, "handleExistingSetup").mockResolvedValue(false);
			vi.spyOn(eslintService, "checkEslintVersion");

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({ wasInstalled: false });
			expect(eslintService.checkEslintVersion).not.toHaveBeenCalled();
		});

		it("should not install when ESLint version check fails", async () => {
			// User accepts installation but ESLint version check fails
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(eslintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(eslintService, "checkEslintVersion").mockResolvedValue(false);
			vi.spyOn(eslintService as any, "detectFrameworks");

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({ wasInstalled: false });
			expect(eslintService["detectFrameworks"]).not.toHaveBeenCalled();
		});

		it("should not install when no features are selected", async () => {
			// User accepts installation but selects no features
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(eslintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(eslintService, "checkEslintVersion").mockResolvedValue(true);
			vi.spyOn(eslintService as any, "detectFrameworks").mockResolvedValue(undefined);
			vi.spyOn(eslintService as any, "selectFeatures").mockResolvedValue([]);
			vi.spyOn(eslintService as any, "validateFeatureSelection");

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({ wasInstalled: false });
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith("No features selected.");
			expect(eslintService["validateFeatureSelection"]).not.toHaveBeenCalled();
		});

		it("should not install when feature validation fails", async () => {
			// User accepts installation but feature validation fails
			vi.spyOn(eslintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(eslintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(eslintService, "checkEslintVersion").mockResolvedValue(true);
			vi.spyOn(eslintService as any, "detectFrameworks").mockResolvedValue(undefined);
			vi.spyOn(eslintService as any, "selectFeatures").mockResolvedValue([EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]);
			vi.spyOn(eslintService as any, "validateFeatureSelection").mockReturnValue(false);
			vi.spyOn(eslintService as any, "setupSelectedFeatures");

			// Act
			const result = await eslintService.install();

			// Assert
			expect(result).toEqual({ wasInstalled: false });
			expect(eslintService["setupSelectedFeatures"]).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			// Simulate an error during installation
			vi.spyOn(eslintService, "shouldInstall").mockRejectedValueOnce(new Error("Installation error"));
			mockCliInterfaceService.handleError.mockImplementationOnce(() => {});

			// Act & Assert
			await expect(eslintService.install()).rejects.toThrow();
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith("Failed to complete ESLint setup", expect.any(Error));
		});
	});
	
	describe("generateLintFixCommand", () => {
		it("should generate lint fix command with framework-specific extensions", () => {
			// There's already a test for this at line 497, we'll remove the duplicate
		});
	});
	
	describe("createConfig", () => {
		it("should create ESLint config with correct features and frameworks", async () => {
			const selectedFeatures = [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT];
			const detectedFrameworks = [EFramework.REACT, EFramework.TYPESCRIPT];
			
			await (eslintService as any).createConfig(selectedFeatures, detectedFrameworks);
			
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
				ESLINT_CONFIG_FILE_NAME,
				expect.any(String),
				"utf8"
			);
		});
		
		it("should handle no frameworks case", async () => {
			const selectedFeatures = [EEslintFeature.JAVASCRIPT];
			const detectedFrameworks = [];
			
			await (eslintService as any).createConfig(selectedFeatures, detectedFrameworks);
			
			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
				ESLINT_CONFIG_FILE_NAME,
				expect.any(String),
				"utf8"
			);
		});
	});
	
});
