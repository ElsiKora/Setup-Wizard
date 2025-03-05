import { Command } from "commander";

import { CommandFactory } from "./infrastructure/factory/command.factory";
import { NodeFileSystemService } from "./infrastructure/service/node-file-system.service";
import { PromptsCliInterface } from "./infrastructure/service/prompts-cli-interface.service";
import { AnalyzeCommandRegistrar } from "./presentation/registrar/analyze.registrar";
import { InitCommandRegistrar } from "./presentation/registrar/init.registrar";

const program: Command = new Command();

program.name("@elsikora/setup-wizard").description("Project scaffolder by ElsiKora").version("1.0.0");

const CliInterfaceService: PromptsCliInterface = new PromptsCliInterface();
const FileSystemService: NodeFileSystemService = new NodeFileSystemService();

new InitCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();
new AnalyzeCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();

program.parse(process.argv);
