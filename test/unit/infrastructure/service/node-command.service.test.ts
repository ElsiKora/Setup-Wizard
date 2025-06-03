import { describe, it, expect, vi, beforeEach } from "vitest";
import { NodeCommandService } from "../../../../src/infrastructure/service/node-command.service";
import type { ICliInterfaceService } from "../../../../src/application/interface/cli-interface-service.interface";
import type { ICliInterfaceServiceSelectOptions } from "../../../../src/domain/interface/cli-interface-service-select-options.interface";

// Mock the node:child_process module
vi.mock("node:child_process", () => ({
	exec: vi.fn(),
}));

// Mock the node:util module
vi.mock("node:util", () => ({
	promisify: vi.fn().mockImplementation((fn) => {
		return vi.fn();
	}),
}));

// Import the mocked modules to access their mock functions
import { exec } from "node:child_process";
import { promisify } from "node:util";

describe("NodeCommandService", () => {
	let nodeCommandService: NodeCommandService;
	let mockCliInterfaceService: ICliInterfaceService;
	let mockExecAsync: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create mock CLI interface service
		mockCliInterfaceService = {
			warn: vi.fn(),
			info: vi.fn(),
			success: vi.fn(),
			select: vi.fn(),
		} as unknown as ICliInterfaceService;

		// Set up the promisify mock to return our mockExecAsync function
		mockExecAsync = vi.fn();
		(promisify as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockExecAsync);

		// Create service instance
		nodeCommandService = new NodeCommandService(mockCliInterfaceService);
	});

	describe("constructor", () => {
		it("should initialize with the provided CLI interface service", () => {
			expect(nodeCommandService.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
			expect(promisify).toHaveBeenCalledWith(exec);
		});
	});

	describe("execute", () => {
		it("should execute the command successfully", async () => {
			// Mock successful execution
			mockExecAsync.mockResolvedValue({ stdout: "success", stderr: "" });

			// Execute a command
			await nodeCommandService.execute('echo "Hello World"');

			// Verify the command was executed
			expect(mockExecAsync).toHaveBeenCalledWith('echo "Hello World"');
		});

		it("should throw error for non-npm command failures", async () => {
			// Mock failed execution
			const mockError = new Error("Command failed");
			mockExecAsync.mockRejectedValue(mockError);

			// Execute a non-npm command and expect it to throw
			await expect(nodeCommandService.execute("invalid-command")).rejects.toThrow(mockError);

			// Verify the command was attempted
			expect(mockExecAsync).toHaveBeenCalledWith("invalid-command");
		});

		it("should handle npm install failures by offering retry options", async () => {
			// Mock failed npm install
			mockExecAsync.mockRejectedValueOnce(new Error("npm install failed"));

			// Mock the user selecting 'force' option
			mockCliInterfaceService.select.mockResolvedValue("force");

			// Mock successful retry with force flag
			mockExecAsync.mockResolvedValueOnce({ stdout: "success with force", stderr: "" });

			// Execute npm install
			await nodeCommandService.execute("npm install package");

			// Verify the handling process
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith("npm command exection failed.");
			expect(mockCliInterfaceService.select).toHaveBeenCalled();
			expect(mockCliInterfaceService.info).toHaveBeenCalledWith("Retrying with --force flag...");
			expect(mockExecAsync).toHaveBeenCalledWith("npm install package --force");
			expect(mockCliInterfaceService.success).toHaveBeenCalledWith("Execution completed with --force flag.");
		});

		it("should handle npm install failures with legacy-peer-deps option", async () => {
			// Mock failed npm install
			mockExecAsync.mockRejectedValueOnce(new Error("npm install failed"));

			// Mock the user selecting 'legacy-peer-deps' option
			mockCliInterfaceService.select.mockResolvedValue("legacy-peer-deps");

			// Mock successful retry with legacy-peer-deps flag
			mockExecAsync.mockResolvedValueOnce({ stdout: "success with legacy-peer-deps", stderr: "" });

			// Execute npm install
			await nodeCommandService.execute("npm install package");

			// Verify the handling process
			expect(mockCliInterfaceService.select).toHaveBeenCalled();
			expect(mockCliInterfaceService.info).toHaveBeenCalledWith("Retrying with --legacy-peer-deps flag...");
			expect(mockExecAsync).toHaveBeenCalledWith("npm install package --legacy-peer-deps");
			expect(mockCliInterfaceService.success).toHaveBeenCalledWith("Execution completed with --legacy-peer-deps flag.");
		});

		it("should throw error when user cancels npm command", async () => {
			// Mock failed npm install
			mockExecAsync.mockRejectedValueOnce(new Error("npm install failed"));

			// Mock the user selecting 'cancel' option
			mockCliInterfaceService.select.mockResolvedValue("cancel");

			// Execute npm install and expect it to throw
			await expect(nodeCommandService.execute("npm install package")).rejects.toThrow("npm command execution was cancelled by user.");

			// Verify the handling process
			expect(mockCliInterfaceService.info).toHaveBeenCalledWith("Execution cancelled by user.");
		});

		it("should throw error for invalid selection in npm retry", async () => {
			// Mock failed npm install
			mockExecAsync.mockRejectedValueOnce(new Error("npm install failed"));

			// Mock the user selecting an invalid option
			mockCliInterfaceService.select.mockResolvedValue("invalid");

			// Execute npm install and expect it to throw
			await expect(nodeCommandService.execute("npm install package")).rejects.toThrow("Invalid option selected.");
		});

		it("should handle npm ci command failures", async () => {
			// Mock failed npm ci
			mockExecAsync.mockRejectedValueOnce(new Error("npm ci failed"));

			// Mock the user selecting 'force' option
			mockCliInterfaceService.select.mockResolvedValue("force");

			// Mock successful retry with force flag
			mockExecAsync.mockResolvedValueOnce({ stdout: "success with force", stderr: "" });

			// Execute npm ci
			await nodeCommandService.execute("npm ci");

			// Verify the handling process
			expect(mockCliInterfaceService.warn).toHaveBeenCalledWith("npm command exection failed.");
			expect(mockCliInterfaceService.select).toHaveBeenCalled();
			expect(mockExecAsync).toHaveBeenCalledWith("npm ci --force");
		});

		it("should handle npm update command failures", async () => {
			// Mock failed npm update
			mockExecAsync.mockRejectedValueOnce(new Error("npm update failed"));

			// Mock the user selecting 'legacy-peer-deps' option
			mockCliInterfaceService.select.mockResolvedValue("legacy-peer-deps");

			// Mock successful retry with legacy-peer-deps flag
			mockExecAsync.mockResolvedValueOnce({ stdout: "success with legacy-peer-deps", stderr: "" });

			// Execute npm update
			await nodeCommandService.execute("npm update package");

			// Verify the handling process
			expect(mockCliInterfaceService.select).toHaveBeenCalled();
			expect(mockExecAsync).toHaveBeenCalledWith("npm update package --legacy-peer-deps");
		});

		it("should handle npm uninstall command failures", async () => {
			// Mock failed npm uninstall
			mockExecAsync.mockRejectedValueOnce(new Error("npm uninstall failed"));

			// Mock the user selecting 'force' option
			mockCliInterfaceService.select.mockResolvedValue("force");

			// Mock successful retry with force flag
			mockExecAsync.mockResolvedValueOnce({ stdout: "success with force", stderr: "" });

			// Execute npm uninstall
			await nodeCommandService.execute("npm uninstall package");

			// Verify the handling process
			expect(mockCliInterfaceService.select).toHaveBeenCalled();
			expect(mockExecAsync).toHaveBeenCalledWith("npm uninstall package --force");
		});
	});

	describe("handleNpmInstallFailure", () => {
		it("should offer retry options to the user", async () => {
			// We'll test this method indirectly through execute for better coverage
			// This is because handleNpmInstallFailure is a private method

			// Mock failed npm install
			mockExecAsync.mockRejectedValueOnce(new Error("npm install failed"));

			// Set up expected select options
			const expectedOptions: Array<ICliInterfaceServiceSelectOptions> = [
				{ label: "Retry with --force", value: "force" },
				{ label: "Retry with --legacy-peer-deps", value: "legacy-peer-deps" },
				{ label: "Cancel command execution", value: "cancel" },
			];

			// Mock the user selecting 'force' option
			mockCliInterfaceService.select.mockResolvedValue("force");

			// Mock successful retry
			mockExecAsync.mockResolvedValueOnce({ stdout: "success", stderr: "" });

			// Execute npm install
			await nodeCommandService.execute("npm install package");

			// Verify the options were presented
			expect(mockCliInterfaceService.select).toHaveBeenCalledWith("How would you like to proceed?", expect.arrayContaining(expectedOptions));
		});
	});
});
