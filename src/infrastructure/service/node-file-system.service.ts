import type { IFileSystemService } from "../../application/interface/file-system-service.interface";

import fs from "node:fs/promises";
import path from "node:path";

export class NodeFileSystemService implements IFileSystemService {
	async createDirectory(directoryPath: string, options?: { isRecursive: boolean }): Promise<void> {
		directoryPath = path.dirname(directoryPath);
		await fs.mkdir(directoryPath, { recursive: options?.isRecursive });
	}

	async deleteFile(filePath: string): Promise<void> {
		await fs.unlink(filePath);
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

	async isPathExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);

			return true;
		} catch {
			return false;
		}
	}

	async readFile(filePath: string, encoding: BufferEncoding = "utf8"): Promise<string> {
		return await fs.readFile(filePath, { encoding });
	}

	async writeFile(filePath: string, content: string, encoding: BufferEncoding = "utf8"): Promise<void> {
		// eslint-disable-next-line @elsikora-typescript/naming-convention
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, content, { encoding });
	}
}
