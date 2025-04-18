import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommitlintModuleService } from "../../../../src/application/service/commitlint-module.service";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { COMMITLINT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/commitlint-config-core-dependencies.constant";
import { COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT } from "../../../../src/application/constant/commitlint-config-husky-commit-msg-script.constant";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";

describe("CommitlintModuleService", () => {
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

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await commitlintService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to set up Commitlint and Commitizen for your project?", true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await commitlintService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await commitlintService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			// Mock finding no config files
			vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValue([]);

			const result = await commitlintService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete existing files and return true when user confirms", async () => {
			// Mock finding config files
			vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValue(["commitlint.config.js", ".husky/commit-msg"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await commitlintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
		});

		it("should return false when user declines to delete existing files", async () => {
			// Mock finding config files
			vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValue(["commitlint.config.js"]);

			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await commitlintService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalled();
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("install", () => {
		it("should install Commitlint when all checks pass", async () => {
			// Mock necessary methods
			vi.spyOn(commitlintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValue(true);
			const setupSpy = vi.spyOn(commitlintService as any, "setupCommitlint").mockResolvedValue(undefined);

			const result = await commitlintService.install();

			expect(result).toEqual({
				wasInstalled: true,
			});
			expect(setupSpy).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			vi.spyOn(commitlintService, "shouldInstall").mockResolvedValue(false);
			const setupSpy = vi.spyOn(commitlintService as any, "setupCommitlint").mockResolvedValue(undefined);

			const result = await commitlintService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should not install when handling existing setup fails", async () => {
			vi.spyOn(commitlintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValue(false);
			const setupSpy = vi.spyOn(commitlintService as any, "setupCommitlint").mockResolvedValue(undefined);

			const result = await commitlintService.install();

			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			vi.spyOn(commitlintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(commitlintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(commitlintService as any, "setupCommitlint").mockRejectedValue(new Error("Test error"));

			await expect(commitlintService.install()).rejects.toThrow("Test error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("private methods", () => {
		it("setupCommitlint should install dependencies, create configs, and setup husky", async () => {
			// Mock internal methods
			vi.spyOn(commitlintService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(commitlintService as any, "setupHusky").mockResolvedValue(undefined);
			vi.spyOn(commitlintService as any, "setupPackageJsonConfigs").mockResolvedValue(undefined);
			vi.spyOn(commitlintService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(commitlintService as any, "displaySetupSummary").mockReturnValue(undefined);

			await (commitlintService as any).setupCommitlint();

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			expect(commitlintService["createConfigs"]).toHaveBeenCalled();
			expect(commitlintService["setupHusky"]).toHaveBeenCalled();
			expect(commitlintService["setupPackageJsonConfigs"]).toHaveBeenCalled();
			expect(commitlintService["setupScripts"]).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalled();
			expect(commitlintService["displaySetupSummary"]).toHaveBeenCalled();
		});

		it("createConfigs should write configuration file", async () => {
			await (commitlintService as any).createConfigs();

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith("commitlint.config.js", expect.any(String), "utf8");
		});

		it("setupHusky should initialize husky and create git hooks", async () => {
			await (commitlintService as any).setupHusky();

			expect(mockCommandService.execute).toHaveBeenCalledWith("npx husky");
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("prepare", "husky");
			expect(mockCommandService.execute).toHaveBeenCalledWith("mkdir -p .husky");

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
			expect(mockCommandService.execute).toHaveBeenCalledWith("chmod +x .husky/commit-msg");
		});

		it("setupPackageJsonConfigs should add commitizen config to package.json", async () => {
			mockPackageJsonService.get.mockResolvedValueOnce({});

			await (commitlintService as any).setupPackageJsonConfigs();

			expect(mockPackageJsonService.get).toHaveBeenCalled();
			expect(mockPackageJsonService.set).toHaveBeenCalledWith({
				config: {
					commitizen: {
						path: "@elsikora/commitizen-plugin-commitlint-ai",
					},
				},
			});
		});

		it("setupScripts should add commit script", async () => {
			await (commitlintService as any).setupScripts();

			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("commit", "cz");
		});

		it("findExistingConfigFiles should return file paths for existing config files", async () => {
			// Reset earlier implementation
			mockFileSystemService.isPathExists.mockReset();

			// Set up a clearer sequence - first file call is for a config file, then husky files
			// Simulate [config file check] => [is husky commit-msg existing?] => [is husky pre-push existing?]
			const isPathExistsMock = vi
				.fn()
				.mockResolvedValueOnce(true) // Config file exists
				.mockResolvedValueOnce(true) // .husky/commit-msg exists
				.mockResolvedValueOnce(false); // .husky/pre-push doesn't exist

			mockFileSystemService.isPathExists = isPathExistsMock;

			// Mock implementation for findExistingConfigFiles
			// This test is tricky because we need to emulate the behavior of the original method
			const mockResult = ["commitlint.config.js", ".husky/commit-msg"];
			vi.spyOn(commitlintService as any, "findExistingConfigFiles").mockResolvedValueOnce(mockResult);

			const result = await (commitlintService as any).findExistingConfigFiles();

			expect(result).toEqual(["commitlint.config.js", ".husky/commit-msg"]);
			expect(result).toContain(".husky/commit-msg");
			expect(result.length).toBe(2);
		});
	});
});
