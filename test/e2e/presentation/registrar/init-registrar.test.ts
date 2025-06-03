import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import { createTestDirectory, createTypeScriptPackageJson } from "../../helpers/e2e-utils";
import { InitCommandRegistrar } from "bin/presentation/registrar/init.registrar.js";
import { ECommand } from "bin/infrastructure/enum/command.enum.js";
import { COMMAND_FLAG_CONFIG } from "bin/application/constant/command-flag-config.constant.js";

describe("InitCommandRegistrar E2E test", () => {
	const testUtils = {
		testDir: "",
		runCommand: async () => ({ stdout: "", stderr: "", success: false }),
		fileExists: async () => false,
		readFile: async () => "",
		createPackageJson: async () => {},
		cleanup: async () => {},
	};

	// Mock Commander program
	const mockProgram = {
		command: vi.fn().mockReturnThis(),
		description: vi.fn().mockReturnThis(),
		option: vi.fn().mockReturnThis(),
		action: vi.fn().mockReturnThis(),
	};

	// Mock command factory
	const mockCommandFactory = {
		createCommand: vi.fn().mockReturnValue({
			execute: vi.fn().mockResolvedValue(undefined),
		}),
	};

	let initRegistrar;

	beforeAll(async () => {
		// Create a temporary test directory and get utility functions
		const utils = await createTestDirectory("init-registrar");
		Object.assign(testUtils, utils);

		// Create a TypeScript package.json for testing
		await testUtils.createPackageJson(createTypeScriptPackageJson());

		// Initialize the registrar
		initRegistrar = new InitCommandRegistrar(mockProgram, mockCommandFactory);
	});

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await testUtils.cleanup();
	});

	it("should register the init command correctly", () => {
		// Execute the registrar
		const result = initRegistrar.execute();

		// Verify command was registered with correct name
		expect(mockProgram.command).toHaveBeenCalledWith(ECommand.INIT);

		// Verify description was set
		expect(mockProgram.description).toHaveBeenCalled();
		expect(mockProgram.description.mock.calls[0][0]).toContain("Initialize project configuration");

		// Verify options were set (one for each command flag config plus the --all option)
		const expectedOptionCount = Object.keys(COMMAND_FLAG_CONFIG).length + 1;
		expect(mockProgram.option).toHaveBeenCalledTimes(expectedOptionCount);

		// Verify the --all option was set
		expect(mockProgram.option).toHaveBeenCalledWith("-a, --all", "Enable all modules");

		// Verify action was set
		expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));

		// Verify the result is the configured program
		expect(result).toBe(mockProgram);
	});

	it("should create and execute the init command when action is triggered", async () => {
		// Execute the registrar to register the action
		initRegistrar.execute();

		// Get the action function
		const actionFn = mockProgram.action.mock.calls[0][0];

		// Mock options
		const mockOptions = { hasEslint: true, hasPrettier: false };

		// Execute the action function
		await actionFn(mockOptions);

		// Verify command factory was called with correct arguments
		expect(mockCommandFactory.createCommand).toHaveBeenCalledWith(ECommand.INIT, expect.any(Object));

		// Verify command execute was called
		const mockCommand = mockCommandFactory.createCommand.mock.results[0].value;
		expect(mockCommand.execute).toHaveBeenCalled();
	});

	it("should enable all modules when the --all flag is used", async () => {
		// Execute the registrar to register the action
		initRegistrar.execute();

		// Get the action function
		const actionFn = mockProgram.action.mock.calls[0][0];

		// Mock options with the 'all' flag
		const mockOptions = { all: true };

		// Execute the action function
		await actionFn(mockOptions);

		// Get the properties passed to createCommand
		const passedProperties = mockCommandFactory.createCommand.mock.calls[0][1];

		// Verify all module properties are set to true
		for (const key of Object.keys(passedProperties)) {
			expect(passedProperties[key]).toBe(true);
		}

		// Verify command execute was called
		const mockCommand = mockCommandFactory.createCommand.mock.results[0].value;
		expect(mockCommand.execute).toHaveBeenCalled();
	});
});
