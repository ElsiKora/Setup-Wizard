import { describe, it, expect, vi, beforeEach } from "vitest";
import { SemanticReleaseModuleService } from "../../../../src/application/service/semantic-release-module.service";
import { createMockCLIInterfaceService, createMockConfigService, createMockFileSystemService } from "../../../helpers/test-utils";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAMES } from "../../../../src/application/constant/semantic-release-config-file-names.constant";
import { SEMANTIC_RELEASE_CONFIG_FILE_NAME } from "../../../../src/application/constant/semantic-release-config-file-name.constant";
import { SEMANTIC_RELEASE_CONFIG } from "../../../../src/application/constant/semantic-release-config.constant";
import { SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/semantic-release-config-core-dependencies.constant";

describe("SemanticReleaseModuleService", () => {
	// Mocks
	const mockCliInterfaceService = createMockCLIInterfaceService();
	const mockFileSystemService = createMockFileSystemService();
	const mockConfigService = createMockConfigService();
	const mockPackageJsonService = {
		addScript: vi.fn(),
		installPackages: vi.fn(),
		get: vi.fn(),
	};

	// Service instance
	let semanticReleaseService: SemanticReleaseModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock implementations
		mockCliInterfaceService.confirm.mockReset();
		mockCliInterfaceService.text.mockReset();
		mockCliInterfaceService.startSpinner.mockReset();
		mockCliInterfaceService.stopSpinner.mockReset();
		mockCliInterfaceService.note.mockReset();
		mockCliInterfaceService.warn.mockReset();
		mockCliInterfaceService.success.mockReset();
		mockConfigService.getModuleConfig.mockReset();
		mockConfigService.isModuleEnabled.mockReset();
		mockFileSystemService.isPathExists.mockReset();
		mockFileSystemService.writeFile.mockReset();
		mockFileSystemService.deleteFile.mockReset();
		mockPackageJsonService.addScript.mockReset();
		mockPackageJsonService.installPackages.mockReset();
		mockPackageJsonService.get.mockReset();

		// Default implementations
		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockCliInterfaceService.text.mockImplementation(async (prompt, def, initial) => initial || def || "");
		mockConfigService.getModuleConfig.mockResolvedValue({});
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockPackageJsonService.addScript.mockResolvedValue(undefined);
		mockPackageJsonService.installPackages.mockResolvedValue(undefined);
		mockPackageJsonService.get.mockResolvedValue({ repository: "https://github.com/user/repo.git" });

		// Create service instance with mocks
		semanticReleaseService = new SemanticReleaseModuleService(mockCliInterfaceService, mockFileSystemService, mockConfigService);

		// Mock PACKAGE_JSON_SERVICE property
		vi.spyOn(semanticReleaseService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("should return true when user confirms installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await semanticReleaseService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to set up Semantic Release for automated versioning and publishing?", true);
		});

		it("should return false when user declines installation", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await semanticReleaseService.shouldInstall();

			expect(result).toBe(false);
		});

		it("should return false when an error occurs", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await semanticReleaseService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("findExistingConfigFiles", () => {
		it("should find existing semantic-release config files", async () => {
			// Mock finding config files
			mockFileSystemService.isPathExists.mockImplementation(async (file) => {
				return file === "release.config.js" || file === "CHANGELOG.md";
			});

			const result = await (semanticReleaseService as any).findExistingConfigFiles();

			expect(result).toEqual(["release.config.js", "CHANGELOG.md"]);
			// Should check all possible config files plus changelog locations
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledTimes(
				SEMANTIC_RELEASE_CONFIG_FILE_NAMES.length + 2, // +2 for CHANGELOG.md checks
			);
		});

		it("should check for legacy changelog location", async () => {
			mockFileSystemService.isPathExists.mockImplementation(async (file) => {
				return file === "docs/CHANGELOG.md";
			});

			const result = await (semanticReleaseService as any).findExistingConfigFiles();

			expect(result).toEqual(["docs/CHANGELOG.md"]);
			expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith("docs/CHANGELOG.md");
		});

		it("should return empty array when no config files exist", async () => {
			mockFileSystemService.isPathExists.mockResolvedValue(false);

			const result = await (semanticReleaseService as any).findExistingConfigFiles();

			expect(result).toEqual([]);
		});
	});

	describe("handleExistingSetup", () => {
		it("should return true when no existing configuration is found", async () => {
			vi.spyOn(semanticReleaseService as any, "findExistingConfigFiles").mockResolvedValueOnce([]);

			const result = await semanticReleaseService.handleExistingSetup();

			expect(result).toBe(true);
		});

		it("should ask to delete when existing files are found and user confirms", async () => {
			vi.spyOn(semanticReleaseService as any, "findExistingConfigFiles").mockResolvedValueOnce(["release.config.js", "CHANGELOG.md"]);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await semanticReleaseService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(expect.stringContaining("Existing Semantic Release configuration files detected"), true);
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledTimes(2);
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("release.config.js");
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith("CHANGELOG.md");
		});

		it("should return false when user declines to delete existing files", async () => {
			vi.spyOn(semanticReleaseService as any, "findExistingConfigFiles").mockResolvedValueOnce(["release.config.js"]);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await semanticReleaseService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith("Existing Semantic Release configuration files detected. Setup aborted.");
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});
	});

	describe("getRepositoryUrl", () => {
		it("should use config repository URL if available", async () => {
			// Mock config with a repository URL
			(semanticReleaseService as any).config = { repositoryUrl: "https://github.com/test/repo" };

			const result = await (semanticReleaseService as any).getRepositoryUrl();

			expect(result).toBe("https://github.com/test/repo");
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(expect.stringContaining("Found repository URL: https://github.com/test/repo"), true);
		});

		it("should extract repository URL from package.json string", async () => {
			// Mock package.json with string repository
			mockPackageJsonService.get.mockResolvedValueOnce({ repository: "https://github.com/user/repo.git" });

			const result = await (semanticReleaseService as any).getRepositoryUrl();

			expect(result).toBe("https://github.com/user/repo");
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(expect.stringContaining("Found repository URL: https://github.com/user/repo"), true);
		});

		it("should extract repository URL from package.json object", async () => {
			// Mock package.json with object repository
			mockPackageJsonService.get.mockResolvedValueOnce({
				repository: { url: "git+https://github.com/user/repo.git" },
			});

			const result = await (semanticReleaseService as any).getRepositoryUrl();

			expect(result).toBe("https://github.com/user/repo");
		});

		it("should prompt for repository URL when none is found", async () => {
			// Mock empty package.json
			mockPackageJsonService.get.mockResolvedValueOnce({});
			mockCliInterfaceService.text.mockResolvedValueOnce("https://github.com/manual/entry");

			const result = await (semanticReleaseService as any).getRepositoryUrl();

			expect(result).toBe("https://github.com/manual/entry");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, undefined, expect.any(Function));
		});

		it("should allow user to override detected repository URL", async () => {
			// User rejects the found URL
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);
			mockCliInterfaceService.text.mockResolvedValueOnce("https://gitlab.com/override/repo");

			const result = await (semanticReleaseService as any).getRepositoryUrl();

			expect(result).toBe("https://gitlab.com/override/repo");
		});

		it("should validate URL format when prompting for new repository URL after rejecting found URL", async () => {
			// User rejects the found URL
			mockPackageJsonService.get.mockResolvedValueOnce({
				repository: { url: "git+https://github.com/user/repo.git" },
			});
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			// Simulate the validation function being called
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementation((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("https://github.com/valid/repo");
			});

			await (semanticReleaseService as any).getRepositoryUrl();

			// Now test the validator directly
			expect(validatorFn).toBeDefined();
			// Should require a URL
			expect(validatorFn!("")).toBe("Repository URL is required");
			// Should require http/https protocol
			expect(validatorFn!("git@github.com:user/repo.git")).toBe("Repository URL must start with 'https://' or 'http://'");
			// Valid URL should pass
			expect(validatorFn!("https://github.com/user/repo")).toBeUndefined();
		});

		it("should validate URL format when prompting for repository URL when none is found", async () => {
			// Mock empty package.json
			mockPackageJsonService.get.mockResolvedValueOnce({});

			// Simulate the validation function being called
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementation((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("https://github.com/valid/repo");
			});

			await (semanticReleaseService as any).getRepositoryUrl();

			// Now test the validator directly
			expect(validatorFn).toBeDefined();
			// Should require a URL
			expect(validatorFn!("")).toBe("Repository URL is required");
			// Should require http/https protocol
			expect(validatorFn!("git@github.com:user/repo.git")).toBe("Repository URL must start with 'https://' or 'http://'");
			// Valid URL should pass
			expect(validatorFn!("https://github.com/user/repo")).toBeUndefined();
		});
	});

	describe("Branch and Channel Configuration", () => {
		it("getMainBranch should return main branch with validation", async () => {
			mockCliInterfaceService.text.mockResolvedValueOnce("master");

			const result = await (semanticReleaseService as any).getMainBranch();

			expect(result).toBe("master");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith("Enter the name of your main release branch:", "main", "main", expect.any(Function));
		});

		it("getMainBranch should validate branch name format", async () => {
			// Capture the validator function
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementationOnce((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("valid-branch");
			});

			await (semanticReleaseService as any).getMainBranch();

			// Test the validator with invalid branch names
			expect(validatorFn).toBeDefined();
			expect(validatorFn!("branch with spaces")).toBe("Branch name cannot contain spaces");
			expect(validatorFn!("")).toBe("Branch name is required");
			expect(validatorFn!("valid-branch")).toBeUndefined(); // Should pass validation
		});

		it("getPreReleaseBranch should return pre-release branch with validation", async () => {
			mockCliInterfaceService.text.mockResolvedValueOnce("develop");

			const result = await (semanticReleaseService as any).getPreReleaseBranch();

			expect(result).toBe("develop");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith("Enter the name of your pre-release branch:", "dev", "dev", expect.any(Function));
		});

		it("getPreReleaseBranch should validate branch name format", async () => {
			// Capture the validator function
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementationOnce((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("valid-branch");
			});

			await (semanticReleaseService as any).getPreReleaseBranch();

			// Test the validator with invalid branch names
			expect(validatorFn).toBeDefined();
			expect(validatorFn!("branch with spaces")).toBe("Branch name cannot contain spaces");
			expect(validatorFn!("")).toBe("Branch name is required");
			expect(validatorFn!("valid-branch")).toBeUndefined(); // Should pass validation
		});

		it("getPreReleaseChannel should return pre-release channel with validation", async () => {
			mockCliInterfaceService.text.mockResolvedValueOnce("alpha");

			const result = await (semanticReleaseService as any).getPreReleaseChannel();

			expect(result).toBe("alpha");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith("Enter the pre-release channel name (e.g., beta, alpha, next):", "beta", "beta", expect.any(Function));
		});

		it("getPreReleaseChannel should validate channel name format", async () => {
			// Capture the validator function
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementationOnce((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("alpha");
			});

			await (semanticReleaseService as any).getPreReleaseChannel();

			// Test the validator with invalid channel names
			expect(validatorFn).toBeDefined();
			expect(validatorFn!("space in channel")).toBe("Channel name cannot contain spaces");
			expect(validatorFn!("")).toBe("Channel name is required");
			expect(validatorFn!("alpha")).toBeUndefined(); // Should pass validation
		});

		it("getDevelopBranch should return development branch with validation", async () => {
			mockCliInterfaceService.text.mockResolvedValueOnce("development");

			const result = await (semanticReleaseService as any).getDevelopBranch();

			expect(result).toBe("development");
			expect(mockCliInterfaceService.text).toHaveBeenCalledWith("Enter the name of your development branch for backmerge:", "dev", "dev", expect.any(Function));
		});

		it("getDevelopBranch should validate branch name format", async () => {
			// Capture the validator function
			let validatorFn: Function | undefined;
			mockCliInterfaceService.text.mockImplementationOnce((prompt, def, initial, validator) => {
				validatorFn = validator;
				return Promise.resolve("develop");
			});

			await (semanticReleaseService as any).getDevelopBranch();

			// Test the validator with invalid branch names
			expect(validatorFn).toBeDefined();
			expect(validatorFn!("branch with spaces")).toBe("Branch name cannot contain spaces");
			expect(validatorFn!("")).toBe("Branch name is required");
			expect(validatorFn!("develop")).toBeUndefined(); // Should pass validation
		});

		it("isPrereleaseEnabledChannel should prompt for pre-release channel config", async () => {
			// Set config with prerelease enabled
			(semanticReleaseService as any).config = { isPrereleaseEnabled: true };
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await (semanticReleaseService as any).isPrereleaseEnabledChannel();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to configure a pre-release channel for development branches?", true);
		});

		it("isBackmergeEnabled should prompt for backmerge config", async () => {
			// Set config with backmerge enabled
			(semanticReleaseService as any).config = { isBackmergeEnabled: true };
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);

			const result = await (semanticReleaseService as any).isBackmergeEnabled("main");

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith("Do you want to enable automatic backmerge from main to development branch after release?", true);
		});
	});

	describe("createConfigs", () => {
		it("should create config file with required parameters", async () => {
			await (semanticReleaseService as any).createConfigs("https://github.com/test/repo", "main");

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template("https://github.com/test/repo", "main", undefined, undefined, false, undefined), "utf8");
		});

		it("should include pre-release and backmerge configuration when provided", async () => {
			await (semanticReleaseService as any).createConfigs("https://github.com/test/repo", "main", "dev", "beta", true, "develop");

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template("https://github.com/test/repo", "main", "dev", "beta", true, "develop"), "utf8");
		});
	});

	describe("setupScripts", () => {
		it("should add semantic-release scripts to package.json", async () => {
			await (semanticReleaseService as any).setupScripts();

			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith("release", "semantic-release");
		});
	});

	describe("displaySetupSummary", () => {
		it("should display basic setup summary", () => {
			(semanticReleaseService as any).displaySetupSummary("main");

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Semantic Release Setup", expect.stringContaining("Semantic Release configuration has been created."));
			expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Semantic Release Setup", expect.stringContaining("Main release branch: main"));
		});

		it("should include pre-release information in summary when provided", () => {
			(semanticReleaseService as any).displaySetupSummary("main", "dev", "beta");

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Semantic Release Setup", expect.stringContaining("Pre-release branch: dev (channel: beta)"));
		});

		it("should include backmerge information in summary when enabled", () => {
			(semanticReleaseService as any).displaySetupSummary("main", undefined, undefined, true, "develop");

			expect(mockCliInterfaceService.note).toHaveBeenCalledWith("Semantic Release Setup", expect.stringContaining("Backmerge enabled: Changes from main will be automatically merged to develop after release"));
		});
	});

	describe("setupSemanticRelease", () => {
		it("should set up semantic-release with complete configuration workflow", async () => {
			// Mock all the setup methods
			vi.spyOn(semanticReleaseService as any, "getRepositoryUrl").mockResolvedValueOnce("https://github.com/test/repo");
			vi.spyOn(semanticReleaseService as any, "getMainBranch").mockResolvedValueOnce("main");
			vi.spyOn(semanticReleaseService as any, "isPrereleaseEnabledChannel").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService as any, "getPreReleaseBranch").mockResolvedValueOnce("dev");
			vi.spyOn(semanticReleaseService as any, "getPreReleaseChannel").mockResolvedValueOnce("beta");
			vi.spyOn(semanticReleaseService as any, "isBackmergeEnabled").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService as any, "getDevelopBranch").mockResolvedValueOnce("develop");
			vi.spyOn(semanticReleaseService as any, "createConfigs").mockResolvedValueOnce(undefined);
			vi.spyOn(semanticReleaseService as any, "setupScripts").mockResolvedValueOnce(undefined);
			vi.spyOn(semanticReleaseService as any, "displaySetupSummary").mockImplementationOnce(() => {});

			const result = await (semanticReleaseService as any).setupSemanticRelease();

			expect(result).toEqual({
				repositoryUrl: "https://github.com/test/repo",
				mainBranch: "main",
				isPrereleaseEnabled: true,
				preReleaseBranch: "dev",
				preReleaseChannel: "beta",
				isBackmergeEnabled: true,
				developBranch: "develop",
			});

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalledWith("Setting up Semantic Release configuration...");
			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			expect(semanticReleaseService["createConfigs"]).toHaveBeenCalledWith("https://github.com/test/repo", "main", "dev", "beta", true, "develop");
			expect(semanticReleaseService["setupScripts"]).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Semantic Release configuration completed successfully!");
			expect(semanticReleaseService["displaySetupSummary"]).toHaveBeenCalledWith("main", "dev", "beta", true, "develop");
		});

		it("should skip pre-release configuration when not enabled", async () => {
			// Mock methods with pre-release disabled
			vi.spyOn(semanticReleaseService as any, "getRepositoryUrl").mockResolvedValueOnce("https://github.com/test/repo");
			vi.spyOn(semanticReleaseService as any, "getMainBranch").mockResolvedValueOnce("main");
			vi.spyOn(semanticReleaseService as any, "isPrereleaseEnabledChannel").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "isBackmergeEnabled").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "createConfigs").mockResolvedValueOnce(undefined);
			vi.spyOn(semanticReleaseService as any, "setupScripts").mockResolvedValueOnce(undefined);
			vi.spyOn(semanticReleaseService as any, "displaySetupSummary").mockImplementationOnce(() => {});
			// Make sure getPreReleaseBranch is NOT called
			const getPreReleaseBranchSpy = vi.spyOn(semanticReleaseService as any, "getPreReleaseBranch");
			const getPreReleaseChannelSpy = vi.spyOn(semanticReleaseService as any, "getPreReleaseChannel");

			const result = await (semanticReleaseService as any).setupSemanticRelease();

			expect(result).toEqual({
				repositoryUrl: "https://github.com/test/repo",
				mainBranch: "main",
				isPrereleaseEnabled: false,
				isBackmergeEnabled: false,
			});

			expect(getPreReleaseBranchSpy).not.toHaveBeenCalled();
			expect(getPreReleaseChannelSpy).not.toHaveBeenCalled();
			expect(semanticReleaseService["createConfigs"]).toHaveBeenCalledWith("https://github.com/test/repo", "main", undefined, undefined, false, undefined);
		});

		it("should handle errors during config creation", async () => {
			// Mock createConfigs to throw error
			vi.spyOn(semanticReleaseService as any, "getRepositoryUrl").mockResolvedValueOnce("https://github.com/test/repo");
			vi.spyOn(semanticReleaseService as any, "getMainBranch").mockResolvedValueOnce("main");
			vi.spyOn(semanticReleaseService as any, "isPrereleaseEnabledChannel").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "isBackmergeEnabled").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "createConfigs").mockRejectedValueOnce(new Error("Config error"));

			await expect((semanticReleaseService as any).setupSemanticRelease()).rejects.toThrow("Config error");
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup Semantic Release configuration");
		});

		it("should handle errors during package installation", async () => {
			// Mock all required methods
			vi.spyOn(semanticReleaseService as any, "getRepositoryUrl").mockResolvedValueOnce("https://github.com/test/repo");
			vi.spyOn(semanticReleaseService as any, "getMainBranch").mockResolvedValueOnce("main");
			vi.spyOn(semanticReleaseService as any, "isPrereleaseEnabledChannel").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "isBackmergeEnabled").mockResolvedValueOnce(false);

			// Mock package installation to fail
			mockPackageJsonService.installPackages.mockRejectedValueOnce(new Error("Installation failed"));

			await expect((semanticReleaseService as any).setupSemanticRelease()).rejects.toThrow("Installation failed");

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup Semantic Release configuration");
		});

		it("should handle errors during script setup", async () => {
			// Mock all required methods
			vi.spyOn(semanticReleaseService as any, "getRepositoryUrl").mockResolvedValueOnce("https://github.com/test/repo");
			vi.spyOn(semanticReleaseService as any, "getMainBranch").mockResolvedValueOnce("main");
			vi.spyOn(semanticReleaseService as any, "isPrereleaseEnabledChannel").mockResolvedValueOnce(false);
			vi.spyOn(semanticReleaseService as any, "isBackmergeEnabled").mockResolvedValueOnce(false);

			// Mock package installation to succeed but script setup to fail
			mockPackageJsonService.installPackages.mockResolvedValueOnce(undefined);
			vi.spyOn(semanticReleaseService as any, "setupScripts").mockRejectedValueOnce(new Error("Script setup failed"));

			await expect((semanticReleaseService as any).setupSemanticRelease()).rejects.toThrow("Script setup failed");

			expect(mockCliInterfaceService.startSpinner).toHaveBeenCalled();
			expect(mockCliInterfaceService.stopSpinner).toHaveBeenCalledWith("Failed to setup Semantic Release configuration");
		});
	});

	describe("install", () => {
		it("should complete successful installation", async () => {
			// Setup spies
			vi.spyOn(semanticReleaseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService as any, "setupSemanticRelease").mockResolvedValueOnce({
				repositoryUrl: "https://github.com/test/repo",
				mainBranch: "main",
			});

			// Call the method
			const result = await semanticReleaseService.install();

			// Check results
			expect(result).toEqual({
				customProperties: {
					repositoryUrl: "https://github.com/test/repo",
					mainBranch: "main",
				},
				wasInstalled: true,
			});
			expect(mockConfigService.getModuleConfig).toHaveBeenCalledWith(EModule.SEMANTIC_RELEASE);
			expect(semanticReleaseService.shouldInstall).toHaveBeenCalled();
			expect(semanticReleaseService.handleExistingSetup).toHaveBeenCalled();
			expect(semanticReleaseService["setupSemanticRelease"]).toHaveBeenCalled();
		});

		it("should not install when user declines installation", async () => {
			// Setup spies
			vi.spyOn(semanticReleaseService, "shouldInstall").mockResolvedValueOnce(false);
			const setupSemanticReleaseSpy = vi.spyOn(semanticReleaseService as any, "setupSemanticRelease");

			// Call the method
			const result = await semanticReleaseService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSemanticReleaseSpy).not.toHaveBeenCalled();
		});

		it("should not install when existing setup cannot be handled", async () => {
			// Setup spies
			vi.spyOn(semanticReleaseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService, "handleExistingSetup").mockResolvedValueOnce(false);
			const setupSemanticReleaseSpy = vi.spyOn(semanticReleaseService as any, "setupSemanticRelease");

			// Call the method
			const result = await semanticReleaseService.install();

			// Check results
			expect(result).toEqual({
				wasInstalled: false,
			});
			expect(setupSemanticReleaseSpy).not.toHaveBeenCalled();
		});

		it("should handle errors during installation", async () => {
			// Setup spies
			vi.spyOn(semanticReleaseService, "shouldInstall").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService, "handleExistingSetup").mockResolvedValueOnce(true);
			vi.spyOn(semanticReleaseService as any, "setupSemanticRelease").mockRejectedValueOnce(new Error("Setup error"));

			// Call and expect rejection
			await expect(semanticReleaseService.install()).rejects.toThrow("Setup error");
			expect(mockCliInterfaceService.handleError).toHaveBeenCalledWith("Failed to complete Semantic Release setup", expect.any(Error));
		});
	});
});
