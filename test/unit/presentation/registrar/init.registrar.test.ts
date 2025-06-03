import { describe, it, expect, vi, beforeEach } from "vitest";
import { InitCommandRegistrar } from "../../../../src/presentation/registrar/init.registrar";
import { COMMAND_FLAG_CONFIG } from "../../../../src/application/constant/command-flag-config.constant";
import { CommandOptionsMapper } from "../../../../src/application/mapper/command-options.mapper";
import { ECommand } from "../../../../src/infrastructure/enum/command.enum";

// Mock CommandOptionsMapper
vi.mock("../../../../src/application/mapper/command-options.mapper", () => ({
	CommandOptionsMapper: {
		fromFlagToModule: vi.fn((properties) => ({ ...properties, mapped: true })),
	},
}));

describe("InitCommandRegistrar", () => {
	// Mocks
	const mockCommandAction = vi.fn();
	const mockCommandDescription = vi.fn(() => mockCommand);
	const mockCommandOption = vi.fn(() => mockCommand);
	const mockCommand = {
		description: mockCommandDescription,
		option: mockCommandOption,
		action: vi.fn(() => mockCommandAction),
	};

	const mockProgram = {
		command: vi.fn(() => mockCommand),
	};

	const mockExecute = vi.fn();
	const mockCommandFactory = {
		createCommand: vi.fn(() => ({
			execute: mockExecute,
		})),
	};

	// Registrar instance
	let registrar: InitCommandRegistrar;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create registrar instance
		registrar = new InitCommandRegistrar(mockProgram as any, mockCommandFactory as any);
	});

	describe("constructor", () => {
		it("should initialize with the correct properties", () => {
			expect(registrar.PROGRAM).toBe(mockProgram);
			expect(registrar.COMMAND_FACTORY).toBe(mockCommandFactory);
		});
	});

	describe("execute", () => {
		it("should register the init command with the program", () => {
			registrar.execute();

			expect(mockProgram.command).toHaveBeenCalledWith(ECommand.INIT);
			expect(mockCommandDescription).toHaveBeenCalledWith(expect.stringContaining("Initialize project configuration files"));
		});

		it("should add all configured command options", () => {
			registrar.execute();

			// Should add all options from COMMAND_FLAG_CONFIG
			expect(mockCommandOption).toHaveBeenCalledTimes(Object.keys(COMMAND_FLAG_CONFIG).length + 1); // +1 for the --all option

			// Check that the --all option is added
			expect(mockCommandOption).toHaveBeenCalledWith("-a, --all", "Enable all modules");

			// Sample check for specific options
			for (const config of Object.values(COMMAND_FLAG_CONFIG)) {
				expect(mockCommandOption).toHaveBeenCalledWith(`-${config.shortFlag}, --${config.fullFlag}`, config.description);
			}
		});

		it("should set up the command action handler", () => {
			registrar.execute();

			expect(mockCommand.action).toHaveBeenCalled();

			// Get the action handler function
			const actionHandler = mockCommand.action.mock.calls[0][0];

			// Call the action handler with normal properties
			const properties = { eslint: true, prettier: true };
			actionHandler(properties);

			expect(CommandOptionsMapper.fromFlagToModule).toHaveBeenCalledWith(properties);
			expect(mockCommandFactory.createCommand).toHaveBeenCalledWith(ECommand.INIT, { ...properties, mapped: true });
			expect(mockExecute).toHaveBeenCalled();
		});

		it("should enable all modules when --all flag is present", () => {
			registrar.execute();

			// Get the action handler function
			const actionHandler = mockCommand.action.mock.calls[0][0];

			// Mock CommandOptionsMapper to return multiple properties
			vi.mocked(CommandOptionsMapper.fromFlagToModule).mockReturnValueOnce({
				eslint: false,
				prettier: false,
				commitlint: false,
				mapped: true,
			});

			// Call the action handler with the --all flag
			actionHandler({ all: true });

			// All properties should be set to true
			// Using expect.objectContaining because the exact properties may vary
			expect(mockCommandFactory.createCommand).toHaveBeenCalledWith(
				ECommand.INIT,
				expect.objectContaining({
					eslint: true,
					prettier: true,
					commitlint: true,
					mapped: true,
				}),
			);
		});

		it("should return the configured command", () => {
			const result = registrar.execute();

			expect(result).toBe(mockCommand);
		});
	});
});
