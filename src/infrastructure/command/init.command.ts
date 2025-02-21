import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfig } from "../../application/interface/config.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";
import type { ICommand } from "../interface/command.interface";
import type { IModuleService } from "../interface/module-service.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

import { ConfigMapper } from "../../application/mapper/config.mapper";
import { ConfigService } from "../../application/service/config.service";
import { EModule } from "../../domain/enum/module.enum";
import { ModuleServiceMapper } from "../mapper/module-service.mapper";

export class InitCommand implements ICommand {
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	readonly CONFIG_SERVICE: ConfigService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PROPERTIES: TInitCommandProperties;

	constructor(properties: TInitCommandProperties, cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.PROPERTIES = properties;
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new ConfigService(fileSystemService);
	}

	async execute(): Promise<void> {
		let properties: TInitCommandProperties = this.PROPERTIES;

		// eslint-disable-next-line @elsikora-typescript/naming-convention
		if (Object.values(properties).every((value: boolean) => !value) && (await this.CONFIG_SERVICE.exists())) {
			const config: IConfig = await this.CONFIG_SERVICE.get();
			properties = ConfigMapper.fromConfigToInitCommandProperties(config);

			// eslint-disable-next-line @elsikora-typescript/naming-convention
			if (Object.values(properties).every((value: boolean) => !value)) {
				this.CLI_INTERFACE_SERVICE.info(`Configuration was found but no modules were enabled.\n\nPlease edit the configuration file to enable modules or:\n- pass the --all flag to enable all modules\n- pass command flags to enable specific modules`);

				return;
			}
		}

		const moduleServiceMapper: ModuleServiceMapper = new ModuleServiceMapper(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);

		this.CLI_INTERFACE_SERVICE.clear();
		// eslint-disable-next-line @elsikora-typescript/naming-convention
		const shouldInstallAll: boolean = Object.values(properties).every((value: boolean) => !value);
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
			const moduleService: IModuleService = moduleServiceMapper.getModuleService(module);
			setupResults[module] = await moduleService.install();
		}

		await this.CONFIG_SERVICE.merge(ConfigMapper.fromSetupResultsToConfig(setupResults));
	}
}
