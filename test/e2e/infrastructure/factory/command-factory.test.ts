import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { createTestDirectory, createTypeScriptPackageJson } from '../../helpers/e2e-utils';
import { CommandFactory } from 'bin/infrastructure/factory/command.factory.js';
import { ECommand } from 'bin/infrastructure/enum/command.enum.js';
import { AnalyzeCommand } from 'bin/infrastructure/command/analyze.command.js';
import { InitCommand } from 'bin/infrastructure/command/init.command.js';

describe('Command Factory E2E test', () => {
  const testUtils = {
    testDir: '',
    runCommand: async () => ({ stdout: '', stderr: '', success: false }),
    fileExists: async () => false,
    readFile: async () => '',
    createPackageJson: async () => {},
    cleanup: async () => {},
  };

  // Mock CLI interface service and file system service
  const mockCliInterfaceService = {
    intro: vi.fn(),
    outro: vi.fn(),
    text: vi.fn(),
    confirm: vi.fn(),
    select: vi.fn(),
    multiselect: vi.fn(),
    spinner: vi.fn(),
    isCancel: vi.fn(),
    clear: vi.fn(),
  };

  const mockFileSystemService = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    exists: vi.fn(),
    createDirectory: vi.fn(),
  };

  let commandFactory;

  beforeAll(async () => {
    // Create a temporary test directory and get utility functions
    const utils = await createTestDirectory('command-factory');
    Object.assign(testUtils, utils);
    
    // Create a TypeScript package.json for testing
    await testUtils.createPackageJson(createTypeScriptPackageJson());

    // Initialize command factory with mock services
    commandFactory = new CommandFactory(mockCliInterfaceService, mockFileSystemService);
  });

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  it('should create analyze command', async () => {
    // Create options object
    const options = { someOption: 'value' };
    
    // Create command
    const command = commandFactory.createCommand(ECommand.ANALYZE, options);
    
    // Verify command is instance of AnalyzeCommand
    expect(command).toBeInstanceOf(AnalyzeCommand);
    
    // Verify command has properties from factory
    expect(command.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
    expect(command.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
    
    // The properties are stored in the PROPERTIES field
    expect(command.PROPERTIES).toEqual(options);
  });

  it('should create init command', async () => {
    // Create options object
    const options = { withEslint: true, withPrettier: true };
    
    // Create command
    const command = commandFactory.createCommand(ECommand.INIT, options);
    
    // Verify command is instance of InitCommand
    expect(command).toBeInstanceOf(InitCommand);
    
    // Verify command has properties from factory
    expect(command.CLI_INTERFACE_SERVICE).toBe(mockCliInterfaceService);
    expect(command.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
    
    // The properties are stored in the PROPERTIES field
    expect(command.PROPERTIES).toEqual(options);
  });

  it('should throw error for unknown command', async () => {
    // Try to create an unknown command
    expect(() => {
      commandFactory.createCommand('unknown-command', {});
    }).toThrow('Unknown command: unknown-command');
  });
});