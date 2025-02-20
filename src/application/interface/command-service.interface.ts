export interface ICommandService {
    execute(command: string): Promise<void>;
}
