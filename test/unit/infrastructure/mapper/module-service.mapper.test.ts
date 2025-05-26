import { beforeEach, describe, expect, it, vi } from "vitest";
import { EModule } from "../../../../src/domain/enum/module.enum";
import type { ICliInterfaceService } from "../../../../src/application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../../../src/application/interface/file-system-service.interface";
import type { IConfigService } from "../../../../src/application/interface/config-service.interface";

// Mock the dependencies before importing the ModuleServiceMapper
vi.mock("../../../../src/infrastructure/service/cosmi-config-config.service", () => ({
	CosmicConfigService: vi.fn(),
}));

vi.mock("../../../../src/application/service/ci-module.service", () => ({
	CiModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/commitlint-module.service", () => ({
	CommitlintModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/eslint-module.service", () => ({
	EslintModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/gitignore-module.service", () => ({
	GitignoreModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/ide-module.service", () => ({
	IdeModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/license-module.service", () => ({
	LicenseModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/lint-staged-module.service", () => ({
	LintStagedModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/prettier-module.service", () => ({
	PrettierModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/semantic-release-module.service", () => ({
	SemanticReleaseModuleService: vi.fn(),
}));

vi.mock("../../../../src/application/service/stylelint-module.service", () => ({
	StylelintModuleService: vi.fn(),
}));

// Now import the class after all mocks are set up
import { ModuleServiceMapper } from "../../../../src/infrastructure/mapper/module-service.mapper";
import { CosmicConfigService } from "../../../../src/infrastructure/service/cosmi-config-config.service";
import { CiModuleService } from "../../../../src/application/service/ci-module.service";
import { CommitlintModuleService } from "../../../../src/application/service/commitlint-module.service";
import { EslintModuleService } from "../../../../src/application/service/eslint-module.service";
import { GitignoreModuleService } from "../../../../src/application/service/gitignore-module.service";
import { IdeModuleService } from "../../../../src/application/service/ide-module.service";
import { LicenseModuleService } from "../../../../src/application/service/license-module.service";
import { LintStagedModuleService } from "../../../../src/application/service/lint-staged-module.service";
import { PrettierModuleService } from "../../../../src/application/service/prettier-module.service";
import { SemanticReleaseModuleService } from "../../../../src/application/service/semantic-release-module.service";
import { StylelintModuleService } from "../../../../src/application/service/stylelint-module.service";

describe("ModuleServiceMapper", () => {
	let moduleServiceMapper: ModuleServiceMapper;
	let mockCliInterfaceService: ICliInterfaceService;
	let mockFileSystemService: IFileSystemService;
	let mockConfigService: IConfigService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Setup mocks
		mockCliInterfaceService = {} as ICliInterfaceService;
		mockFileSystemService = {} as IFileSystemService;
		mockConfigService = {} as IConfigService;

		(CosmicConfigService as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockConfigService);

		// Create mapper instance
		moduleServiceMapper = new ModuleServiceMapper(mockCliInterfaceService, mockFileSystemService);
	});

	describe("constructor", () => {
		it("should initialize properties correctly", () => {
			expect(moduleServiceMapper.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
			expect(moduleServiceMapper.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
			expect(CosmicConfigService).toHaveBeenCalledWith(mockFileSystemService);
		});
	});

	describe("getModuleService", () => {
		it("should return CiModuleService for CI module", () => {
			moduleServiceMapper.getModuleService(EModule.CI);
			expect(CiModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return CommitlintModuleService for COMMITLINT module", () => {
			moduleServiceMapper.getModuleService(EModule.COMMITLINT);
			expect(CommitlintModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return EslintModuleService for ESLINT module", () => {
			moduleServiceMapper.getModuleService(EModule.ESLINT);
			expect(EslintModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return GitignoreModuleService for GITIGNORE module", () => {
			moduleServiceMapper.getModuleService(EModule.GITIGNORE);
			expect(GitignoreModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return IdeModuleService for IDE module", () => {
			moduleServiceMapper.getModuleService(EModule.IDE);
			expect(IdeModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return LicenseModuleService for LICENSE module", () => {
			moduleServiceMapper.getModuleService(EModule.LICENSE);
			expect(LicenseModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return LintStagedModuleService for LINT_STAGED module", () => {
			moduleServiceMapper.getModuleService(EModule.LINT_STAGED);
			expect(LintStagedModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return PrettierModuleService for PRETTIER module", () => {
			moduleServiceMapper.getModuleService(EModule.PRETTIER);
			expect(PrettierModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return SemanticReleaseModuleService for SEMANTIC_RELEASE module", () => {
			moduleServiceMapper.getModuleService(EModule.SEMANTIC_RELEASE);
			expect(SemanticReleaseModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should return StylelintModuleService for STYLELINT module", () => {
			moduleServiceMapper.getModuleService(EModule.STYLELINT);
			expect(StylelintModuleService).toHaveBeenCalledWith(mockCliInterfaceService, mockFileSystemService, expect.anything());
		});

		it("should throw an error for unsupported module", () => {
			const unsupportedModule = "UNSUPPORTED" as EModule;
			expect(() => moduleServiceMapper.getModuleService(unsupportedModule)).toThrow(`Module ${unsupportedModule} is not supported`);
		});
	});
});
