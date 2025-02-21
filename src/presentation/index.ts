import { Command } from "commander";

import { CommandFactory } from "../infrastructure/factory/command.factory";
import { ClackCliInterface } from "../infrastructure/service/clack-cli-interface.service";
import { NodeFileSystemService } from "../infrastructure/service/node-file-system.service";

import { AnalyzeCommandRegistrar } from "./registrar/analyze.registrar";
import { InitCommandRegistrar } from "./registrar/init.registrar";

const program: Command = new Command();

program.name("@elsikora/setup-wizard").description("Project scaffolder by ElsiKora").version("1.0.0");

const CliInterfaceService: ClackCliInterface = new ClackCliInterface();
const FileSystemService: NodeFileSystemService = new NodeFileSystemService();

new InitCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();
new AnalyzeCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();

program.parse(process.argv);
