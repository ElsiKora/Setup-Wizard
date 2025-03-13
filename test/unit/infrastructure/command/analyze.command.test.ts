import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeCommand } from '../../../../src/infrastructure/command/analyze.command';
import type { ICliInterfaceService } from '../../../../src/application/interface/cli-interface-service.interface';
import type { IFileSystemService } from '../../../../src/application/interface/file-system-service.interface';
import type { TInitCommandProperties } from '../../../../src/infrastructure/type/init-command-properties.type';

describe('AnalyzeCommand', () => {
  let analyzeCommand: AnalyzeCommand;
  let cliInterfaceServiceMock: ICliInterfaceService;
  let fileSystemServiceMock: IFileSystemService;
  let propertiesMock: TInitCommandProperties;

  beforeEach(() => {
    // Mock CLI interface service
    cliInterfaceServiceMock = {
      clear: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
      intro: vi.fn(),
      multiselect: vi.fn(),
      outro: vi.fn(),
      select: vi.fn(),
      spinner: vi.fn().mockReturnValue({
        start: vi.fn(),
        stop: vi.fn(),
      }),
      text: vi.fn(),
    };

    // Mock file system service
    fileSystemServiceMock = {
      absolutePath: vi.fn(),
      createFile: vi.fn(),
      createFolder: vi.fn(),
      exists: vi.fn(),
      readFile: vi.fn(),
    };

    // Mock command properties
    propertiesMock = {
      name: 'analyze',
      description: 'Analyze the project',
      options: [],
    };

    // Create instance of AnalyzeCommand
    analyzeCommand = new AnalyzeCommand(
      propertiesMock,
      cliInterfaceServiceMock,
      fileSystemServiceMock
    );
  });

  it('should be initialized with the correct properties', () => {
    expect(analyzeCommand.PROPERTIES).toBe(propertiesMock);
    expect(analyzeCommand.CLI_INTERFACE_SERVICE).toBe(cliInterfaceServiceMock);
    expect(analyzeCommand.FILE_SYSTEM_SERVICE).toBe(fileSystemServiceMock);
  });

  it('should clear the console and confirm analysis when executed', async () => {
    // Execute the command
    await analyzeCommand.execute();

    // Verify the console was cleared
    expect(cliInterfaceServiceMock.clear).toHaveBeenCalled();
    
    // Verify confirmation was requested
    expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
      'Do you want to analyze the project?'
    );
  });

  it('should handle user confirmation properly', async () => {
    // Mock user confirmation to true
    (cliInterfaceServiceMock.confirm as any).mockResolvedValue(true);

    // Execute the command
    await analyzeCommand.execute();

    // Verify confirmation was requested
    expect(cliInterfaceServiceMock.confirm).toHaveBeenCalled();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock user confirmation to false
    (cliInterfaceServiceMock.confirm as any).mockResolvedValue(false);
    
    // Execute the command again
    await analyzeCommand.execute();
    
    // Verify confirmation was requested again
    expect(cliInterfaceServiceMock.confirm).toHaveBeenCalled();
  });
});