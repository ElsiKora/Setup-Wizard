import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { createTestDirectory, createTypeScriptPackageJson } from '../../helpers/e2e-utils';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CliInterfaceServiceMapper } from '../../../../bin/application/mapper/cli-interface-service.mapper.js';

describe('CLI Interface Service Mapper E2E test', () => {
  const testUtils = {
    testDir: '',
    runCommand: async () => ({ stdout: '', stderr: '', success: false }),
    fileExists: async () => false,
    readFile: async () => '',
    createPackageJson: async () => {},
    cleanup: async () => {},
  };

  beforeAll(async () => {
    // Create a temporary test directory and get utility functions
    const utils = await createTestDirectory('cli-interface-service-mapper');
    Object.assign(testUtils, utils);
    
    // Create a TypeScript package.json for testing
    await testUtils.createPackageJson(createTypeScriptPackageJson());
  });

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  it('should convert license configs to select options', async () => {
    // Sample license configuration data
    const licenseConfigs = {
      'MIT': {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
        content: 'MIT License content'
      },
      'APACHE-2.0': {
        name: 'Apache License 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
        content: 'Apache License content'
      },
      'GPL-3.0': {
        name: 'GNU General Public License v3.0',
        url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
        content: 'GPL License content'
      }
    };
    
    // Convert to select options
    const selectOptions = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(licenseConfigs);
    
    // Verify the correct structure of the result
    expect(selectOptions).toBeInstanceOf(Array);
    expect(selectOptions.length).toBe(3);
    
    // Verify each option has the correct structure
    selectOptions.forEach(option => {
      expect(option).toHaveProperty('label');
      expect(option).toHaveProperty('value');
    });
    
    // Verify the first option is MIT
    expect(selectOptions[0].label).toBe('MIT License (MIT)');
    expect(selectOptions[0].value).toBe('MIT');
    
    // Verify the second option is Apache 2.0
    expect(selectOptions[1].label).toBe('Apache License 2.0 (APACHE-2.0)');
    expect(selectOptions[1].value).toBe('APACHE-2.0');
    
    // Verify the third option is GPL 3.0
    expect(selectOptions[2].label).toBe('GNU General Public License v3.0 (GPL-3.0)');
    expect(selectOptions[2].value).toBe('GPL-3.0');
  });

  it('should handle empty license configs', async () => {
    // Test with empty object
    const emptyConfig = {};
    const emptyResult = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(emptyConfig);
    
    // Verify empty array is returned
    expect(emptyResult).toBeInstanceOf(Array);
    expect(emptyResult.length).toBe(0);
  });

  it('should handle license configs with missing properties', async () => {
    // Sample license configuration with missing properties
    const licenseConfigs = {
      'MIT': {
        name: 'MIT License',
        // url is missing
        content: 'MIT License content'
      },
      'UNLICENSED': {
        // name is missing
        url: 'none',
        content: 'Proprietary'
      }
    };
    
    // Convert to select options
    const selectOptions = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(licenseConfigs);
    
    // Verify the correct structure of the result
    expect(selectOptions).toBeInstanceOf(Array);
    expect(selectOptions.length).toBe(2);
    
    // Check first option
    expect(selectOptions[0].label).toBe('MIT License (MIT)');
    expect(selectOptions[0].value).toBe('MIT');
    
    // Check second option - should handle undefined name
    expect(selectOptions[1].label).toBe('undefined (UNLICENSED)');
    expect(selectOptions[1].value).toBe('UNLICENSED');
  });
});