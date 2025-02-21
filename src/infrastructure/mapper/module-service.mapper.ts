import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleService } from "../interface/module-service.interface";

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
import { EModule } from "../../domain/enum/module.enum";

export class ModuleServiceMapper {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	getModuleService(module: EModule): IModuleService {
		// eslint-disable-next-line @elsikora-unicorn/prefer-module
		switch (module) {
			case EModule.CI: {
				return new CiModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.COMMITLINT: {
				return new CommitlintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.ESLINT: {
				return new EslintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.GITIGNORE: {
				return new GitignoreModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.IDE: {
				return new IdeModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.LICENSE: {
				return new LicenseModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.LINT_STAGED: {
				return new LintStagedModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.PRETTIER: {
				return new PrettierModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.SEMANTIC_RELEASE: {
				return new SemanticReleaseModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			case EModule.STYLELINT: {
				return new StylelintModuleService(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);
			}

			default: {
				throw new Error(`Module ${module as string} is not supported`);
			}
		}
	}
}
