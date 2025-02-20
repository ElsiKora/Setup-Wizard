import { Command } from "commander";
import { InitCommandRegistrar } from "./registrar/init.registrar";
import { CommandFactory } from "../infrastructure/factory/command.factory";
import { ClackCliInterface } from "../infrastructure/service/clack-cli-interface.service";
import { AnalyzeCommandRegistrar } from "./registrar/analyze.registrar";
import { NodeFileSystemService } from "../infrastructure/service/node-file-system.service";

const program: Command = new Command();

program.name("@elsikora/setup-wizard").description("Project scaffolder by ElsiKora").version("1.0.0");

const CliInterfaceService = new ClackCliInterface();
const FileSystemService = new NodeFileSystemService();

new InitCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();
new AnalyzeCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();

program.parse(process.argv);
