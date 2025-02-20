import fs from 'fs/promises';
import path from "node:path";
import {IFileSystemService} from "../../application/interface/file-system-service.interface";

export class NodeFileSystemService implements IFileSystemService {
    async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        return await fs.readFile(filePath, { encoding });
    }

    async writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, { encoding });
    }

    async deleteFile(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }

    async isPathExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    async isOneOfPathsExists(paths: Array<string>): Promise<string | undefined> {
        let existingFilePath: string | undefined = undefined;

        for (const path of paths) {
            if (await this.isPathExists(path)) {
                existingFilePath = path;
                break;
            }
        }

        return existingFilePath;
    }

   async createDirectory(directoryPath: string, options?: { recursive: boolean }): Promise<void> {
       directoryPath = path.dirname(directoryPath)
      await fs.mkdir(directoryPath, options);
    }
}
