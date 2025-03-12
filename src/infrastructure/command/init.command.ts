import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfigService } from "../../application/interface/config-service.interface";
import type { IConfig } from "../../application/interface/config.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IModuleSetupResult } from "../../application/interface/module-setup-result.interface";
import type { ICommand } from "../interface/command.interface";
import type { IModuleService } from "../interface/module-service.interface";
import type { TInitCommandProperties } from "../type/init-command-properties.type";

import { ConfigMapper } from "../../application/mapper/config.mapper";
import { EModule } from "../../domain/enum/module.enum";
import { ModuleServiceMapper } from "../mapper/module-service.mapper";
import { CosmicConfigService } from "../service/cosmi-config-config.service";

/**
 * Command responsible for initializing and installing selected modules.
 * Implements the ICommand interface to provide standard command execution.
 */
export class InitCommand implements ICommand {
	/** CLI interface service for user interaction */
	readonly CLI_INTERFACE_SERVICE: ICliInterfaceService;

	/** Configuration service for reading and writing config */
	readonly CONFIG_SERVICE: IConfigService;

	/** File system service for file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Properties defining which modules to install */
	readonly PROPERTIES: TInitCommandProperties;

	/**
	 * Initializes a new instance of the InitCommand.
	 * @param properties - Properties defining which modules to install
	 * @param cliInterfaceService - Service for CLI user interactions
	 * @param fileSystemService - Service for file system operations
	 */
	constructor(properties: TInitCommandProperties, cliInterfaceService: ICliInterfaceService, fileSystemService: IFileSystemService) {
		this.PROPERTIES = properties;
		this.CLI_INTERFACE_SERVICE = cliInterfaceService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.CONFIG_SERVICE = new CosmicConfigService(fileSystemService);
	}

	/**
	 * Executes the initialization command.
	 * Reads existing configuration if available, determines which modules to install,
	 * installs selected modules, and updates the configuration.
	 * @returns Promise that resolves when execution is complete
	 */
	async execute(): Promise<void> {
		let properties: TInitCommandProperties = this.PROPERTIES;

		// eslint-disable-next-line @elsikora/typescript/naming-convention
		if (Object.values(properties).every((value: boolean) => !value) && (await this.CONFIG_SERVICE.exists())) {
			const config: IConfig = await this.CONFIG_SERVICE.get();
			properties = ConfigMapper.fromConfigToInitCommandProperties(config);

			// eslint-disable-next-line @elsikora/typescript/naming-convention
			if (Object.values(properties).every((value: boolean) => !value)) {
				this.CLI_INTERFACE_SERVICE.info(`Configuration was found but no modules were enabled.\n\nPlease edit the configuration file to enable modules or:\n- pass the --all flag to enable all modules\n- pass command flags to enable specific modules`);

				return;
			}
		}

		const moduleServiceMapper: ModuleServiceMapper = new ModuleServiceMapper(this.CLI_INTERFACE_SERVICE, this.FILE_SYSTEM_SERVICE);

		this.CLI_INTERFACE_SERVICE.clear();
		// eslint-disable-next-line @elsikora/typescript/naming-convention
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
