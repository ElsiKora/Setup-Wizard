import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRLINT_CONFIG_CORE_DEPENDENCIES } from "../../../../src/application/constant/prlint/core-dependencies.constant";
import { PRLINT_CONFIG_FILE_PATHS } from "../../../../src/application/constant/prlint/file-paths.constant";
import { PRLINT_CONFIG_MESSAGES } from "../../../../src/application/constant/prlint/messages.constant";
import { PRLINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES } from "../../../../src/application/constant/prlint/package-json-script-names.constant";
import { PRLINT_CONFIG_SCRIPTS } from "../../../../src/application/constant/prlint/scripts.constant";
import { PrlintModuleService } from "../../../../src/application/service/prlint-module.service";
import { EModule } from "../../../../src/domain/enum/module.enum";
import { EPackageJsonDependencyType } from "../../../../src/domain/enum/package-json-dependency-type.enum";
import { EPrlintGenerationProvider } from "../../../../src/domain/enum/prlint-generation-provider.enum";
import { EPrlintTicketMissingBranchLintBehavior } from "../../../../src/domain/enum/prlint-ticket-missing-branch-lint-behavior.enum";
import { EPrlintTicketNormalization } from "../../../../src/domain/enum/prlint-ticket-normalization.enum";
import { EPrlintTicketSource } from "../../../../src/domain/enum/prlint-ticket-source.enum";

describe("PrlintModuleService", () => {
	const mockCliInterfaceService = {
		confirm: vi.fn(),
		handleError: vi.fn(),
		note: vi.fn(),
		select: vi.fn(),
		startSpinner: vi.fn(),
		stopSpinner: vi.fn(),
		text: vi.fn(),
		warn: vi.fn(),
	};

	const mockFileSystemService = {
		deleteFile: vi.fn(),
		isPathExists: vi.fn(),
		readFile: vi.fn(),
		writeFile: vi.fn(),
	};

	const mockConfigService = {
		getModuleConfig: vi.fn(),
		isModuleEnabled: vi.fn(),
	};

	const mockPackageJsonService = {
		addScript: vi.fn(),
		get: vi.fn(),
		installPackages: vi.fn(),
		set: vi.fn(),
	};

	let prlintService: PrlintModuleService;

	beforeEach(() => {
		vi.clearAllMocks();

		mockCliInterfaceService.confirm.mockResolvedValue(true);
		mockConfigService.getModuleConfig.mockResolvedValue(null);
		mockConfigService.isModuleEnabled.mockResolvedValue(true);
		mockFileSystemService.isPathExists.mockResolvedValue(false);
		mockPackageJsonService.get.mockResolvedValue({ scripts: {} });

		prlintService = new PrlintModuleService(mockCliInterfaceService as any, mockFileSystemService as any, mockConfigService as any);
		vi.spyOn(prlintService as any, "PACKAGE_JSON_SERVICE", "get").mockReturnValue(mockPackageJsonService);
	});

	describe("shouldInstall", () => {
		it("returns true when user confirms setup", async () => {
			mockCliInterfaceService.confirm.mockResolvedValueOnce(true);
			mockConfigService.isModuleEnabled.mockResolvedValueOnce(true);

			const result = await prlintService.shouldInstall();

			expect(result).toBe(true);
			expect(mockCliInterfaceService.confirm).toHaveBeenCalledWith(PRLINT_CONFIG_MESSAGES.confirmSetup, true);
		});

		it("returns false and logs error on prompt failure", async () => {
			mockCliInterfaceService.confirm.mockRejectedValueOnce(new Error("Test error"));

			const result = await prlintService.shouldInstall();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.handleError).toHaveBeenCalled();
		});
	});

	describe("handleExistingSetup", () => {
		it("returns true when nothing exists", async () => {
			vi.spyOn(prlintService as any, "findExistingConfigFiles").mockResolvedValue([]);
			mockPackageJsonService.get.mockResolvedValueOnce({ scripts: {} });

			const result = await prlintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockFileSystemService.deleteFile).not.toHaveBeenCalled();
		});

		it("deletes files and scripts when user confirms", async () => {
			vi.spyOn(prlintService as any, "findExistingConfigFiles").mockResolvedValue([PRLINT_CONFIG_FILE_PATHS.configFile]);
			mockPackageJsonService.get.mockResolvedValueOnce({
				scripts: {
					"prlint:context": "prlint context",
					prlint: "prlint lint",
				},
			});

			const result = await prlintService.handleExistingSetup();

			expect(result).toBe(true);
			expect(mockFileSystemService.deleteFile).toHaveBeenCalledWith(PRLINT_CONFIG_FILE_PATHS.configFile);
			expect(mockPackageJsonService.set).toHaveBeenCalled();
		});

		it("returns false when user declines cleanup", async () => {
			vi.spyOn(prlintService as any, "findExistingConfigFiles").mockResolvedValue([PRLINT_CONFIG_FILE_PATHS.configFile]);
			mockCliInterfaceService.confirm.mockResolvedValueOnce(false);

			const result = await prlintService.handleExistingSetup();

			expect(result).toBe(false);
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith(PRLINT_CONFIG_MESSAGES.existingFilesAborted);
		});
	});

	describe("install", () => {
		it("returns customProperties and wasInstalled on success", async () => {
			const resolvedConfig = {
				generation: {
					model: "claude-opus-4-5",
					provider: EPrlintGenerationProvider.ANTHROPIC,
					retries: 3,
					validationRetries: 3,
				},
				github: {
					base: "dev",
					isDraft: false,
					prohibitedBranches: ["main", "master"],
				},
				lint: {
					forbiddenPlaceholders: ["WIP"],
					requiredSections: ["Summary"],
					titlePattern: "^.+$",
				},
				ticket: {
					missingBranchLintBehavior: EPrlintTicketMissingBranchLintBehavior.ERROR,
					normalization: EPrlintTicketNormalization.UPPER,
					pattern: "[a-z]{2,}-[0-9]+",
					patternFlags: "i",
					source: EPrlintTicketSource.BRANCH_LINT,
				},
			};

			vi.spyOn(prlintService, "shouldInstall").mockResolvedValue(true);
			vi.spyOn(prlintService, "handleExistingSetup").mockResolvedValue(true);
			vi.spyOn(prlintService, "shouldEnableScripts").mockResolvedValue(true);
			vi.spyOn(prlintService, "resolvePrlintConfig").mockResolvedValue(resolvedConfig);
			vi.spyOn(prlintService as any, "setupPrlint").mockResolvedValue(undefined);

			const result = await prlintService.install();

			expect(result).toEqual({
				customProperties: {
					...resolvedConfig,
					isScriptsEnabled: true,
				},
				wasInstalled: true,
			});
		});

		it("returns not installed when shouldInstall returns false", async () => {
			vi.spyOn(prlintService, "shouldInstall").mockResolvedValue(false);

			const result = await prlintService.install();

			expect(result).toEqual({ wasInstalled: false });
		});
	});

	describe("private behavior", () => {
		it("setupPrlint installs dependency, writes config and scripts", async () => {
			vi.spyOn(prlintService as any, "createConfigs").mockResolvedValue(undefined);
			vi.spyOn(prlintService as any, "setupScripts").mockResolvedValue(undefined);
			vi.spyOn(prlintService as any, "displaySetupSummary").mockReturnValue(undefined);

			await (prlintService as any).setupPrlint(
				{
					generation: { model: "claude-opus-4-5", provider: EPrlintGenerationProvider.ANTHROPIC, retries: 3, validationRetries: 3 },
					github: { base: "dev", isDraft: false, prohibitedBranches: ["main"] },
					lint: { forbiddenPlaceholders: ["WIP"], requiredSections: ["Summary"], titlePattern: "^.+$" },
					ticket: {
						missingBranchLintBehavior: EPrlintTicketMissingBranchLintBehavior.ERROR,
						normalization: EPrlintTicketNormalization.UPPER,
						pattern: "[a-z]{2,}-[0-9]+",
						patternFlags: "i",
						source: EPrlintTicketSource.BRANCH_LINT,
					},
				},
				true,
			);

			expect(mockPackageJsonService.installPackages).toHaveBeenCalledWith(PRLINT_CONFIG_CORE_DEPENDENCIES, "latest", EPackageJsonDependencyType.DEV);
			expect(prlintService["createConfigs"]).toHaveBeenCalled();
			expect(prlintService["setupScripts"]).toHaveBeenCalled();
		});

		it("setupScripts registers all PRLint scripts", async () => {
			await (prlintService as any).setupScripts();

			expect(mockPackageJsonService.addScript).toHaveBeenCalledTimes(PRLINT_CONFIG_PACKAGE_JSON_SCRIPT_NAMES.length);
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(PRLINT_CONFIG_SCRIPTS.lint.name, PRLINT_CONFIG_SCRIPTS.lint.command);
			expect(mockPackageJsonService.addScript).toHaveBeenCalledWith(PRLINT_CONFIG_SCRIPTS.generate.name, PRLINT_CONFIG_SCRIPTS.generate.command);
		});

		it("creates config file using configured template", async () => {
			await (prlintService as any).createConfigs({
				generation: { model: "claude-opus-4-5", provider: EPrlintGenerationProvider.ANTHROPIC, retries: 3, validationRetries: 3 },
			});

			expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(PRLINT_CONFIG_FILE_PATHS.configFile, expect.any(String), "utf8");
		});
	});
});
