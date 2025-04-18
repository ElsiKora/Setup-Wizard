import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommitlintModuleService } from "../../../../src/application/service/commitlint-module.service";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/commitlint-config-core-dependencies.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../../../../src/application/constant/commitlint-config-husky-commit-msg-script.constant";
import { COMMITLINT_CONFIG_FILE_NAMES } from "../../../../src/application/constant/commitlint-config-file-names.constant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

/**
 * Enhanced test file specifically designed to improve line and function coverage
 * for the CommitlintModuleService class.
 */
describe("CommitlintModuleService Full Coverage", () => {
	// Mocks
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
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

	const mockCommandService = {
		execute: vi.fn(),
	};

	// Mock PackageJsonService
	const mockPackageJsonService = {
		installPackages: vi.fn(),
		addScript: vi.fn(),
		get: vi.fn(),
		set: vi.fn(),
	};

	// Service instance
	let commitlintService: CommitlintModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockPackageJsonService.get.mockResolvedValue({ scripts: {} });

		// Create service instance with mocks
		commitlintService = new CommitlintModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);

		// Mock internal services
		vi.spyOn(commitlintService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
		vi.spyOn(commitlintService as any, "COMMAND_SERVICE", "get").mockReturnValue(mockCommandService);
	});

	// Thorough test of the findExistingConfigFiles method
	it("should find all existing configuration files", async () => {
		// Reset isPathExists mock to set up specific return values
		mockFileSystemService.isPathExists.mockReset();

		// Setup mock to return true for specific files
		mockFileSystemService.isPathExists.mockImplementation((path) => {
			// Return true for commitlint.config.js and .husky/commit-msg
			if (path === "commitlint.config.js" || path === ".husky/commit-msg") {
				return Promise.resolve(true);
			}
			return Promise.resolve(false);
		});

		// Directly call the private method using "as any" to access it
		const existingFiles = await (commitlintService as any).findExistingConfigFiles();

		// Verify the result
		expect(existingFiles).toContain("commitlint.config.js");
		expect(existingFiles).toContain(".husky/commit-msg");
		expect(existingFiles.length).toBe(2);

		// Verify isPathExists was called for all expected files
		expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith("commitlint.config.js");
		expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith(".husky/commit-msg");

		// Test with all files existing
		mockFileSystemService.isPathExists.mockReset();
		mockFileSystemService.isPathExists.mockResolvedValue(true);

		const allExistingFiles = await (commitlintService as any).findExistingConfigFiles();

		// Verify that all possible files are returned when they all exist
		expect(allExistingFiles.length).toBeGreaterThanOrEqual(3); // At least 3 files (config file plus 2 hooks)
		expect(allExistingFiles).toContain(".husky/commit-msg");
		expect(allExistingFiles).toContain(COMMITLINT_CONFIG_FILE_NAMES[0]);
	});

	// Test setupCommitlint error handling
	it("should handle errors in setupCommitlint", async () => {
		// Mock installPackages to throw an error
		mockPackageJsonService.installPackages.mockRejectedValue(new Error("Package installation failed"));

		// Call the private method directly
		await expect((commitlintService as any).setupCommitlint()).rejects.toThrow("Package installation failed");

		// Verify error handling
		expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
		expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup Commitlint and Commitizen configuration");
	});

	// Test setupPackageJsonConfigs with different package.json structures
	it("should properly set up package.json configs with different initial states", async () => {
		// Test with empty package.json
		mockPackageJsonService.get.mockResolvedValueOnce({});

		await (commitlintService as any).setupPackageJsonConfigs();

		// Verify it correctly creates the config object
		expect(mockPackageJsonService.set).toHaveBeenCalledWith({
			config: {
				commitizen: {
					path: "@elsikora/commitizen-plugin-commitlint-ai",
				},
			},
		});

		// Test with existing config but no commitizen
		mockPackageJsonService.get.mockResolvedValueOnce({
			config: {
				existingConfig: "value",
			},
		});

		await (commitlintService as any).setupPackageJsonConfigs();

		// Verify it correctly updates the config object
		expect(mockPackageJsonService.set).toHaveBeenCalledWith({
			config: {
				existingConfig: "value",
				commitizen: {
					path: "@elsikora/commitizen-plugin-commitlint-ai",
				},
			},
		});

		// Test with existing config and commitizen
		mockPackageJsonService.get.mockResolvedValueOnce({
			config: {
				commitizen: {
					path: "existing-path",
				},
			},
		});

		await (commitlintService as any).setupPackageJsonConfigs();

		// Verify it overwrites the existing commitizen config
		expect(mockPackageJsonService.set).toHaveBeenCalledWith({
			config: {
				commitizen: {
					path: "@elsikora/commitizen-plugin-commitlint-ai",
				},
			},
		});
	});

	// Test displaySetupSummary method
	it("should display the setup summary", () => {
		// Call the private method directly
		(commitlintService as any).displaySetupSummary();

		// Verify that note is called with the expected content
		expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Commitlint Setup", expect.stringContaining("Commitlint and Commitizen configuration has been created."));
		expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Commitlint Setup", expect.stringContaining("npm run commit"));
	});

	// Test createConfigs method
	it("should create the commitlint configuration file", async () => {
		await (commitlintService as any).createConfigs();

		// Verify that writeFile is called with the expected content
		expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("commitlint.config.js", expect.any(String), "utf8");
	});

	// Test setupHusky method
	it("should set up husky git hooks", async () => {
		await (commitlintService as any).setupHusky();

		// Verify that all expected commands and file operations are executed
		expect(mockCommandService.execute).toHaveBeenCalledWith("npx husky");
		expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("prepare", "husky");
		expect(mockCommandService.execute).toHaveBeenCalledWith("mkdir -p .husky");

		// Verify commit-msg hook
		expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
		expect(mockCommandService.execute).toHaveBeenCalledWith("chmod +x .husky/commit-msg");
	});

	// Test setupScripts method
	it("should set up npm scripts", async () => {
		await (commitlintService as any).setupScripts();

		// Verify that addScript is called with the expected arguments
		expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("commit", "cz");
	});

	// Comprehensive test of handleExistingSetup with various scenarios
	it("should handle existing setup in different scenarios", async () => {
		// Reset all mocks
		vi.clearAllMocks();

		// Scenario 1: No existing files
		// Mock finding no config files
		vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValueOnce([]);

		let result = await commitlintService.handleExistingSetup();
		expect(result).toBe(true);
		expect(mockCliInterfaceService.confirm).not.toHaveBeenCalled();
		expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();

		// Scenario 2: Existing files, user confirms deletion
		vi.clearAllMocks();
		// Mock finding config file
		vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValueOnce(["commitlint.config.js"]);
		mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

		result = await commitlintService.handleExistingSetup();
		expect(result).toBe(true);
		expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
		expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("commitlint.config.js");

		// Scenario 3: Existing files, user declines deletion
		vi.clearAllMocks();
		vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValueOnce(["commitlint.config.js", ".husky/commit-msg"]);
		mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

		result = await commitlintService.handleExistingSetup();
		expect(result).toBe(false);
		expect(mockCliInterfaceService.warn).toHaveBeenCalled();
		// In this case, deleteFile should not be called at all
		expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
	});

	// Comprehensive test of the install method to cover all branches
	it("should handle all branches in the install method", async () => {
		// Reset all mocks
		vi.clearAllMocks();

		// Scenario 1: shouldInstall returns false
		vi.spyOn(commitlintService, "shouldInstall").mockResolvedValueOnce(false);

		let result = await commitlintService.install();
		expect(result).toEqual({ wasInstalled: false });

		// Scenario 2: shouldInstall returns true, handleExistingSetup returns false
		vi.clearAllMocks();
		vi.spyOn(commitlintService, "shouldInstall").mockResolvedValueOnce(true);
		vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValueOnce(false);

		result = await commitlintService.install();
		expect(result).toEqual({ wasInstalled: false });

		// Scenario 3: shouldInstall returns true, handleExistingSetup returns true, setupCommitlint succeeds
		vi.clearAllMocks();
		vi.spyOn(commitlintService, "shouldInstall").mockResolvedValueOnce(true);
		vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValueOnce(true);
		vi.spyOn(commitlintService as any, "setupCommitlint").mockResolvedValueOnce(undefined);

		result = await commitlintService.install();
		expect(result).toEqual({ wasInstalled: true });

		// Scenario 4: shouldInstall returns true, handleExistingSetup returns true, setupCommitlint throws
		vi.clearAllMocks();
		vi.spyOn(commitlintService, "shouldInstall").mockResolvedValueOnce(true);
		vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValueOnce(true);
		vi.spyOn(commitlintService as any, "setupCommitlint").mockRejectedValueOnce(new Error("Setup failed"));

		await expect(commitlintService.install()).rejects.toThrow("Setup failed");
		expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith("Failed to complete Commitlint setup", expect.any(Error));
	});

	// Comprehensive test of the shouldInstall method to cover all branches
	it("should handle all branches in the shouldInstall method", async () => {
		// Scenario 1: CLI confirm and config both return true
		mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
		mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

		let result = await commitlintService.shouldInstall();
		expect(result).toBe(true);
		expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to set up Commitlint and Commitizen for your project?", true);

		// Scenario 2: CLI confirm returns false
		mockCliInterfaceService.confirm.mockResolvedValueOnce(false);
		mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

		result = await commitlintService.shouldInstall();
		expect(result).toBe(false);

		// Scenario 3: CLI confirm throws an error
		mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Confirmation failed"));

		result = await commitlintService.shouldInstall();
		expect(result).toBe(false);
		expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith("Failed to get user confirmation", expect.any(Error));
	});
});
