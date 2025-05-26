import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NodeFileSystemService } from "../../../../src/infrastructure/service/node-file-system.service";
import * as fs from "node:fs/promises";
import * as path from "node:path";

// Mock Node.js modules
vi.mock("node:fs/promises");
vi.mock("node:path");

describe("NodeFileSystemService", () => {
	let fileSystemService: NodeFileSystemService;

	beforeEach(() => {
		fileSystemService = new NodeFileSystemService();

		// Reset all mocks
		vi.resetAllMocks();

		// Default mock implementations
		vi.mocked(path.dirname).mockImplementation((p) => `/dir/${p}`);
		vi.mocked(path.extname).mockImplementation((p) => ".test");
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("createDirectory", () => {
		it("should create a directory", async () => {
			// Setup
			const directoryPath = "/test/dir";
			vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);

			// Execute
			await fileSystemService.createDirectory(directoryPath);

			// Verify
			expect(path.dirname).toHaveBeenCalledWith(directoryPath);
			expect(fs.mkdir).toHaveBeenCalledWith("/dir//test/dir", { recursive: undefined });
		});

		it("should create a directory recursively", async () => {
			// Setup
			const directoryPath = "/test/deep/dir";
			vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);

			// Execute
			await fileSystemService.createDirectory(directoryPath, { isRecursive: true });

			// Verify
			expect(path.dirname).toHaveBeenCalledWith(directoryPath);
			expect(fs.mkdir).toHaveBeenCalledWith("/dir//test/deep/dir", { recursive: true });
		});
	});

	describe("deleteFile", () => {
		it("should delete a file", async () => {
			// Setup
			const filePath = "/test/file.txt";
			vi.mocked(fs.unlink).mockResolvedValueOnce(undefined);

			// Execute
			await fileSystemService.deleteFile(filePath);

			// Verify
			expect(fs.unlink).toHaveBeenCalledWith(filePath);
		});
	});

	describe("getDirectoryNameFromFilePath", () => {
		it("should get directory name from file path", () => {
			// Setup
			const filePath = "/test/file.txt";
			vi.mocked(path.dirname).mockReturnValueOnce("/test");

			// Execute
			const result = fileSystemService.getDirectoryNameFromFilePath(filePath);

			// Verify
			expect(path.dirname).toHaveBeenCalledWith(filePath);
			expect(result).toBe("/test");
		});
	});

	describe("getExtensionFromFilePath", () => {
		it("should get extension from file path", () => {
			// Setup
			const filePath = "/test/file.txt";
			vi.mocked(path.extname).mockReturnValueOnce(".txt");

			// Execute
			const result = fileSystemService.getExtensionFromFilePath(filePath);

			// Verify
			expect(path.extname).toHaveBeenCalledWith(filePath);
			expect(result).toBe(".txt");
		});
	});

	describe("isOneOfPathsExists", () => {
		it("should return the first existing path", async () => {
			// Setup
			const paths = ["/test/not-exists.txt", "/test/exists.txt", "/test/also-exists.txt"];

			// Mock isPathExists to return false for first path, true for second
			vi.spyOn(fileSystemService, "isPathExists").mockResolvedValueOnce(false).mockResolvedValueOnce(true);

			// Execute
			const result = await fileSystemService.isOneOfPathsExists(paths);

			// Verify
			expect(fileSystemService.isPathExists).toHaveBeenCalledTimes(2);
			expect(result).toBe("/test/exists.txt");
		});

		it("should return undefined if no paths exist", async () => {
			// Setup
			const paths = ["/test/not-exists1.txt", "/test/not-exists2.txt"];

			// Mock isPathExists to always return false
			vi.spyOn(fileSystemService, "isPathExists").mockResolvedValue(false);

			// Execute
			const result = await fileSystemService.isOneOfPathsExists(paths);

			// Verify
			expect(fileSystemService.isPathExists).toHaveBeenCalledTimes(2);
			expect(result).toBeUndefined();
		});
	});

	describe("isPathExists", () => {
		it("should return true if path exists", async () => {
			// Setup
			const filePath = "/test/exists.txt";
			vi.mocked(fs.access).mockResolvedValueOnce(undefined);

			// Execute
			const result = await fileSystemService.isPathExists(filePath);

			// Verify
			expect(fs.access).toHaveBeenCalledWith(filePath);
			expect(result).toBe(true);
		});

		it("should return false if path does not exist", async () => {
			// Setup
			const filePath = "/test/not-exists.txt";
			vi.mocked(fs.access).mockRejectedValueOnce(new Error("ENOENT"));

			// Execute
			const result = await fileSystemService.isPathExists(filePath);

			// Verify
			expect(fs.access).toHaveBeenCalledWith(filePath);
			expect(result).toBe(false);
		});
	});

	describe("readFile", () => {
		it("should read a file with default encoding", async () => {
			// Setup
			const filePath = "/test/file.txt";
			const fileContent = "file content";
			vi.mocked(fs.readFile).mockResolvedValueOnce(fileContent);

			// Execute
			const result = await fileSystemService.readFile(filePath);

			// Verify
			expect(fs.readFile).toHaveBeenCalledWith(filePath, { encoding: "utf8" });
			expect(result).toBe(fileContent);
		});

		it("should read a file with specified encoding", async () => {
			// Setup
			const filePath = "/test/file.txt";
			const fileContent = "file content";
			const encoding = "ascii" as BufferEncoding;
			vi.mocked(fs.readFile).mockResolvedValueOnce(fileContent);

			// Execute
			const result = await fileSystemService.readFile(filePath, encoding);

			// Verify
			expect(fs.readFile).toHaveBeenCalledWith(filePath, { encoding });
			expect(result).toBe(fileContent);
		});
	});

	describe("writeFile", () => {
		it("should write a file with default encoding", async () => {
			// Setup
			const filePath = "/test/file.txt";
			const fileContent = "file content";
			const dirPath = "/test";

			vi.mocked(path.dirname).mockReturnValueOnce(dirPath);
			vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
			vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

			// Execute
			await fileSystemService.writeFile(filePath, fileContent);

			// Verify
			expect(path.dirname).toHaveBeenCalledWith(filePath);
			expect(fs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
			expect(fs.writeFile).toHaveBeenCalledWith(filePath, fileContent, { encoding: "utf8" });
		});

		it("should write a file with specified encoding", async () => {
			// Setup
			const filePath = "/test/file.txt";
			const fileContent = "file content";
			const encoding = "ascii" as BufferEncoding;
			const dirPath = "/test";

			vi.mocked(path.dirname).mockReturnValueOnce(dirPath);
			vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined);
			vi.mocked(fs.writeFile).mockResolvedValueOnce(undefined);

			// Execute
			await fileSystemService.writeFile(filePath, fileContent, encoding);

			// Verify
			expect(path.dirname).toHaveBeenCalledWith(filePath);
			expect(fs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
			expect(fs.writeFile).toHaveBeenCalledWith(filePath, fileContent, { encoding });
		});
	});
});
