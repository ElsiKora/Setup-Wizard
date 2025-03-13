import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PromptsCliInterface } from "../../../../src/infrastructure/service/prompts-cli-interface.service";
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";

// Mock dependencies
vi.mock("prompts");
vi.mock("chalk", () => ({
  default: {
    blue: vi.fn((text) => `BLUE:${text}`),
    bold: vi.fn((text) => `BOLD:${text}`),
    dim: vi.fn((text) => `DIM:${text}`),
    green: vi.fn((text) => `GREEN:${text}`),
    red: vi.fn((text) => `RED:${text}`),
    yellow: vi.fn((text) => `YELLOW:${text}`)
  }
}));
vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  }))
}));

describe("PromptsCliInterface", () => {
  // Console mocks
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalProcessExit = process.exit;
  const originalConsoleClear = console.clear;
  
  // Service instance
  let cliInterface: PromptsCliInterface;
  
  // Mock console functions
  const mockConsoleLog = vi.fn();
  const mockConsoleError = vi.fn();
  const mockConsoleInfo = vi.fn();
  const mockConsoleWarn = vi.fn();
  const mockProcessExit = vi.fn();
  const mockConsoleClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Replace console functions with mocks
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.info = mockConsoleInfo;
    console.warn = mockConsoleWarn;
    console.clear = mockConsoleClear;
    process.exit = mockProcessExit as any;
    
    // Create service instance
    cliInterface = new PromptsCliInterface();
  });

  afterEach(() => {
    // Restore original console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
    console.clear = originalConsoleClear;
    process.exit = originalProcessExit;
  });

  describe("logging methods", () => {
    it("log should output message to console", () => {
      cliInterface.log("Test message");
      expect(mockConsoleLog).toHaveBeenCalledWith("Test message");
    });

    it("info should output blue message to console", () => {
      cliInterface.info("Info message");
      expect(mockConsoleLog).toHaveBeenCalledWith("BLUE:Info message");
      expect(chalk.blue).toHaveBeenCalledWith("Info message");
    });

    it("success should output green message to console", () => {
      cliInterface.success("Success message");
      expect(mockConsoleLog).toHaveBeenCalledWith("GREEN:Success message");
      expect(chalk.green).toHaveBeenCalledWith("Success message");
    });

    it("warn should output yellow message to console", () => {
      cliInterface.warn("Warning message");
      expect(mockConsoleLog).toHaveBeenCalledWith("YELLOW:Warning message");
      expect(chalk.yellow).toHaveBeenCalledWith("Warning message");
    });

    it("error should output red message to console", () => {
      cliInterface.error("Error message");
      expect(mockConsoleError).toHaveBeenCalledWith("RED:Error message");
      expect(chalk.red).toHaveBeenCalledWith("Error message");
    });

    it("handleError should output error message and details", () => {
      const error = new Error("Test error");
      cliInterface.handleError("Error occurred", error);
      expect(mockConsoleError).toHaveBeenCalledWith("RED:Error occurred");
      expect(mockConsoleError).toHaveBeenCalledWith(error);
      expect(chalk.red).toHaveBeenCalledWith("Error occurred");
    });

    it("clear should clear the console", () => {
      cliInterface.clear();
      expect(mockConsoleClear).toHaveBeenCalled();
    });
  });

  describe("spinner methods", () => {
    it("startSpinner should start a spinner with the given message", () => {
      cliInterface.startSpinner("Loading...");
      expect(ora).toHaveBeenCalledWith("Loading...");
    });

    it("stopSpinner without message should stop the spinner", () => {
      cliInterface.stopSpinner();
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("stopSpinner with message should stop the spinner and log the message", () => {
      cliInterface.stopSpinner("Completed!");
      expect(mockConsoleLog).toHaveBeenCalledWith("Completed!");
    });
  });

  describe("note method", () => {
    it("should render a styled note box with title and message", () => {
      cliInterface.note("Title", "Message content");
      expect(mockConsoleLog).toHaveBeenCalledTimes(5); // Box with top, title, separator, content, bottom
    });

    it("should handle multi-line messages", () => {
      cliInterface.note("Title", "Line 1\nLine 2\nLine 3");
      expect(mockConsoleLog).toHaveBeenCalledTimes(7); // Box with top, title, separator, 3 content lines, bottom
    });
  });

  describe("prompt methods", () => {
    it("confirm should return true when user confirms", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: true });
      
      const result = await cliInterface.confirm("Confirm?", false);
      
      expect(result).toBe(true);
      expect(prompts).toHaveBeenCalledWith({
        type: "toggle",
        name: "value",
        message: "Confirm?",
        active: "Yes",
        inactive: "No",
        initial: false
      });
    });

    it("confirm should use default value when provided", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: true });
      
      await cliInterface.confirm("Confirm?", true);
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        initial: true
      }));
    });

    it("confirm should exit process when user cancels", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: undefined });
      
      await cliInterface.confirm("Confirm?");
      
      expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it("confirm should handle exceptions", async () => {
      vi.mocked(prompts).mockRejectedValueOnce(new Error("Prompt error"));
      
      await cliInterface.confirm("Confirm?");
      
      expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it("text should return user input", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: "User input" });
      
      const result = await cliInterface.text("Enter text:");
      
      expect(result).toBe("User input");
      expect(prompts).toHaveBeenCalledWith({
        type: "text",
        name: "value",
        message: "Enter text:",
        initial: undefined,
        validate: undefined
      });
    });

    it("text should use initial value when provided", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: "User input" });
      
      await cliInterface.text("Enter text:", undefined, "Initial value");
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        initial: "Initial value"
      }));
    });

    it("text should use validation function when provided", async () => {
      const validate = vi.fn((value) => value ? undefined : "Value is required");
      vi.mocked(prompts).mockResolvedValueOnce({ value: "Valid input" });
      
      await cliInterface.text("Enter text:", undefined, undefined, validate);
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        validate: expect.any(Function)
      }));
    });

    it("text should exit process when user cancels", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: undefined });
      
      await cliInterface.text("Enter text:");
      
      expect(mockConsoleError).toHaveBeenCalledWith("RED:Operation cancelled by user");
      expect(mockProcessExit).toHaveBeenCalledWith(0);
    });

    it("select should return user selection", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: "option1" });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
      ];
      
      const result = await cliInterface.select("Select option:", options);
      
      expect(result).toBe("option1");
      expect(prompts).toHaveBeenCalledWith({
        type: "select",
        name: "value",
        message: "Select option:",
        choices: [
          { title: "Option 1", value: "option1" },
          { title: "Option 2", value: "option2" }
        ],
        initial: undefined
      });
    });

    it("select should use initial value when provided", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: "option2" });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
      ];
      
      await cliInterface.select("Select option:", options, "option2");
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        initial: 1
      }));
    });

    it("select should use initial index 0 when initial value not found", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ value: "option1" });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
      ];
      
      await cliInterface.select("Select option:", options, "unknown");
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        initial: 0
      }));
    });

    it("multiselect should return user selections", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ values: ["option1", "option3"] });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
        { label: "Option 3", value: "option3" }
      ];
      
      const result = await cliInterface.multiselect("Select options:", options);
      
      expect(result).toEqual(["option1", "option3"]);
      expect(prompts).toHaveBeenCalledWith({
        type: "multiselect",
        name: "values",
        message: "Select options: (space to select)",
        choices: [
          { title: "Option 1", value: "option1", selected: false },
          { title: "Option 2", value: "option2", selected: false },
          { title: "Option 3", value: "option3", selected: false }
        ],
        min: undefined,
        instructions: false
      });
    });

    it("multiselect should use initial values when provided", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ values: ["option1", "option3"] });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
        { label: "Option 3", value: "option3" }
      ];
      
      await cliInterface.multiselect("Select options:", options, false, ["option1", "option3"]);
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        choices: [
          { title: "Option 1", value: "option1", selected: true },
          { title: "Option 2", value: "option2", selected: false },
          { title: "Option 3", value: "option3", selected: true }
        ]
      }));
    });

    it("multiselect should set min requirements when required is true", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ values: ["option1"] });
      
      const options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
      ];
      
      await cliInterface.multiselect("Select options:", options, true);
      
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        min: 1
      }));
    });

    it("groupMultiselect should return user selections from groups", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ values: ["group1-option1", "group2-option2"] });
      
      const groupOptions = {
        "Group 1": [
          { label: "Option 1", value: "group1-option1" },
          { label: "Option 2", value: "group1-option2" }
        ],
        "Group 2": [
          { label: "Option 1", value: "group2-option1" },
          { label: "Option 2", value: "group2-option2" }
        ]
      };
      
      const result = await cliInterface.groupMultiselect("Select options:", groupOptions);
      
      expect(result).toEqual(["group1-option1", "group2-option2"]);
      expect(prompts).toHaveBeenCalledWith(expect.objectContaining({
        type: "multiselect",
        name: "values",
        message: "Select options: (space to select)",
        min: undefined,
        instructions: false
      }));
    });

    it("groupMultiselect should use initial values when provided", async () => {
      vi.mocked(prompts).mockResolvedValueOnce({ values: ["group1-option1", "group2-option2"] });
      
      const groupOptions = {
        "Group 1": [
          { label: "Option 1", value: "group1-option1" },
          { label: "Option 2", value: "group1-option2" }
        ],
        "Group 2": [
          { label: "Option 1", value: "group2-option1" },
          { label: "Option 2", value: "group2-option2" }
        ]
      };
      
      await cliInterface.groupMultiselect(
        "Select options:", 
        groupOptions, 
        false, 
        ["group1-option1", "group2-option2"]
      );
      
      // Verify that the expected options are marked as selected
      const promptsCall = vi.mocked(prompts).mock.calls[0][0];
      expect(promptsCall).toHaveProperty("choices");
      
      // Find the selected choices and verify they match our initialValues
      const selectedChoices = (promptsCall as any).choices.filter((c: any) => c.selected);
      expect(selectedChoices).toHaveLength(2);
      expect(selectedChoices.map((c: any) => c.value)).toEqual(["group1-option1", "group2-option2"]);
    });
  });
});