import { EModule } from "../../domain/enum/module.enum";
import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { LicenseModuleService } from "../../application/service/license-module.service";
import { GitignoreModuleService } from "../../application/service/gitignore-module.service";
import { CiModuleService } from "../../application/service/ci-module.service";
import { IdeModuleService } from "../../application/service/ide-module.service";
import { EslintModuleService } from "../../application/service/eslint-module.service";
import { IFileSystemService } from "../../application/interface/file-system-service.interface";
import { IModuleService } from "../interface/module-service.interface";
import { PrettierModuleService } from "../../application/service/prettier-module.service";
import { StylelintModuleService } from "../../application/service/stylelint-module.service";
import { CommitlintModuleService } from "../../application/service/commitlint-module.service";
import { SemanticReleaseModuleService } from "../../application/service/semantic-release-module.service";

export class ModuleServiceMapper {
	readonly cliInterfaceService: ICliInterfaceService;
	readonly fileSystemService: IFileSystemService;

	constructor(cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.cliInterfaceService = cliInterfaceService;
		this.fileSystemService = fileSystemService;
	}

	getModuleService(module: EModule): IModuleService {
		switch (module) {
			case EModule.LICENSE:
				return new LicenseModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.GITIGNORE:
				return new GitignoreModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.CI:
				return new CiModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.IDE:
				return new IdeModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.ESLINT:
				return new EslintModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.PRETTIER:
				return new PrettierModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.STYLELINT:
				return new StylelintModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.COMMITLINT:
				return new CommitlintModuleService(this.cliInterfaceService, this.fileSystemService);
			case EModule.SEMANTIC_RELEASE:
				return new SemanticReleaseModuleService(this.cliInterfaceService, this.fileSystemService);
			default:
				throw new Error(`Module ${module} is not supported`);
		}
	}
}
