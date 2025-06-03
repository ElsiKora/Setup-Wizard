import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PromptsCliInterface } from "bin/infrastructure/service/prompts-cli-interface.service.js";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";

// Mock the dependencies
vi.mock("chalk", () => ({
	default: {
		red: vi.fn((text) => `RED:${text}`),
		blue: vi.fn((text) => `BLUE:${text}`),
		green: vi.fn((text) => `GREEN:${text}`),
		yellow: vi.fn((text) => `YELLOW:${text}`),
		dim: vi.fn((text) => `DIM:${text}`),
		bold: vi.fn((text) => `BOLD:${text}`),
	},
}));

vi.mock("ora", () => ({
	default: vi.fn(() => ({
		start: vi.fn().mockReturnThis(),
		stop: vi.fn().mockReturnThis(),
	})),
}));

vi.mock("prompts", () => ({
	default: vi.fn(),
}));

// Mock process.exit
const mockExit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as any);

describe("PromptsCliInterface E2E test", () => {
	let cliInterface: PromptsCliInterface;

	// Store original console methods
	const originalConsole = {
		log: console.log,
		error: console.error,
		clear: console.clear,
		warn: console.warn,
	};

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Mock console methods
		console.log = vi.fn();
		console.error = vi.fn();
		console.clear = vi.fn();
		console.warn = vi.fn();

		// Create a new interface instance
		cliInterface = new PromptsCliInterface();
	});

	afterEach(() => {
		// Restore console methods
		console.log = originalConsole.log;
		console.error = originalConsole.error;
		console.clear = originalConsole.clear;
		console.warn = originalConsole.warn;
	});

	describe("clear", () => {
		it("should clear the console", () => {
			cliInterface.clear();
			expect(console.clear).toHaveBeenCalled();
		});
	});

	describe("confirm", () => {
		it("should return the response from prompts", async () => {
			(prompts as any).mockResolvedValue({ value: true });

			const result = await cliInterface.confirm("Are you sure?");
			expect(result).toBe(true);
			expect(prompts).toHaveBeenCalledWith({
				active: "Yes",
				inactive: "No",
				initial: false,
				message: "Are you sure?",
				name: "value",
				type: "toggle",
			});
		});

		it("should handle cancellation when value is undefined", async () => {
			(prompts as any).mockResolvedValue({ value: undefined });

			await cliInterface.confirm("Are you sure?");
			expect(console.error).toHaveBeenCalled();
			expect(mockExit).toHaveBeenCalledWith(0);
		});

		it("should handle exceptions in prompts", async () => {
			(prompts as any).mockRejectedValue(new Error("Prompt error"));

			await cliInterface.confirm("Are you sure?");
			expect(console.error).toHaveBeenCalled();
			expect(mockExit).toHaveBeenCalledWith(0);
		});
	});

	describe("error", () => {
		it("should log an error message with red color", () => {
			cliInterface.error("Error message");
			expect(chalk.red).toHaveBeenCalledWith("Error message");
			expect(console.error).toHaveBeenCalled();
		});
	});

	describe("groupMultiselect", () => {
		it("should transform grouped options and return the selected values", async () => {
			const options = {
				"Group 1": [
					{ label: "Option 1", value: "option1" },
					{ label: "Option 2", value: "option2" },
				],
				"Group 2": [{ label: "Option 3", value: "option3" }],
			};

			(prompts as any).mockResolvedValue({ values: ["option1", "option3"] });

			const result = await cliInterface.groupMultiselect("Select options", options);
			expect(result).toEqual(["option1", "option3"]);

			// Check that prompts was called with flattened options
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Group 1: Option 1", value: "option1", selected: false },
						{ title: "Group 1: Option 2", value: "option2", selected: false },
						{ title: "Group 2: Option 3", value: "option3", selected: false },
					],
				}),
			);
		});

		it("should handle pre-selected values", async () => {
			const options = {
				Group: [
					{ label: "Option 1", value: "option1" },
					{ label: "Option 2", value: "option2" },
				],
			};

			const initialValues = ["option1"];
			(prompts as any).mockResolvedValue({ values: initialValues });

			await cliInterface.groupMultiselect("Select options", options, false, initialValues);

			// Check that prompts was called with the right selected options
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Group: Option 1", value: "option1", selected: true },
						{ title: "Group: Option 2", value: "option2", selected: false },
					],
				}),
			);
		});

		it("should set min requirement when isRequired is true", async () => {
			const options = {
				Group: [{ label: "Option", value: "option" }],
			};

			(prompts as any).mockResolvedValue({ values: ["option"] });

			await cliInterface.groupMultiselect("Select options", options, true);

			// Check that min is set
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					min: 1,
				}),
			);
		});
	});

	describe("handleError", () => {
		it("should log error message and details", () => {
			const error = new Error("Test error");

			cliInterface.handleError("Something went wrong", error);

			expect(chalk.red).toHaveBeenCalledWith("Something went wrong");
			expect(console.error).toHaveBeenCalledWith("RED:Something went wrong");
			expect(console.error).toHaveBeenCalledWith(error);
		});
	});

	describe("info", () => {
		it("should log a blue info message", () => {
			cliInterface.info("Info message");
			expect(chalk.blue).toHaveBeenCalledWith("Info message");
			expect(console.log).toHaveBeenCalled();
		});
	});

	describe("log", () => {
		it("should log a standard message", () => {
			cliInterface.log("Standard message");
			expect(console.log).toHaveBeenCalledWith("Standard message");
		});
	});

	describe("multiselect", () => {
		it("should transform options and return the selected values", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ values: ["option1"] });

			const result = await cliInterface.multiselect("Select options", options);
			expect(result).toEqual(["option1"]);

			// Check that prompts was called with correctly formatted options
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Option 1", value: "option1", selected: false },
						{ title: "Option 2", value: "option2", selected: false },
					],
				}),
			);
		});

		it("should handle initialValues with selected options", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			const initialValues = ["option1"];
			(prompts as any).mockResolvedValue({ values: ["option1", "option2"] });

			await cliInterface.multiselect("Select options", options, false, initialValues);

			// Check that prompts was called with the correct selected options
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Option 1", value: "option1", selected: true },
						{ title: "Option 2", value: "option2", selected: false },
					],
				}),
			);
		});

		it("should handle initialValues with no matching options", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			const initialValues = ["option3"]; // Not in the options
			(prompts as any).mockResolvedValue({ values: ["option1"] });

			await cliInterface.multiselect("Select options", options, false, initialValues);

			// All options should be unselected since initialValues doesn't match any
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Option 1", value: "option1", selected: false },
						{ title: "Option 2", value: "option2", selected: false },
					],
				}),
			);
		});

		it("should set min requirement when isRequired is true", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ values: ["option1"] });

			await cliInterface.multiselect("Select options", options, true);

			// Check that min is set to 1 when isRequired is true
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					min: 1,
				}),
			);
		});

		it("should handle undefined when values are undefined", async () => {
			const options = [{ label: "Option 1", value: "option1" }];

			(prompts as any).mockResolvedValue({ values: undefined });

			await cliInterface.multiselect("Select options", options);

			expect(console.error).toHaveBeenCalledWith("RED:Operation cancelled by user");
			expect(mockExit).toHaveBeenCalledWith(0);
		});
	});

	describe("note", () => {
		it("should display a formatted note", () => {
			cliInterface.note("Title", "Message content");

			// Verify calls to chalk and console.log for formatting
			expect(chalk.dim).toHaveBeenCalled();
			expect(chalk.bold).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledTimes(5); // Top, title, separator, content, bottom
		});

		it("should handle multiline messages", () => {
			cliInterface.note("Title", "Line 1\nLine 2");

			// Should have more console.log calls due to multiple lines
			expect(console.log).toHaveBeenCalledTimes(6); // Top, title, separator, line1, line2, bottom
		});
	});

	describe("select", () => {
		it("should return the selected value", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ value: "option2" });

			const result = await cliInterface.select("Select an option", options);
			expect(result).toBe("option2");

			// Check that prompts was called with correctly formatted options
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Option 1", value: "option1" },
						{ title: "Option 2", value: "option2" },
					],
				}),
			);
		});

		it("should handle initial value", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ value: "option2" });

			await cliInterface.select("Select an option", options, "option2");

			// Should find the index of the initial value
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					initial: 1, // index of 'option2'
				}),
			);
		});

		it("should handle initial value that is not found in options", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ value: "option1" });

			await cliInterface.select("Select an option", options, "option3"); // option3 doesn't exist

			// Should default to index 0 when initial value is not found
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					initial: 0,
				}),
			);
		});

		it("should handle undefined initial value", async () => {
			const options = [
				{ label: "Option 1", value: "option1" },
				{ label: "Option 2", value: "option2" },
			];

			(prompts as any).mockResolvedValue({ value: "option1" });

			await cliInterface.select("Select an option", options, undefined);

			// Should not include the initial parameter or set it to undefined
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					initial: undefined,
				}),
			);
		});
	});

	describe("spinner", () => {
		it("should start a spinner with the given message", () => {
			cliInterface.startSpinner("Loading...");

			expect(ora).toHaveBeenCalledWith("Loading...");
			expect(cliInterface.spinner.start).toHaveBeenCalled();
		});

		it("should stop the spinner", () => {
			cliInterface.startSpinner("Loading...");
			cliInterface.stopSpinner();

			expect(cliInterface.spinner.stop).toHaveBeenCalled();
		});

		it("should display a message when stopping with message", () => {
			cliInterface.startSpinner("Loading...");
			cliInterface.stopSpinner("Completed!");

			expect(cliInterface.spinner.stop).toHaveBeenCalled();
			expect(console.log).toHaveBeenCalledWith("Completed!");
		});
	});

	describe("success", () => {
		it("should log a green success message", () => {
			cliInterface.success("Success message");

			expect(chalk.green).toHaveBeenCalledWith("Success message");
			expect(console.log).toHaveBeenCalled();
		});
	});

	describe("text", () => {
		it("should return the text input", async () => {
			(prompts as any).mockResolvedValue({ value: "User input" });

			const result = await cliInterface.text("Enter text");
			expect(result).toBe("User input");

			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Enter text",
					type: "text",
				}),
			);
		});

		it("should handle validation function", async () => {
			const validate = (value: string) => (value.length < 3 ? "Too short" : undefined);

			(prompts as any).mockResolvedValue({ value: "Valid input" });

			await cliInterface.text("Enter text", undefined, undefined, validate);

			// Check that prompts was called with a validate function
			expect(prompts).toHaveBeenCalledWith(
				expect.objectContaining({
					validate: expect.any(Function),
				}),
			);
		});
	});

	describe("warn", () => {
		it("should log a yellow warning message", () => {
			cliInterface.warn("Warning message");

			expect(chalk.yellow).toHaveBeenCalledWith("Warning message");
			expect(console.warn).toHaveBeenCalled();
		});
	});
});
