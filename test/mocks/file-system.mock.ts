import { vi } from "vitest";
import type { IFileSystemService } from "../../src/application/interface/file-system-service.interface";

/**
 * In-memory file system implementation for testing
 */
export class MockFileSystem implements IFileSystemService {
	private files: Map<string, string> = new Map();
	private directories: Set<string> = new Set();

	constructor() {
		// Initialize with root directory
		this.directories.add("/");
	}

	// Spy methods to track calls
	public writeFileSpy = vi.fn().mockImplementation((path: string, content: string) => this.writeFile(path, content));
	public readFileSpy = vi.fn().mockImplementation((path: string) => this.readFile(path));
	public fileExistsSpy = vi.fn().mockImplementation((path: string) => this.fileExists(path));
	public createDirectorySpy = vi.fn().mockImplementation((path: string) => this.createDirectory(path));
	public pathExistsSpy = vi.fn().mockImplementation((path: string) => this.pathExists(path));
	public isDirectorySpy = vi.fn().mockImplementation((path: string) => this.isDirectory(path));
	public isFileSpy = vi.fn().mockImplementation((path: string) => this.isFile(path));
	public readDirectorySpy = vi.fn().mockImplementation((path: string) => this.readDirectory(path));
	public removeFileSpy = vi.fn().mockImplementation((path: string) => this.removeFile(path));
	public removeDirectorySpy = vi.fn().mockImplementation((path: string) => this.removeDirectory(path));
	public copyFileSpy = vi.fn().mockImplementation((source: string, destination: string) => this.copyFile(source, destination));

	// File system methods
	async writeFile(path: string, content: string): Promise<void> {
		this.ensureDirectoryExists(this.getParentPath(path));
		this.files.set(path, content);
	}

	async readFile(path: string): Promise<string> {
		if (!this.fileExists(path)) {
			throw new Error(`File not found: ${path}`);
		}
		return this.files.get(path) || "";
	}

	fileExists(path: string): boolean {
		return this.files.has(path);
	}

	async createDirectory(path: string): Promise<void> {
		// Create parent directories if needed
		const parentPath = this.getParentPath(path);
		if (parentPath !== path && !this.isDirectory(parentPath)) {
			await this.createDirectory(parentPath);
		}
		this.directories.add(path);
	}

	pathExists(path: string): boolean {
		return this.isDirectory(path) || this.fileExists(path);
	}

	isDirectory(path: string): boolean {
		return this.directories.has(path);
	}

	isFile(path: string): boolean {
		return this.fileExists(path);
	}

	async readDirectory(path: string): Promise<string[]> {
		if (!this.isDirectory(path)) {
			throw new Error(`Directory not found: ${path}`);
		}

		const result: string[] = [];

		// Find all files in the directory
		for (const filePath of this.files.keys()) {
			if (filePath.startsWith(path === "/" ? path : `${path}/`)) {
				const relativePath = filePath.slice(path.length + (path === "/" ? 0 : 1));
				if (!relativePath.includes("/")) {
					result.push(relativePath);
				}
			}
		}

		// Find all subdirectories
		for (const dirPath of this.directories) {
			if (dirPath !== path && dirPath.startsWith(path === "/" ? path : `${path}/`)) {
				const relativePath = dirPath.slice(path.length + (path === "/" ? 0 : 1));
				if (!relativePath.includes("/")) {
					result.push(relativePath);
				}
			}
		}

		return result;
	}

	async removeFile(path: string): Promise<void> {
		if (!this.fileExists(path)) {
			throw new Error(`File not found: ${path}`);
		}
		this.files.delete(path);
	}

	async removeDirectory(path: string): Promise<void> {
		if (!this.isDirectory(path)) {
			throw new Error(`Directory not found: ${path}`);
		}

		// Remove all files in the directory
		for (const filePath of [...this.files.keys()]) {
			if (filePath.startsWith(path === "/" ? path : `${path}/`)) {
				this.files.delete(filePath);
			}
		}

		// Remove all subdirectories
		for (const dirPath of [...this.directories]) {
			if (dirPath !== path && dirPath.startsWith(path === "/" ? path : `${path}/`)) {
				this.directories.delete(dirPath);
			}
		}

		// Remove the directory itself
		this.directories.delete(path);
	}

	async copyFile(source: string, destination: string): Promise<void> {
		if (!this.fileExists(source)) {
			throw new Error(`Source file not found: ${source}`);
		}

		this.ensureDirectoryExists(this.getParentPath(destination));
		this.files.set(destination, this.files.get(source) || "");
	}

	// Helper methods
	private getParentPath(path: string): string {
		const lastSlashIndex = path.lastIndexOf("/");
		if (lastSlashIndex <= 0) {
			return "/";
		}
		return path.substring(0, lastSlashIndex);
	}

	private ensureDirectoryExists(path: string): void {
		if (!this.isDirectory(path)) {
			this.createDirectory(path);
		}
	}

	// Mock utility methods
	reset(): void {
		this.files.clear();
		this.directories.clear();
		this.directories.add("/");
		vi.clearAllMocks();
	}

	addMockFile(path: string, content: string): void {
		this.ensureDirectoryExists(this.getParentPath(path));
		this.files.set(path, content);
	}

	addMockDirectory(path: string): void {
		this.ensureDirectoryExists(path);
	}

	getAllFiles(): Record<string, string> {
		const result: Record<string, string> = {};
		this.files.forEach((content, path) => {
			result[path] = content;
		});
		return result;
	}

	getAllDirectories(): string[] {
		return Array.from(this.directories);
	}
}
