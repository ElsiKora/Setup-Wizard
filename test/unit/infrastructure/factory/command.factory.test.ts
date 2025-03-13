import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandFactory } from '../../../../src/infrastructure/factory/command.factory';
import { ECommand } from '../../../../src/infrastructure/enum/command.enum';
import { AnalyzeCommand } from '../../../../src/infrastructure/command/analyze.command';
import { InitCommand } from '../../../../src/infrastructure/command/init.command';

describe('CommandFactory', () => {
  // Mocks
  const mockCliInterfaceService = {
    confirm: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  };
  
  const mockFileSystemService = {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    isPathExists: vi.fn()
  };
  
  // Command options
  const mockOptions = { configPath: '/test/path' };
  
  // Factory instance
  let commandFactory: CommandFactory;
  
  // Command spy mocks
  vi.mock('../../../../src/infrastructure/command/analyze.command');
  vi.mock('../../../../src/infrastructure/command/init.command');

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset constructor mocks
    (AnalyzeCommand as any).mockClear();
    (InitCommand as any).mockClear();
    
    // Create factory instance with mocks
    commandFactory = new CommandFactory(
      mockCliInterfaceService as any,
      mockFileSystemService as any
    );
  });

  describe('createCommand', () => {
    it('should create an AnalyzeCommand when ANALYZE command type is provided', () => {
      const command = commandFactory.createCommand(ECommand.ANALYZE, mockOptions);
      
      expect(AnalyzeCommand).toHaveBeenCalledWith(
        mockOptions,
        mockCliInterfaceService,
        mockFileSystemService
      );
    });
    
    it('should create an InitCommand when INIT command type is provided', () => {
      const command = commandFactory.createCommand(ECommand.INIT, mockOptions);
      
      expect(InitCommand).toHaveBeenCalledWith(
        mockOptions,
        mockCliInterfaceService,
        mockFileSystemService
      );
    });
    
    it('should throw an error for unknown command types', () => {
      // Use a non-existent command type
      const invalidCommand = 'INVALID' as unknown as ECommand;
      
      expect(() => commandFactory.createCommand(invalidCommand, mockOptions))
        .toThrow('Unknown command');
    });
  });
});
