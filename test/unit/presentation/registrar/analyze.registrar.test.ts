import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyzeCommandRegistrar } from "../../../../src/presentation/registrar/analyze.registrar";
import { ECommand } from "../../../../src/infrastructure/enum/command.enum";

describe("AnalyzeCommandRegistrar", () => {
  // Mocks
  const mockCommandAction = vi.fn();
  const mockCommandDescription = vi.fn(() => mockCommand);
  const mockCommandOption = vi.fn(() => mockCommand);
  const mockCommand = {
    description: mockCommandDescription,
    option: mockCommandOption,
    action: vi.fn(() => mockCommandAction)
  };
  
  const mockProgram = {
    command: vi.fn(() => mockCommand)
  };
  
  const mockExecute = vi.fn();
  const mockCommandFactory = {
    createCommand: vi.fn(() => ({
      execute: mockExecute
    }))
  };
  
  // Registrar instance
  let registrar: AnalyzeCommandRegistrar;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create registrar instance
    registrar = new AnalyzeCommandRegistrar(mockProgram as any, mockCommandFactory as any);
  });
  
  describe("constructor", () => {
    it("should initialize with the correct properties", () => {
      expect(registrar.PROGRAM).toBe(mockProgram);
      expect(registrar.COMMAND_FACTORY).toBe(mockCommandFactory);
    });
  });
  
  describe("execute", () => {
    it("should register the analyze command with the program", () => {
      registrar.execute();
      
      expect(mockProgram.command).toHaveBeenCalledWith(ECommand.ANALYZE);
      expect(mockCommandDescription).toHaveBeenCalledWith(expect.stringContaining("Analyze project structure"));
    });
    
    it("should add the required options to the command", () => {
      registrar.execute();
      
      expect(mockCommandOption).toHaveBeenCalledWith("-e, --hasEslint", "Checks for ESLint configuration");
      expect(mockCommandOption).toHaveBeenCalledWith("-p, --hasPrettier", "Checks for Prettier configuration");
    });
    
    it("should set up the command action handler", () => {
      registrar.execute();
      
      expect(mockCommand.action).toHaveBeenCalled();
      
      // Get the action handler function
      const actionHandler = mockCommand.action.mock.calls[0][0];
      
      // Call the action handler
      const options = { hasEslint: true };
      actionHandler(options);
      
      expect(mockCommandFactory.createCommand).toHaveBeenCalledWith(ECommand.ANALYZE, options);
      expect(mockExecute).toHaveBeenCalled();
    });
    
    it("should return the configured command", () => {
      const result = registrar.execute();
      
      expect(result).toBe(mockCommandAction);
    });
  });
});