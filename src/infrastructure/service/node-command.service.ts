import type { ICommandService } from "../../application/interface/command-service.interface";

import { exec } from "node:child_process";
import { promisify } from "node:util";

export class NodeCommandService implements ICommandService {
	private readonly EXEC_ASYNC: (argument1: string) => Promise<{ stderr: string; stdout: string }> = promisify(exec);

	async execute(command: string): Promise<void> {
		await this.EXEC_ASYNC(command);
	}
}
