import { exec } from 'child_process';
import { promisify } from 'util';
import {ICommandService} from "../../application/interface/command-service.interface";

export class NodeCommandService implements ICommandService {
    private execAsync = promisify(exec);

    async execute(command: string): Promise<void> {
        try {
            await this.execAsync(command);
        } catch (error) {
            throw error;
        }
    }
}
