import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Helper function to create a temporary test directory
 * @param testName Name of the test (used to create a unique directory)
 * @returns Object with helper functions and the test directory path
 */
export async function createTestDirectory(testName: string) {
  const testDir = path.resolve(process.cwd(), 'tests', 'e2e', 'tmp', testName);
  
  // Create temporary test directory
  await fs.mkdir(testDir, { recursive: true });
  
  // Helper to run setup-wizard commands in the test directory
  const runCommand = async (args: string) => {
    try {
      const cliPath = path.resolve(process.cwd(), 'bin', 'index.js');
      const { stdout, stderr } = await execAsync(`node ${cliPath} ${args}`, {
        cwd: testDir,
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
      });
      
      return { stdout, stderr, success: true };
    } catch (error) {
      return {
        stdout: error.stdout,
        stderr: error.stderr,
        success: false,
        error,
      };
    }
  };
  
  // Helper to check if a file exists in the test directory
  const fileExists = async (filePath: string) => {
    try {
      await fs.access(path.join(testDir, filePath));
      return true;
    } catch {
      return false;
    }
  };
  
  // Helper to read a file from the test directory
  const readFile = async (filePath: string) => {
    return await fs.readFile(path.join(testDir, filePath), 'utf8');
  };
  
  // Helper to create a package.json file with specified contents
  const createPackageJson = async (content: Record<string, any>) => {
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(content, null, 2),
      'utf8'
    );
  };
  
  // Cleanup function to remove the test directory
  const cleanup = async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  };
  
  return {
    testDir,
    runCommand,
    fileExists,
    readFile,
    createPackageJson,
    cleanup,
  };
}

/**
 * Create a basic package.json for testing
 * @returns A basic package.json object
 */
export function createBasicPackageJson() {
  return {
    name: 'test-project',
    version: '1.0.0',
    description: 'Test project for E2E tests',
    main: 'index.js',
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: [],
    author: '',
    license: 'MIT',
    dependencies: {},
    devDependencies: {},
  };
}

/**
 * Create a package.json with TypeScript configuration
 * @returns A package.json object with TypeScript configuration
 */
export function createTypeScriptPackageJson() {
  return {
    ...createBasicPackageJson(),
    devDependencies: {
      typescript: '^5.0.0',
    },
  };
}

/**
 * Create a package.json with React configuration
 * @returns A package.json object with React configuration
 */
export function createReactPackageJson() {
  return {
    ...createBasicPackageJson(),
    dependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
  };
}