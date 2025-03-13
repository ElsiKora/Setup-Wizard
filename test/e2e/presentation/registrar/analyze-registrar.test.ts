import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { createTestDirectory, createTypeScriptPackageJson } from '../../helpers/e2e-utils';
import { AnalyzeCommandRegistrar } from 'bin/presentation/registrar/analyze.registrar.js';
import { ECommand } from 'bin/infrastructure/enum/command.enum.js';

describe('AnalyzeCommandRegistrar E2E test', () => {
  const testUtils = {
    testDir: '',
    runCommand: async () => ({ stdout: '', stderr: '', success: false }),
    fileExists: async () => false,
    readFile: async () => '',
    createPackageJson: async () => {},
    cleanup: async () => {},
  };

  // Mock Commander program
  const mockProgram = {
    command: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis()
  };

  // Mock command factory
  const mockCommandFactory = {
    createCommand: vi.fn().mockReturnValue({
      execute: vi.fn().mockResolvedValue(undefined)
    })
  };

  let analyzeRegistrar;

  beforeAll(async () => {
    // Create a temporary test directory and get utility functions
    const utils = await createTestDirectory('analyze-registrar');
    Object.assign(testUtils, utils);
    
    // Create a TypeScript package.json for testing
    await testUtils.createPackageJson(createTypeScriptPackageJson());
    
    // Initialize the registrar
    analyzeRegistrar = new AnalyzeCommandRegistrar(mockProgram, mockCommandFactory);
  });

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  it('should register the analyze command correctly', () => {
    // Execute the registrar
    const result = analyzeRegistrar.execute();
    
    // Verify command was registered with correct name
    expect(mockProgram.command).toHaveBeenCalledWith(ECommand.ANALYZE);
    
    // Verify description was set
    expect(mockProgram.description).toHaveBeenCalled();
    expect(mockProgram.description.mock.calls[0][0]).toContain('Analyze project');
    
    // Verify options were set
    expect(mockProgram.option).toHaveBeenCalledTimes(2);
    expect(mockProgram.option).toHaveBeenCalledWith('-e, --hasEslint', expect.any(String));
    expect(mockProgram.option).toHaveBeenCalledWith('-p, --hasPrettier', expect.any(String));
    
    // Verify action was set
    expect(mockProgram.action).toHaveBeenCalledWith(expect.any(Function));
    
    // Verify the result is the configured program
    expect(result).toBe(mockProgram);
  });

  it('should create and execute the analyze command when action is triggered', async () => {
    // Execute the registrar to register the action
    analyzeRegistrar.execute();
    
    // Get the action function
    const actionFn = mockProgram.action.mock.calls[0][0];
    
    // Mock options
    const mockOptions = { hasEslint: true, hasPrettier: false };
    
    // Execute the action function
    await actionFn(mockOptions);
    
    // Verify command factory was called with correct arguments
    expect(mockCommandFactory.createCommand).toHaveBeenCalledWith(ECommand.ANALYZE, mockOptions);
    
    // Verify command execute was called
    const mockCommand = mockCommandFactory.createCommand.mock.results[0].value;
    expect(mockCommand.execute).toHaveBeenCalled();
  });
});