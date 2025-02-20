export interface IFileSystemService {
    isPathExists(path: string): Promise<boolean>;
    isOneOfPathsExists(paths: Array<string>): Promise<string | undefined>;
    readFile(path: string, encoding?: BufferEncoding): Promise<string>;
    writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
    createDirectory(path: string, options?: { recursive: boolean }): Promise<void>;
    deleteFile(path: string): Promise<void>;
}
