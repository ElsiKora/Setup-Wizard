import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClackCliInterface } from "../../../../src/infrastructure/service/clack-cli-interface.service";

// Mock the Clack prompts library
vi.mock("@clack/prompts", () => ({
	confirm: vi.fn(),
	groupMultiselect: vi.fn(),
	isCancel: vi.fn(),
	log: {
		error: vi.fn(),
		info: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
		step: vi.fn(),
	},
	multiselect: vi.fn(),
	note: vi.fn(),
	select: vi.fn(),
	spinner: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
	})),
	text: vi.fn(),
}));

// Import after mocking
import * as clack from "@clack/prompts";

describe("ClackCliInterface", () => {
	// CLI Interface instance
	let cliInterface: ClackCliInterface;

	// Mock process.exit
	const exitMock = vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new Error(`Process exited with code ${code}`);
	});

	// Mock console methods
	const consoleClearMock = vi.spyOn(console, "clear").mockImplementation(() => {});

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock implementations
		vi.mocked(clack.isCancel).mockReturnValue(false);

		// Create service instance
		cliInterface = new ClackCliInterface();
	});

	describe("clear", () => {
		it("should call console.clear", () => {
			cliInterface.clear();

			expect(consoleClearMock).toHaveBeenCalled();
		});
	});

	describe("confirm", () => {
		it("should return true when user confirms", async () => {
			vi.mocked(clack.confirm).mockResolvedValueOnce(true);

			const result = await cliInterface.confirm("Confirm?");

			expect(result).toBe(true);
			expect(clack.confirm).toHaveBeenCalledWith({
				initialValue: false,
				message: "Confirm?",
			});
		});

		it("should return false when user declines", async () => {
			vi.mocked(clack.confirm).mockResolvedValueOnce(false);

			const result = await cliInterface.confirm("Confirm?");

			expect(result).toBe(false);
		});

		it("should respect the default value", async () => {
			vi.mocked(clack.confirm).mockResolvedValueOnce(true);

			await cliInterface.confirm("Confirm?", true);

			expect(clack.confirm).toHaveBeenCalledWith({
				initialValue: true,
				message: "Confirm?",
			});
		});

		it("should exit if the user cancels", async () => {
			vi.mocked(clack.confirm).mockResolvedValueOnce(undefined);
			vi.mocked(clack.isCancel).mockReturnValueOnce(true);

			await expect(cliInterface.confirm("Confirm?")).rejects.toThrow("Process exited");
			expect(exitMock).toHaveBeenCalledWith(0);
			expect(clack.log.error).toHaveBeenCalledWith("Operation cancelled by user");
		});
	});

	describe("error", () => {
		it("should log an error message", () => {
			cliInterface.error("Error message");

			expect(clack.log.error).toHaveBeenCalledWith("Error message");
		});
	});

	describe("startSpinner and stopSpinner", () => {
		it("should start and stop a spinner with messages", () => {
			const mockSpinner = {
				start: vi.fn(),
				stop: vi.fn(),
			};

			vi.mocked(clack.spinner).mockReturnValueOnce(mockSpinner);

			cliInterface.startSpinner("Loading...");

			expect(clack.spinner).toHaveBeenCalled();
			expect(mockSpinner.start).toHaveBeenCalledWith("Loading...");

			cliInterface.stopSpinner("Done!");

			expect(mockSpinner.stop).toHaveBeenCalledWith("Done!");
		});

		it("should handle stopSpinner without a message", () => {
			const mockSpinner = {
				start: vi.fn(),
				stop: vi.fn(),
			};

			vi.mocked(clack.spinner).mockReturnValueOnce(mockSpinner);

			cliInterface.startSpinner("Loading...");
			cliInterface.stopSpinner();

			expect(mockSpinner.stop).toHaveBeenCalled();
		});
	});

	// We could add more tests for other methods like select, multiselect, etc.
	// but these cover the most important functionality
});
