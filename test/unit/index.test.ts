import { Command } from "commander";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { CommandFactory } from "../../src/infrastructure/factory/command.factory";
import { NodeFileSystemService } from "../../src/infrastructure/service/node-file-system.service";
import { PromptsCliInterface } from "../../src/infrastructure/service/prompts-cli-interface.service";
import { InitCommandRegistrar } from "../../src/presentation/registrar/init.registrar";
import { AnalyzeCommandRegistrar } from "../../src/presentation/registrar/analyze.registrar";

// Mock all dependencies
vi.mock("commander", () => {
	return {
		Command: vi.fn().mockImplementation(() => ({
			name: vi.fn().mockReturnThis(),
			description: vi.fn().mockReturnThis(),
			version: vi.fn().mockReturnThis(),
			parse: vi.fn(),
		})),
	};
});

vi.mock("../../src/infrastructure/service/prompts-cli-interface.service");
vi.mock("../../src/infrastructure/service/node-file-system.service");
vi.mock("../../src/infrastructure/factory/command.factory");
vi.mock("../../src/presentation/registrar/init.registrar", () => ({
	InitCommandRegistrar: vi.fn().mockImplementation(() => ({
		execute: vi.fn(),
	})),
}));
vi.mock("../../src/presentation/registrar/analyze.registrar", () => ({
	AnalyzeCommandRegistrar: vi.fn().mockImplementation(() => ({
		execute: vi.fn(),
	})),
}));

describe("Index entry point", () => {
	let originalProcessArgv: string[];

	beforeEach(() => {
		originalProcessArgv = process.argv;
		process.argv = ["node", "index.js"];
		vi.clearAllMocks();
	});

	afterEach(() => {
		process.argv = originalProcessArgv;
	});

	it("should initialize the program with correct configuration", async () => {
		// Execute the index module
		await import("../../src/index");

		// Check Command was initialized properly
		expect(Command).toHaveBeenCalledTimes(1);

		// Get the Command instance
		const commandInstance = (Command as unknown as jest.Mock).mock.results[0].value;

		// Check program was set up correctly
		expect(commandInstance.name).toHaveBeenCalledWith("@elsikora/setup-wizard");
		expect(commandInstance.description).toHaveBeenCalledWith("Project scaffolder by ElsiKora");
		expect(commandInstance.version).toHaveBeenCalledWith("1.0.0");

		// Check services initialization
		expect(PromptsCliInterface).toHaveBeenCalledTimes(1);
		expect(NodeFileSystemService).toHaveBeenCalledTimes(1);

		// Check command factory and registrars
		expect(CommandFactory).toHaveBeenCalledTimes(2);
		expect(InitCommandRegistrar).toHaveBeenCalledTimes(1);
		expect(AnalyzeCommandRegistrar).toHaveBeenCalledTimes(1);

		// Check execute was called on registrars
		const initRegistrarInstance = (InitCommandRegistrar as unknown as jest.Mock).mock.results[0].value;
		const analyzeRegistrarInstance = (AnalyzeCommandRegistrar as unknown as jest.Mock).mock.results[0].value;

		expect(initRegistrarInstance.execute).toHaveBeenCalledTimes(1);
		expect(analyzeRegistrarInstance.execute).toHaveBeenCalledTimes(1);

		// Check program.parse was called with argv
		expect(commandInstance.parse).toHaveBeenCalledWith(process.argv);
	});
});
