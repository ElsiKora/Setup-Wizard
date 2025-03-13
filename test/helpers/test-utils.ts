import { vi } from 'vitest';
import type { FileSystemService } from '../../src/application/interface/file-system-service.interface';
import type { CLIInterfaceService } from '../../src/application/interface/cli-interface-service.interface';
import type { CommandService } from '../../src/application/interface/command-service.interface';
import type { ConfigService } from '../../src/application/interface/config-service.interface';

/**
 * Creates a mock FileSystemService instance
 * @returns A mock FileSystemService with all methods mocked with vi.fn()
 */
export function createMockFileSystemService(): FileSystemService {
  return {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    createDirectory: vi.fn(),
    deleteFile: vi.fn(),
    getDirectoryNameFromFilePath: vi.fn(),
    getExtensionFromFilePath: vi.fn(),
    isOneOfPathsExists: vi.fn(),
    isPathExists: vi.fn(),
  };
}

/**
 * Creates a mock CLIInterfaceService instance
 * @returns A mock CLIInterfaceService with all methods mocked with vi.fn()
 */
export function createMockCLIInterfaceService(): CLIInterfaceService {
  return {
    clear: vi.fn(),
    confirm: vi.fn(),
    error: vi.fn(),
    groupMultiselect: vi.fn(),
    handleError: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    multiselect: vi.fn(),
    note: vi.fn(),
    select: vi.fn(),
    startSpinner: vi.fn(),
    stopSpinner: vi.fn(),
    success: vi.fn(),
    text: vi.fn(),
    warn: vi.fn(),
  };
}

/**
 * Creates a mock CommandService instance
 * @returns A mock CommandService with all methods mocked with vi.fn()
 */
export function createMockCommandService(): CommandService {
  return {
    executeCommand: vi.fn(),
    createCommand: vi.fn(),
  };
}

/**
 * Creates a mock ConfigService instance
 * @returns A mock ConfigService with all methods mocked with vi.fn()
 */
export function createMockConfigService(): ConfigService {
  return {
    exists: vi.fn(),
    FILE_SYSTEM_SERVICE: createMockFileSystemService(),
    get: vi.fn(),
    getModuleConfig: vi.fn(),
    getProperty: vi.fn(),
    isModuleEnabled: vi.fn(),
    merge: vi.fn(),
    set: vi.fn(),
    setProperty: vi.fn(),
    load: vi.fn(),
    search: vi.fn(),
  };
}

/**
 * Helper function to create a temporary test environment
 * @param setupFn Function to run for setting up the test environment
 * @returns Cleanup function to be called after the test
 */
export function createTestEnvironment(setupFn: () => void): () => void {
  setupFn();
  
  return () => {
    // Cleanup logic
    vi.clearAllMocks();
  };
}