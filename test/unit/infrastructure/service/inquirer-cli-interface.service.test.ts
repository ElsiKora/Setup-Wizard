import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InquirerCliInterface } from "../../../../src/infrastructure/service/inquirer-cli-interface.service";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";

// Mock dependencies
vi.mock("inquirer");
vi.mock("chalk", () => ({
	default: {
		blue: vi.fn((text) => `BLUE:${text}`),
		bold: vi.fn((text) => `BOLD:${text}`),
		green: vi.fn((text) => `GREEN:${text}`),
		red: vi.fn((text) => `RED:${text}`),
		yellow: vi.fn((text) => `YELLOW:${text}`),
	},
}));
vi.mock("ora", () => ({
	default: vi.fn(() => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
	})),
}));

describe("InquirerCliInterface", () => {
	// Console mocks
	const originalConsoleLog = console.log;
	const originalConsoleError = console.error;
	const originalConsoleInfo = console.info;
	const originalConsoleWarn = console.warn;
	const originalProcessExit = process.exit;
	const originalConsoleClear = console.clear;

	// Service instance
	let cliInterface: InquirerCliInterface;

	// Mock console functions
	const mockConsoleLog = vi.fn();
	const mockConsoleError = vi.fn();
	const mockConsoleInfo = vi.fn();
	const mockConsoleWarn = vi.fn();
	const mockProcessExit = vi.fn();
	const mockConsoleClear = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Replace console functions with mocks
		console.log = mockConsoleLog;
		console.error = mockConsoleError;
		console.info = mockConsoleInfo;
		console.warn = mockConsoleWarn;
		console.clear = mockConsoleClear;
		process.exit = mockProcessExit as any;

		// Create service instance
		cliInterface = new InquirerCliInterface();
	});

	afterEach(() => {
		// Restore original console functions
		console.log = originalConsoleLog;
		console.error = originalConsoleError;
		console.info = originalConsoleInfo;
		console.warn = originalConsoleWarn;
		console.clear = originalConsoleClear;
		process.exit = originalProcessExit;
	});

	describe("logging methods", () => {
		it("log should output message to console", () => {
			cliInterface.log("Test message");
			expect(mockConsoleLog).toHaveBeenCalledWith("Test message");
		});

		it("info should output blue message to console", () => {
			cliInterface.info("Info message");
			expect(mockConsoleLog).toHaveBeenCalledWith("BLUE:Info message");
			expect(chalk.blue).toHaveBeenCalledWith("Info message");
		});

		it("success should output green message to console", () => {
			cliInterface.success("Success message");
			expect(mockConsoleLog).toHaveBeenCalledWith("GREEN:Success message");
			expect(chalk.green).toHaveBeenCalledWith("Success message");
		});

		it("warn should output yellow message to console", () => {
			cliInterface.warn("Warning message");
			expect(mockConsoleWarn).toHaveBeenCalledWith("YELLOW:Warning message");
			expect(chalk.yellow).toHaveBeenCalledWith("Warning message");
		});

		it("error should output red message to console", () => {
			cliInterface.error("Error message");
			expect(mockConsoleError).toHaveBeenCalledWith("RED:Error message");
			expect(chalk.red).toHaveBeenCalledWith("Error message");
		});

		it("handleError should output error message and details", () => {
			const error = new Error("Test error");
			cliInterface.handleError("Error occurred", error);
			expect(mockConsoleError).toHaveBeenCalledWith("RED:Error occurred");
			expect(mockConsoleError).toHaveBeenCalledWith(error);
			expect(chalk.red).toHaveBeenCalledWith("Error occurred");
		});

		it("clear should clear the console", () => {
			cliInterface.clear();
			expect(mockConsoleClear).toHaveBeenCalled();
		});
	});

	describe("spinner methods", () => {
		it("startSpinner should start a spinner with the given message", () => {
			const spinner = (cliInterface as any).SPINNER;
			cliInterface.startSpinner("Loading...");
			expect(spinner.start).toHaveBeenCalledWith("Loading...");
		});

		it("stopSpinner without message should stop the spinner", () => {
			const spinner = (cliInterface as any).SPINNER;
			cliInterface.stopSpinner();
			expect(spinner.stop).toHaveBeenCalled();
			expect(mockConsoleLog).not.toHaveBeenCalled();
		});

		it("stopSpinner with message should stop the spinner and log the message", () => {
			const spinner = (cliInterface as any).SPINNER;
			cliInterface.stopSpinner("Completed!");
			expect(spinner.stop).toHaveBeenCalled();
			expect(mockConsoleLog).toHaveBeenCalledWith("Completed!");
		});
	});

	describe("note method", () => {
		it("should display a title and message", () => {
			cliInterface.note("Title", "Message content");
			expect(mockConsoleLog).toHaveBeenCalledWith("BOLD:Title");
			expect(mockConsoleLog).toHaveBeenCalledWith("Message content");
			expect(chalk.bold).toHaveBeenCalledWith("Title");
		});
	});

	describe("prompt methods", () => {
		it("confirm should return user confirmation result", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ confirmation: true });

			const result = await cliInterface.confirm("Confirm?", false);

			expect(result).toBe(true);
			expect(inquirer.prompt).toHaveBeenCalledWith({
				type: "confirm",
				name: "confirmation",
				message: "Confirm?",
				default: false,
			});
		});

		it("confirm should use default value when provided", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ confirmation: true });

			await cliInterface.confirm("Confirm?", true);

			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					default: true,
				}),
			);
		});

		it("confirm should handle exceptions", async () => {
			vi.mocked(inquirer.prompt).mockRejectedValueOnce(new Error("Prompt error"));

			await cliInterface.confirm("Confirm?");

			expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockProcessExit).toHaveBeenCalledWith(0);
		});

		it("text should return user input", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ text: "User input" });

			const result = await cliInterface.text("Enter text:");

			expect(result).toBe("User input");
			expect(inquirer.prompt).toHaveBeenCalledWith({
				type: "input",
				name: "text",
				message: "Enter text:",
				default: undefined,
				validate: undefined,
			});
		});

		it("text should use initial value when provided", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ text: "User input" });

			await cliInterface.text("Enter text:", undefined, "Initial value");

			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					default: "Initial value",
				}),
			);
		});

		it("text should use validation function when provided", async () => {
			const validate = vi.fn((value) => (value ? undefined : "Value is required"));
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ text: "Valid input" });

			await cliInterface.text("Enter text:", undefined, undefined, validate);

			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					validate: expect.any(Function),
				}),
			);
		});

		it("text should handle validation results", async () => {
			// Create a test validator that gets used in inquirer
			const validate = vi.fn((value) => (value === "valid" ? undefined : "Invalid input"));
			vi.mocked(inquirer.prompt).mockImplementationOnce(async (options) => {
				// Simulate inquirer calling the validate function
				const validateFn = options.validate as any;

				if (validateFn) {
					// Test with a valid input
					expect(validateFn("valid")).toBe(true);

					// Test with an invalid input (string message)
					expect(validateFn("invalid")).toBe("Invalid input");

					// Test with an error object
					validate.mockReturnValueOnce(new Error("Error message"));
					expect(validateFn("error")).toBe("Error message");

					// Test with an unexpected return type
					validate.mockReturnValueOnce({} as any);
					expect(validateFn("unknown")).toBe("Invalid input");
				}

				return { text: "test" };
			});

			await cliInterface.text("Enter text:", undefined, undefined, validate);
		});

		it("text should handle exceptions", async () => {
			vi.mocked(inquirer.prompt).mockRejectedValueOnce(new Error("Prompt error"));

			await cliInterface.text("Enter text:");

			expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockProcessExit).toHaveBeenCalledWith(0);
		});

		it("select should return user selection", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: "option1" });

			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			const result = await cliInterface.select("Select option:", options);

			expect(result).toBe("option1");
			expect(inquirer.prompt).toHaveBeenCalledWith({
				type: "list",
				name: "selection",
				message: "Select option:",
				choices: [
					{ name: "Option 1", value: "option1" },
					{ name: "Option 2", value: "option2" },
				],
				default: undefined,
			});
		});

		it("select should use initial value when provided", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: "option2" });

			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			await cliInterface.select("Select option:", options, "option2");

			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					default: "option2",
				}),
			);
		});

		it("select should handle exceptions", async () => {
			vi.mocked(inquirer.prompt).mockRejectedValueOnce(new Error("Prompt error"));

			const options = [{ label: "Option 1", value: "option1" }];

			await cliInterface.select("Select option:", options);

			expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockProcessExit).toHaveBeenCalledWith(0);
		});

		it("multiselect should return user selections", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["option1", "option3"] });

			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
				{ label: "Option 3", value: "option3" },
			];

			const result = await cliInterface.multiselect("Select options:", options);

			expect(result).toEqual(["option1", "option3"]);
			expect(inquirer.prompt).toHaveBeenCalledWith({
				type: "checkbox",
				name: "selection",
				message: "Select options: (space to select)",
				choices: [
					{ name: "Option 1", value: "option1", checked: false },
					{ name: "Option 2", value: "option2", checked: false },
					{ name: "Option 3", value: "option3", checked: false },
				],
				validate: undefined,
			});
		});

		it("multiselect should use initial values when provided", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["option1", "option3"] });

			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
				{ label: "Option 3", value: "option3" },
			];

			await cliInterface.multiselect("Select options:", options, false, ["option1", "option3"]);

			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ name: "Option 1", value: "option1", checked: true },
						{ name: "Option 2", value: "option2", checked: false },
						{ name: "Option 3", value: "option3", checked: true },
					],
				}),
			);
		});

		it("multiselect should add validation when required is true", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["option1"] });

			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			await cliInterface.multiselect("Select options:", options, true);

			const promptCall = vi.mocked(inquirer.prompt).mock.calls[0][0];
			expect(promptCall).toHaveProperty("validate");

			// Test the validation function
			const validateFn = promptCall.validate as any;
			expect(validateFn([])).toBe("You must select at least one option");
			expect(validateFn(["option1"])).toBe(true);
		});

		it("multiselect should handle exceptions", async () => {
			vi.mocked(inquirer.prompt).mockRejectedValueOnce(new Error("Prompt error"));

			const options = [{ label: "Option 1", value: "option1" }];

			await cliInterface.multiselect("Select options:", options);

			expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockProcessExit).toHaveBeenCalledWith(0);
		});

		it("groupMultiselect should return user selections from groups", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["group1-option1", "group2-option2"] });

			const groupOptions = {
				"Group 1": [
					{ label: "Option 1", value: "group1-option1" },
					{ label: "Option 2", value: "group1-option2" },
				],
				"Group 2": [
					{ label: "Option 1", value: "group2-option1" },
					{ label: "Option 2", value: "group2-option2" },
				],
			};

			const result = await cliInterface.groupMultiselect("Select options:", groupOptions);

			expect(result).toEqual(["group1-option1", "group2-option2"]);
			expect(inquirer.prompt).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "checkbox",
					name: "selection",
					message: "Select options: (space to select)",
					choices: expect.arrayContaining([
						{ name: "Group 1: Option 1", value: "group1-option1", checked: false },
						{ name: "Group 1: Option 2", value: "group1-option2", checked: false },
						{ name: "Group 2: Option 1", value: "group2-option1", checked: false },
						{ name: "Group 2: Option 2", value: "group2-option2", checked: false },
					]),
					validate: undefined,
				}),
			);
		});

		it("groupMultiselect should use initial values when provided", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["group1-option1", "group2-option2"] });

			const groupOptions = {
				"Group 1": [
					{ label: "Option 1", value: "group1-option1" },
					{ label: "Option 2", value: "group1-option2" },
				],
				"Group 2": [
					{ label: "Option 1", value: "group2-option1" },
					{ label: "Option 2", value: "group2-option2" },
				],
			};

			await cliInterface.groupMultiselect("Select options:", groupOptions, false, ["group1-option1", "group2-option2"]);

			// Verify that the expected options are marked as checked
			const promptCall = vi.mocked(inquirer.prompt).mock.calls[0][0];
			expect(promptCall).toHaveProperty("choices");

			// Find the checked choices and verify they match our initialValues
			const choices = promptCall.choices as Array<{ checked: boolean; name: string; value: string }>;
			const checkedChoices = choices.filter((c) => c.checked);
			expect(checkedChoices).toHaveLength(2);
			expect(checkedChoices.map((c) => c.value)).toEqual(["group1-option1", "group2-option2"]);
		});

		it("groupMultiselect should add validation when required is true", async () => {
			vi.mocked(inquirer.prompt).mockResolvedValueOnce({ selection: ["group1-option1"] });

			const groupOptions = {
				"Group 1": [{ label: "Option 1", value: "group1-option1" }],
			};

			await cliInterface.groupMultiselect("Select options:", groupOptions, true);

			const promptCall = vi.mocked(inquirer.prompt).mock.calls[0][0];
			expect(promptCall).toHaveProperty("validate");

			// Test the validation function
			const validateFn = promptCall.validate as any;
			expect(validateFn([])).toBe("You must select at least one option");
			expect(validateFn(["group1-option1"])).toBe(true);
		});

		it("groupMultiselect should handle exceptions", async () => {
			vi.mocked(inquirer.prompt).mockRejectedValueOnce(new Error("Prompt error"));

			const groupOptions = {
				"Group 1": [{ label: "Option 1", value: "group1-option1" }],
			};

			await cliInterface.groupMultiselect("Select options:", groupOptions);

			expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockProcessExit).toHaveBeenCalledWith(0);
		});
	});
});
