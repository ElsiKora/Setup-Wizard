import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfigService } from "../../application/interface/config-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleService } from "../interface/module-service.interface";

import { BranchLintModuleService } from "../../application/service/branch-lint-module.service";
import { BuilderModuleService } from "../../application/service/builder-module.service";
import { CiModuleService } from "../../application/service/ci-module.service";
import { CommitlintModuleService } from "../../application/service/commitlint-module.service";
import { EslintModuleService } from "../../application/service/eslint-module.service";
import { GitignoreModuleService } from "../../application/service/gitignore-module.service";
import { IdeModuleService } from "../../application/service/ide-module.service";
import { LicenseModuleService } from "../../application/service/license-module.service";
import { LintStagedModuleService } from "../../application/service/lint-staged-module.service";
import { PrettierModuleService } from "../../application/service/prettier-module.service";
import { SemanticReleaseModuleService } from "../../application/service/semantic-release-module.service";
import { StylelintModuleService } from "../../application/service/stylelint-module.service";
import { TypescriptModuleService } from "../../application/service/typescript-module.service";
import { EModule } from "../../domain/enum/module.enum";
import { CosmicConfigService } from "../service/cosmi-config-config.service";

/**
 * Mapper class for creating module service instances based on module type.
 * Provides a central factory for all available module services in the application.
 */
export class ModuleServiceMapper {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Configuration service for reading and writing config */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Initializes a new instance of the ModuleServiceMapper.
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new CosmicConfigService(fileSystemService);
	}

	/**
	 * Gets a module service instance based on the specified module type.
	 * Factory method that creates the appropriate service implementation.
	 * @param module - The module type enum value
	 * @returns An implementation of IModuleService for the specified module
	 * @throws Error if the module type is not supported
	 */
	getModuleService(module: EModule): IModuleService {
		// eslint-disable-next-line @elsikora/unicorn/prefer-module
		switch (module) {
			case EModule.BRANCH_LINT: {
				return new BranchLintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.BUILDER: {
				return new BuilderModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.CI: {
				return new CiModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.COMMITLINT: {
				return new CommitlintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.ESLINT: {
				return new EslintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.GITIGNORE: {
				return new GitignoreModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.IDE: {
				return new IdeModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.LICENSE: {
				return new LicenseModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.LINT_STAGED: {
				return new LintStagedModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.PRETTIER: {
				return new PrettierModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.SEMANTIC_RELEASE: {
				return new SemanticReleaseModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.STYLELINT: {
				return new StylelintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			case EModule.TYPESCRIPT: {
				return new TypescriptModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE, this.CONFIG_SERVICE);
			}

			default: {
				throw new Error(`Module ${module as string} is not supported`);
			}
		}
	}
}
