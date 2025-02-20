import { ICommand } from "../interface/command.interface";
import { IInitCommandProperties } from "../interface/init-command-properties.interface";
import { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import { EModule } from "../../domain/enum/module.enum";
import { ModuleServiceMapper } from "../mapper/module-service.mapper";
import { IFileSystemService } from "../../application/interface/file-system-service.interface";
import { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";
import { ConfigService } from "../../application/service/config.service";
import { ConfigMapper } from "../../application/mapper/config.mapper";

export class InitCommand implements ICommand {
	readonly properties: IInitCommandProperties;
	readonly cliInterfaceService: ICliInterfaceService;
	readonly fileSystemService: IFileSystemService;
	readonly configService: ConfigService;

	constructor(properties: IInitCommandProperties, cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.properties = properties;
		this.cliInterfaceService = cliInterfaceService;
		this.fileSystemService = fileSystemService;
		this.configService = new ConfigService(fileSystemService);
	}

	async execute(): Promise<void> {
		let properties = this.properties;
		console.log("PROPERTIES", properties);
		if (Object.values(properties).every((value) => value === false)) {
			if (await this.configService.exists()) {
				const config = await this.configService.get();
				properties = ConfigMapper.fromConfigToInitCommandProperties(config);

				if (Object.values(properties).every((value) => value === false)) {
					this.cliInterfaceService.info(`Configuration was found but no modules were enabled.\n\nPlease edit the configuration file to enable modules or:\n- pass the --all flag to enable all modules\n- pass command flags to enable specific modules`);
					return;
				}
			}
		}

		const moduleServiceMapper: ModuleServiceMapper = new ModuleServiceMapper(this.cliInterfaceService, this.fileSystemService);

		this.cliInterfaceService.clear();
		const shouldInstallAll: boolean = Object.values(properties).every((value) => value === false);
		const modulesToInstall: Array<EModule> = [];
		const setupResults: Partial<Record<EModule, IModuleSetupResult>> = {};
		if (shouldInstallAll) {
			modulesToInstall.push(...Object.values(EModule));
		} else {
			for (const [module, shouldInstall] of Object.entries(properties)) {
				if (shouldInstall) {
					modulesToInstall.push(module as EModule);
				}
			}
		}

		for (const module of modulesToInstall) {
			const moduleService = moduleServiceMapper.getModuleService(module);
			const result: IModuleSetupResult = await moduleService.install();
			setupResults[module] = result;
		}

		await this.configService.merge(ConfigMapper.fromSetupResultsToConfig(setupResults));
	}
}
