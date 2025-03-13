import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NodeFileSystemService } from 'bin/infrastructure/service/node-file-system.service.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('NodeFileSystemService E2E test', () => {
  let fileSystemService: NodeFileSystemService;
  const testDir = path.join(process.cwd(), 'test-fs-temp');
  const testFilePath = path.join(testDir, 'test-file.txt');
  const testContent = 'Hello, world!';
  
  beforeEach(async () => {
    fileSystemService = new NodeFileSystemService();
    
    // Create test directory
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });
  
  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });
  
  describe('createDirectory', () => {
    it('should create a directory', async () => {
      const nestedDir = path.join(testDir, 'nested/dir');
      
      await fileSystemService.createDirectory(nestedDir, { isRecursive: true });
      
      // Check if directory exists
      const exists = await fileSystemService.isPathExists(path.dirname(nestedDir));
      expect(exists).toBe(true);
    });
  });
  
  describe('writeFile and readFile', () => {
    it('should write and read a file', async () => {
      // Write file
      await fileSystemService.writeFile(testFilePath, testContent);
      
      // Check if file exists
      const exists = await fileSystemService.isPathExists(testFilePath);
      expect(exists).toBe(true);
      
      // Read file
      const content = await fileSystemService.readFile(testFilePath);
      expect(content).toBe(testContent);
    });
    
    it('should create parent directories when writing a file', async () => {
      const nestedFilePath = path.join(testDir, 'nested/deep/file.txt');
      
      // Write file with nested directories
      await fileSystemService.writeFile(nestedFilePath, testContent);
      
      // Check if file exists
      const exists = await fileSystemService.isPathExists(nestedFilePath);
      expect(exists).toBe(true);
      
      // Check if directory was created
      const dirExists = await fileSystemService.isPathExists(path.dirname(nestedFilePath));
      expect(dirExists).toBe(true);
    });
  });
  
  describe('deleteFile', () => {
    it('should delete a file', async () => {
      // Create a file first
      await fileSystemService.writeFile(testFilePath, testContent);
      
      // Verify file exists
      let exists = await fileSystemService.isPathExists(testFilePath);
      expect(exists).toBe(true);
      
      // Delete the file
      await fileSystemService.deleteFile(testFilePath);
      
      // Verify file no longer exists
      exists = await fileSystemService.isPathExists(testFilePath);
      expect(exists).toBe(false);
    });
  });
  
  describe('isPathExists', () => {
    it('should return true if path exists', async () => {
      // Create a file
      await fileSystemService.writeFile(testFilePath, testContent);
      
      // Check if path exists
      const exists = await fileSystemService.isPathExists(testFilePath);
      expect(exists).toBe(true);
    });
    
    it('should return false if path does not exist', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent.txt');
      
      // Check if path exists
      const exists = await fileSystemService.isPathExists(nonExistentPath);
      expect(exists).toBe(false);
    });
  });
  
  describe('isOneOfPathsExists', () => {
    it('should return the first existing path', async () => {
      // Create a file
      await fileSystemService.writeFile(testFilePath, testContent);
      
      const nonExistentPath = path.join(testDir, 'non-existent.txt');
      const paths = [nonExistentPath, testFilePath];
      
      // Check which path exists
      const existingPath = await fileSystemService.isOneOfPathsExists(paths);
      expect(existingPath).toBe(testFilePath);
    });
    
    it('should return undefined if none of the paths exist', async () => {
      const nonExistentPath1 = path.join(testDir, 'non-existent1.txt');
      const nonExistentPath2 = path.join(testDir, 'non-existent2.txt');
      const paths = [nonExistentPath1, nonExistentPath2];
      
      // Check which path exists
      const existingPath = await fileSystemService.isOneOfPathsExists(paths);
      expect(existingPath).toBeUndefined();
    });
  });
  
  describe('getDirectoryNameFromFilePath', () => {
    it('should return the directory name from a file path', () => {
      const filePath = '/path/to/file.txt';
      const dirName = fileSystemService.getDirectoryNameFromFilePath(filePath);
      expect(dirName).toBe('/path/to');
    });
  });
  
  describe('getExtensionFromFilePath', () => {
    it('should return the extension from a file path', () => {
      const filePath = '/path/to/file.txt';
      const extension = fileSystemService.getExtensionFromFilePath(filePath);
      expect(extension).toBe('.txt');
    });
    
    it('should return an empty string if the file has no extension', () => {
      const filePath = '/path/to/file';
      const extension = fileSystemService.getExtensionFromFilePath(filePath);
      expect(extension).toBe('');
    });
  });
});