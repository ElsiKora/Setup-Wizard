export interface IFileSystemService {
	createDirectory(path: string, options?: { isRecursive: boolean }): Promise<void>;
	deleteFile(path: string): Promise<void>;
	isOneOfPathsExists(paths: Array<string>): Promise<string | undefined>;
	isPathExists(path: string): Promise<boolean>;
	readFile(path: string, encoding?: BufferEncoding): Promise<string>;
	writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
}
