import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CiModuleService } from '../../../../src/application/service/ci-module.service';
import { ECiModuleType } from '../../../../src/domain/enum/ci-module-type.enum';
import { ECiModule } from '../../../../src/domain/enum/ci-module.enum';
import { ECiProvider } from '../../../../src/domain/enum/ci-provider.enum';
import { EModule } from '../../../../src/domain/enum/module.enum';
import { CI_CONFIG } from '../../../../src/domain/constant/ci-config.constant';

describe('CiModuleService', () => {
  let ciModuleService: CiModuleService;
  let cliInterfaceServiceMock: any;
  let fileSystemServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    // Create mocks for dependencies
    cliInterfaceServiceMock = {
      clear: vi.fn(),
      confirm: vi.fn(),
      handleError: vi.fn(),
      info: vi.fn(),
      intro: vi.fn(),
      multiselect: vi.fn(),
      note: vi.fn(),
      outro: vi.fn(),
      select: vi.fn(),
      spinner: vi.fn(),
      startSpinner: vi.fn(),
      stopSpinner: vi.fn(),
      text: vi.fn(),
      warn: vi.fn(),
    };

    fileSystemServiceMock = {
      absolutePath: vi.fn(),
      createDirectory: vi.fn(),
      createFile: vi.fn(),
      isPathExists: vi.fn().mockResolvedValue(false),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };

    configServiceMock = {
      getModuleConfig: vi.fn().mockResolvedValue(null),
      isModuleEnabled: vi.fn().mockResolvedValue(false),
    };

    // Create instance of service
    ciModuleService = new CiModuleService(
      cliInterfaceServiceMock,
      fileSystemServiceMock,
      configServiceMock
    );
  });

  describe('handleExistingSetup', () => {
    it('should return true when no existing files are found', async () => {
      // Mock private method findExistingCiFiles to return empty array
      const spyFindExistingCiFiles = vi.spyOn(ciModuleService as any, 'findExistingCiFiles')
        .mockResolvedValue([]);

      const result = await ciModuleService.handleExistingSetup();
      
      expect(result).toBe(true);
      expect(spyFindExistingCiFiles).toHaveBeenCalled();
      expect(cliInterfaceServiceMock.warn).not.toHaveBeenCalled();
      expect(cliInterfaceServiceMock.confirm).not.toHaveBeenCalled();
    });

    it('should ask for confirmation when existing files are found', async () => {
      // Mock private method findExistingCiFiles to return some files
      vi.spyOn(ciModuleService as any, 'findExistingCiFiles')
        .mockResolvedValue(['.github/workflows/release.yml']);
      
      cliInterfaceServiceMock.confirm.mockResolvedValue(true);

      const result = await ciModuleService.handleExistingSetup();
      
      expect(result).toBe(true);
      expect(cliInterfaceServiceMock.warn).toHaveBeenCalled();
      expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
        'Do you want to continue? This might overwrite existing files.',
        false
      );
    });

    it('should handle errors and return false', async () => {
      // Mock private method findExistingCiFiles to throw an error
      vi.spyOn(ciModuleService as any, 'findExistingCiFiles')
        .mockRejectedValue(new Error('Test error'));

      const result = await ciModuleService.handleExistingSetup();
      
      expect(result).toBe(false);
      expect(cliInterfaceServiceMock.handleError).toHaveBeenCalledWith(
        'Failed to check existing CI setup',
        expect.any(Error)
      );
    });
  });

  describe('shouldInstall', () => {
    it('should return true when user confirms installation', async () => {
      cliInterfaceServiceMock.confirm.mockResolvedValue(true);
      configServiceMock.isModuleEnabled.mockResolvedValue(false);

      const result = await ciModuleService.shouldInstall();
      
      expect(result).toBe(true);
      expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
        'Would you like to set up CI workflows?',
        false
      );
    });

    it('should return false when user rejects installation', async () => {
      cliInterfaceServiceMock.confirm.mockResolvedValue(false);

      const result = await ciModuleService.shouldInstall();
      
      expect(result).toBe(false);
    });

    it('should use saved configuration if available', async () => {
      cliInterfaceServiceMock.confirm.mockResolvedValue(true);
      configServiceMock.isModuleEnabled.mockResolvedValue(true);

      const result = await ciModuleService.shouldInstall();
      
      expect(result).toBe(true);
      expect(configServiceMock.isModuleEnabled).toHaveBeenCalledWith(EModule.CI);
      expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
        'Would you like to set up CI workflows?',
        true
      );
    });

    it('should handle errors and return false', async () => {
      cliInterfaceServiceMock.confirm.mockRejectedValue(new Error('Test error'));

      const result = await ciModuleService.shouldInstall();
      
      expect(result).toBe(false);
      expect(cliInterfaceServiceMock.handleError).toHaveBeenCalledWith(
        'Failed to get user confirmation',
        expect.any(Error)
      );
    });
  });

  describe('install', () => {
    beforeEach(() => {
      // Setup default mocks for the install method
      cliInterfaceServiceMock.confirm.mockResolvedValue(true);
      cliInterfaceServiceMock.select.mockResolvedValue(ECiProvider.GITHUB);
      cliInterfaceServiceMock.multiselect.mockResolvedValue([ECiModule.DEPENDABOT]);
      cliInterfaceServiceMock.text.mockResolvedValue('dev');
      
      // Mock private methods
      vi.spyOn(ciModuleService as any, 'determineModuleType')
        .mockResolvedValue(ECiModuleType.UNIVERSAL);
      
      vi.spyOn(ciModuleService as any, 'selectProvider')
        .mockResolvedValue(ECiProvider.GITHUB);
      
      vi.spyOn(ciModuleService as any, 'selectCompatibleModules')
        .mockResolvedValue([ECiModule.DEPENDABOT]);
      
      vi.spyOn(ciModuleService as any, 'handleExistingSetup')
        .mockResolvedValue(true);
      
      vi.spyOn(ciModuleService as any, 'setupSelectedModules')
        .mockResolvedValue({ [ECiModule.DEPENDABOT]: { devBranchName: 'dev' } });
      
      // Set properties directly to simulate selected state
      (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
      (ciModuleService as any).selectedModules = [ECiModule.DEPENDABOT];
    });

    it('should successfully install CI modules', async () => {
      const result = await ciModuleService.install();
      
      expect(result).toEqual({
        customProperties: {
          isNpmPackage: false,
          moduleProperties: { [ECiModule.DEPENDABOT]: { devBranchName: 'dev' } },
          modules: [ECiModule.DEPENDABOT],
          provider: ECiProvider.GITHUB,
        },
        wasInstalled: true,
      });
    });

    it('should return wasInstalled: false when shouldInstall returns false', async () => {
      vi.spyOn(ciModuleService, 'shouldInstall').mockResolvedValue(false);
      
      const result = await ciModuleService.install();
      
      expect(result).toEqual({ wasInstalled: false });
    });

    it('should return wasInstalled: false when no modules are selected', async () => {
      vi.spyOn(ciModuleService as any, 'selectCompatibleModules')
        .mockResolvedValue([]);
      
      const result = await ciModuleService.install();
      
      expect(result).toEqual({ wasInstalled: false });
      expect(cliInterfaceServiceMock.warn).toHaveBeenCalledWith('No CI modules selected.');
    });

    it('should return wasInstalled: false when user cancels due to existing setup', async () => {
      vi.spyOn(ciModuleService as any, 'handleExistingSetup')
        .mockResolvedValue(false);
      
      const result = await ciModuleService.install();
      
      expect(result).toEqual({ wasInstalled: false });
      expect(cliInterfaceServiceMock.warn).toHaveBeenCalledWith('Setup cancelled by user.');
    });

    it('should handle and re-throw errors during installation', async () => {
      const error = new Error('Test error');
      vi.spyOn(ciModuleService as any, 'setupSelectedModules')
        .mockRejectedValue(error);
      
      await expect(ciModuleService.install()).rejects.toThrow('Test error');
      
      expect(cliInterfaceServiceMock.handleError).toHaveBeenCalledWith(
        'Failed to complete CI setup',
        error
      );
    });
  });

  describe('Private methods', () => {
    describe('determineModuleType', () => {
      it('should return NPM_ONLY when user confirms package is for NPM', async () => {
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).determineModuleType(false);
        
        expect(result).toBe(ECiModuleType.NPM_ONLY);
        expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
          'Is this package going to be published to NPM?',
          false
        );
      });

      it('should return NON_NPM when user denies package is for NPM', async () => {
        cliInterfaceServiceMock.confirm.mockResolvedValue(false);
        
        const result = await (ciModuleService as any).determineModuleType(false);
        
        expect(result).toBe(ECiModuleType.NON_NPM);
      });

      it('should use saved value as default if provided', async () => {
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).determineModuleType(true);
        
        expect(result).toBe(ECiModuleType.NPM_ONLY);
        expect(cliInterfaceServiceMock.confirm).toHaveBeenCalledWith(
          'Is this package going to be published to NPM?',
          true
        );
      });
    });

    describe('selectProvider', () => {
      it('should prompt user to select a CI provider', async () => {
        cliInterfaceServiceMock.select.mockResolvedValue(ECiProvider.GITHUB);
        
        const result = await (ciModuleService as any).selectProvider();
        
        expect(result).toBe(ECiProvider.GITHUB);
        expect(cliInterfaceServiceMock.select).toHaveBeenCalledWith(
          'Select CI provider:',
          expect.arrayContaining([
            expect.objectContaining({
              value: ECiProvider.GITHUB,
              label: ECiProvider.GITHUB
            })
          ]),
          undefined
        );
      });

      it('should use saved provider as default if provided', async () => {
        cliInterfaceServiceMock.select.mockResolvedValue(ECiProvider.GITHUB);
        
        const result = await (ciModuleService as any).selectProvider(ECiProvider.GITHUB);
        
        expect(result).toBe(ECiProvider.GITHUB);
        expect(cliInterfaceServiceMock.select).toHaveBeenCalledWith(
          'Select CI provider:',
          expect.any(Array),
          ECiProvider.GITHUB
        );
      });
    });

    describe('selectCompatibleModules', () => {
      it('should filter modules based on module type and prompt user to select', async () => {
        cliInterfaceServiceMock.multiselect.mockResolvedValue([ECiModule.DEPENDABOT]);
        
        const result = await (ciModuleService as any).selectCompatibleModules(
          ECiModuleType.UNIVERSAL,
          []
        );
        
        expect(result).toEqual([ECiModule.DEPENDABOT]);
        expect(cliInterfaceServiceMock.multiselect).toHaveBeenCalledWith(
          'Select the CI modules you want to set up:',
          expect.arrayContaining([
            expect.objectContaining({
              value: ECiModule.DEPENDABOT
            })
          ]),
          false,
          []
        );
      });

      it('should filter saved modules against compatible ones and use as default', async () => {
        cliInterfaceServiceMock.multiselect.mockResolvedValue([ECiModule.DEPENDABOT]);
        
        const result = await (ciModuleService as any).selectCompatibleModules(
          ECiModuleType.UNIVERSAL,
          [ECiModule.DEPENDABOT, ECiModule.RELEASE_NPM] // RELEASE_NPM is not compatible with UNIVERSAL
        );
        
        expect(result).toEqual([ECiModule.DEPENDABOT]);
        expect(cliInterfaceServiceMock.multiselect).toHaveBeenCalledWith(
          'Select the CI modules you want to set up:',
          expect.any(Array),
          false,
          [ECiModule.DEPENDABOT] // Only DEPENDABOT should be pre-selected
        );
      });
    });

    describe('setupModule', () => {
      beforeEach(() => {
        // Set selectedProvider for the tests
        (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
      });

      it('should create directory and write file for the module', async () => {
        fileSystemServiceMock.writeFile.mockResolvedValue(undefined);
        
        const result = await (ciModuleService as any).setupModule(
          ECiModule.DEPENDABOT,
          { devBranchName: 'dev' }
        );
        
        expect(result).toEqual({
          isSuccess: true,
          module: ECiModule.DEPENDABOT
        });
        
        expect(fileSystemServiceMock.createDirectory).toHaveBeenCalledWith(
          '.github',
          {
            isRecursive: true
          }
        );
        
        expect(fileSystemServiceMock.writeFile).toHaveBeenCalledWith(
          '.github/dependabot.yml',
          expect.stringContaining('version: 2')
        );
      });

      it('should handle errors during setup', async () => {
        fileSystemServiceMock.writeFile.mockRejectedValue(new Error('Write error'));
        
        const result = await (ciModuleService as any).setupModule(
          ECiModule.DEPENDABOT,
          { devBranchName: 'dev' }
        );
        
        expect(result).toEqual({
          isSuccess: false,
          module: ECiModule.DEPENDABOT,
          error: expect.any(Error)
        });
      });

      it('should throw error if provider is not supported for module', async () => {
        // Create a temporary mock for CI_CONFIG
        const originalConfig = { ...CI_CONFIG[ECiModule.DEPENDABOT] };
        const contentWithoutGithub = { ...originalConfig.content };
        delete contentWithoutGithub[ECiProvider.GITHUB];
        
        // Replace with mock that doesn't have the provider
        vi.spyOn(CI_CONFIG, ECiModule.DEPENDABOT, 'get').mockReturnValue({
          ...originalConfig,
          content: contentWithoutGithub
        });
        
        const result = await (ciModuleService as any).setupModule(
          ECiModule.DEPENDABOT,
          { devBranchName: 'dev' }
        );
        
        expect(result).toEqual({
          isSuccess: false,
          module: ECiModule.DEPENDABOT,
          error: expect.objectContaining({
            message: expect.stringContaining('Provider GitHub is not supported')
          })
        });
      });
    });

    describe('collectModuleProperties', () => {
      it('should collect properties for DEPENDABOT module', async () => {
        cliInterfaceServiceMock.text.mockResolvedValue('feature');
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.DEPENDABOT,
          {}
        );
        
        expect(result).toEqual({
          devBranchName: 'feature'
        });
        
        expect(cliInterfaceServiceMock.text).toHaveBeenCalledWith(
          'Enter the target branch for Dependabot updates:',
          'dev',
          'dev'
        );
      });

      it('should use saved properties for DEPENDABOT module if available', async () => {
        cliInterfaceServiceMock.text.mockResolvedValue('feature');
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.DEPENDABOT,
          { devBranchName: 'staging' }
        );
        
        expect(result).toEqual({
          devBranchName: 'feature'
        });
        
        expect(cliInterfaceServiceMock.text).toHaveBeenCalledWith(
          'Enter the target branch for Dependabot updates:',
          'dev',
          'staging'
        );
      });

      it('should collect properties for RELEASE module', async () => {
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => {
          if (question.includes('main release branch')) {
            return Promise.resolve('master');
          }
          if (question.includes('pre-release branch')) {
            return Promise.resolve('beta');
          }
          return Promise.resolve(defaultValue);
        });
        
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {}
        );
        
        expect(result).toEqual({
          mainBranch: 'master',
          isPrerelease: true,
          preReleaseBranch: 'beta'
        });
      });

      it('should collect properties for RELEASE module with prerelease disabled', async () => {
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => {
          if (question.includes('main release branch')) {
            return Promise.resolve('master');
          }
          return Promise.resolve(defaultValue);
        });
        
        cliInterfaceServiceMock.confirm.mockResolvedValue(false);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {}
        );
        
        expect(result).toEqual({
          mainBranch: 'master',
          isPrerelease: false
        });
        
        // Verify the preReleaseBranch question was not asked
        expect(cliInterfaceServiceMock.text).not.toHaveBeenCalledWith(
          expect.stringContaining('pre-release branch'),
          expect.any(String),
          expect.any(String)
        );
      });

      it('should use saved properties for RELEASE module if available', async () => {
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => {
          return Promise.resolve(defaultValue);
        });
        
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {
            mainBranch: 'production',
            isPrerelease: true,
            preReleaseBranch: 'develop'
          }
        );
        
        expect(result).toEqual({
          mainBranch: 'production',
          isPrerelease: true,
          preReleaseBranch: 'develop'
        });
        
        // Verify the mainBranch text was called with saved value
        expect(cliInterfaceServiceMock.text).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          'production'
        );
        
        // Verify the preReleaseBranch question was asked with saved value
        expect(cliInterfaceServiceMock.text).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          'develop'
        );
      });

      it('should handle RELEASE_NPM module the same as RELEASE module', async () => {
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => {
          if (question.includes('main release branch')) {
            return Promise.resolve('master');
          }
          if (question.includes('pre-release branch')) {
            return Promise.resolve('beta');
          }
          return Promise.resolve(defaultValue);
        });
        
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE_NPM,
          {}
        );
        
        expect(result).toEqual({
          mainBranch: 'master',
          isPrerelease: true,
          preReleaseBranch: 'beta'
        });
      });

      it('should use semantic-release config if available for RELEASE module', async () => {
        configServiceMock.getModuleConfig.mockImplementation((module) => {
          if (module === EModule.SEMANTIC_RELEASE) {
            return Promise.resolve({
              mainBranch: 'production',
              isPrereleaseEnabled: true,
              preReleaseBranch: 'staging'
            });
          }
          return Promise.resolve(null);
        });
        
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => Promise.resolve(defaultValue));
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {}
        );
        
        expect(result).toEqual({
          mainBranch: 'production',
          isPrerelease: true,
          preReleaseBranch: 'staging'
        });
        
        expect(cliInterfaceServiceMock.info).toHaveBeenCalledWith(
          'Found semantic-release configuration. Using its values as defaults for release CI setup.'
        );
      });
      
      it('should use partially available semantic-release config and saved properties for RELEASE module', async () => {
        configServiceMock.getModuleConfig.mockImplementation((module) => {
          if (module === EModule.SEMANTIC_RELEASE) {
            return Promise.resolve({
              mainBranch: 'production',
              // isPrereleaseEnabled is missing
              preReleaseBranch: null
            });
          }
          return Promise.resolve(null);
        });
        
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => Promise.resolve(defaultValue));
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);
        
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {
            // mainBranch is missing (should come from semantic-release)
            isPrerelease: true, // saved value should be used
            // preReleaseBranch is missing (should use default)
          }
        );
        
        expect(result).toEqual({
          mainBranch: 'production',
          isPrerelease: true,
          preReleaseBranch: 'dev'
        });
        
        expect(cliInterfaceServiceMock.info).toHaveBeenCalledWith(
          'Found semantic-release configuration. Using its values as defaults for release CI setup.'
        );
      });

      // This test specifically targets the branch in line 172 of ci-module.service.ts
      // where semantic release config is available but no values were used from it
      it('should handle when semantic-release config is available but no values are used', async () => {
        configServiceMock.getModuleConfig.mockImplementation((module) => {
          if (module === EModule.SEMANTIC_RELEASE) {
            return Promise.resolve({
              // This config doesn't have useful values for the release module
              someOtherProperty: 'value',
            });
          }
          return Promise.resolve(null);
        });
        
        cliInterfaceServiceMock.text.mockImplementation((question, _placeholder, defaultValue) => Promise.resolve(defaultValue));
        cliInterfaceServiceMock.confirm.mockResolvedValue(true);

        // Provide all needed properties in savedProperties, so nothing comes from semantic-release
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.RELEASE,
          {
            mainBranch: 'saved-main',
            isPrerelease: true,
            preReleaseBranch: 'saved-dev'
          }
        );
        
        expect(result).toEqual({
          mainBranch: 'saved-main',
          isPrerelease: true,
          preReleaseBranch: 'saved-dev'
        });
        
        // Info should not be called since no values were used from semantic-release
        expect(cliInterfaceServiceMock.info).not.toHaveBeenCalled();
      });

      it('should return empty object for unknown modules', async () => {
        // Using SNYK as an example of a module with no properties to collect
        const result = await (ciModuleService as any).collectModuleProperties(
          ECiModule.SNYK,
          {}
        );
        
        expect(result).toEqual({});
        expect(cliInterfaceServiceMock.text).not.toHaveBeenCalled();
        expect(cliInterfaceServiceMock.confirm).not.toHaveBeenCalled();
      });
    });

    describe('displaySetupSummary', () => {
      it('should display successful and failed configurations', () => {
        (ciModuleService as any).displaySetupSummary(
          [{ module: ECiModule.DEPENDABOT }],
          [{ module: ECiModule.SNYK, error: new Error('API key required') }]
        );
        
        expect(cliInterfaceServiceMock.note).toHaveBeenCalledWith(
          'CI Setup Summary',
          expect.stringContaining('Successfully created configurations:')
        );
        
        // Check that both success and error messages are included
        const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
        expect(summaryMessage).toContain('✓ Dependabot');
        expect(summaryMessage).toContain('✗ Snyk - API key required');
      });

      // This test specifically targets line 223 in ci-module.service.ts
      // where it checks if there are any failed configurations
      it('should display only successful configurations when no failures exist', () => {
        // Reset the mock to ensure clean state
        cliInterfaceServiceMock.note.mockReset();
        
        (ciModuleService as any).displaySetupSummary(
          [{ module: ECiModule.DEPENDABOT }, { module: ECiModule.SNYK }],
          [] // Empty failures array
        );
        
        expect(cliInterfaceServiceMock.note).toHaveBeenCalledWith(
          'CI Setup Summary',
          expect.stringContaining('Successfully created configurations:')
        );
        
        // Check that only success messages are included and no failure section
        const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
        expect(summaryMessage).toContain('✓ Dependabot');
        expect(summaryMessage).toContain('✓ Snyk');
        expect(summaryMessage).not.toContain('Failed configurations:');
      });

      // This test checks handling of error objects without message property
      it('should handle error objects without message property', () => {
        cliInterfaceServiceMock.note.mockReset();
        
        (ciModuleService as any).displaySetupSummary(
          [{ module: ECiModule.DEPENDABOT }],
          [{ module: ECiModule.SNYK, error: {} }] // Error without message
        );
        
        const summaryMessage = cliInterfaceServiceMock.note.mock.calls[0][1];
        expect(summaryMessage).toContain('✗ Snyk - Unknown error');
      });
    });

    describe('findExistingCiFiles', () => {
      beforeEach(() => {
        // Reset mock implementations
        fileSystemServiceMock.isPathExists.mockReset();
        
        // Setup properties needed for the method
        (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
        (ciModuleService as any).selectedModules = [ECiModule.DEPENDABOT, ECiModule.SNYK];
      });

      it('should return empty array when no files exist', async () => {
        // Mock to always return false for file existence
        fileSystemServiceMock.isPathExists.mockResolvedValue(false);
        
        const result = await (ciModuleService as any).findExistingCiFiles();
        
        expect(result).toEqual([]);
        expect(fileSystemServiceMock.isPathExists).toHaveBeenCalled();
      });

      it('should return array of existing file paths when files exist', async () => {
        // Mock isPathExists to return true for specific paths
        fileSystemServiceMock.isPathExists.mockImplementation((path) => {
          if (path === '.github/workflows/snyk-security-scan.yml') {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        });
        
        const result = await (ciModuleService as any).findExistingCiFiles();
        
        // Log the result
        console.log('Result from findExistingCiFiles:', result);
        
        // Don't assert exact array contents as it depends on CI_CONFIG implementation
        // Instead check if it contains the path we mocked to exist
        expect(result).toContain('.github/workflows/snyk-security-scan.yml');
      });
      
      it('should handle null or undefined provider config', async () => {
        // Create a spy to temporarily modify the behavior of CI_CONFIG access
        const originalDependabotConfig = CI_CONFIG[ECiModule.DEPENDABOT];
        
        // Setup a custom mock for CI_CONFIG to test the edge case
        const mockGetDependabotConfig = vi.fn().mockReturnValue({
          ...originalDependabotConfig,
          content: {
            // Deliberately missing the GITHUB provider
          }
        });
        
        // Apply the mock
        Object.defineProperty(CI_CONFIG, ECiModule.DEPENDABOT, {
          get: mockGetDependabotConfig,
          configurable: true
        });
        
        // Run the test
        const result = await (ciModuleService as any).findExistingCiFiles();
        
        // Should only have the SNYK file since DEPENDABOT is mocked to have no provider config
        expect(result).not.toContain('.github/dependabot.yml');
        
        // Restore the original config
        Object.defineProperty(CI_CONFIG, ECiModule.DEPENDABOT, {
          value: originalDependabotConfig,
          configurable: true,
          writable: true
        });
      });

      it('should skip the file check when provider or modules are not set', async () => {
        // Test with null provider
        (ciModuleService as any).selectedProvider = null;
        
        const result = await (ciModuleService as any).findExistingCiFiles();
        
        expect(result).toEqual([]);
        expect(fileSystemServiceMock.isPathExists).not.toHaveBeenCalled();
        
        // Test with empty modules array
        (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
        (ciModuleService as any).selectedModules = [];
        
        const result2 = await (ciModuleService as any).findExistingCiFiles();
        
        expect(result2).toEqual([]);
        expect(fileSystemServiceMock.isPathExists).not.toHaveBeenCalled();
      });
      
      // Create a separate test focused on file existence checks 
      it('should check the existence of module configuration files', async () => {
        // Restore needed properties
        (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
        (ciModuleService as any).selectedModules = [ECiModule.DEPENDABOT];
        
        // Mock the private method instead of trying to test it directly
        const spy = vi.spyOn(ciModuleService as any, 'findExistingCiFiles');
        
        // Call handleExistingSetup which uses findExistingCiFiles
        await ciModuleService.handleExistingSetup();
        
        // Verify findExistingCiFiles was called
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('extractModuleProperties', () => {
      it('should return empty object for falsy values', () => {
        expect((ciModuleService as any).extractModuleProperties(null)).toEqual({});
        expect((ciModuleService as any).extractModuleProperties(undefined)).toEqual({});
        expect((ciModuleService as any).extractModuleProperties(false)).toEqual({});
      });

      it('should return empty object for boolean true', () => {
        expect((ciModuleService as any).extractModuleProperties(true)).toEqual({});
      });

      it('should remove isEnabled property and return the rest', () => {
        const properties = (ciModuleService as any).extractModuleProperties({
          isEnabled: true,
          devBranchName: 'dev',
          mainBranch: 'main'
        });
        
        expect(properties).toEqual({
          devBranchName: 'dev',
          mainBranch: 'main'
        });
      });

      it('should return object as is if it has no isEnabled property', () => {
        const input = { devBranchName: 'dev', mainBranch: 'main' };
        const properties = (ciModuleService as any).extractModuleProperties(input);
        
        expect(properties).toEqual(input);
      });
    });

    describe('getProviderDescription', () => {
      it('should return description for known provider', () => {
        const description = (ciModuleService as any).getProviderDescription(ECiProvider.GITHUB);
        
        expect(description).toBe('GitHub Actions - Cloud-based CI/CD');
      });

      it('should return provider name for unknown provider', () => {
        const unknownProvider = 'Unknown' as ECiProvider;
        const description = (ciModuleService as any).getProviderDescription(unknownProvider);
        
        expect(description).toBe(unknownProvider);
      });
    });
    
    describe('setupSelectedModules', () => {
      beforeEach(() => {
        // Setup default state for these tests
        (ciModuleService as any).selectedProvider = ECiProvider.GITHUB;
        (ciModuleService as any).selectedModules = [ECiModule.DEPENDABOT, ECiModule.SNYK];
        
        // Setup mocks for setupModule
        vi.spyOn(ciModuleService as any, 'setupModule').mockImplementation((module) => {
          if (module === ECiModule.DEPENDABOT) {
            return Promise.resolve({ isSuccess: true, module });
          }
          return Promise.resolve({ isSuccess: true, module });
        });
        
        // Mock collectModuleProperties
        vi.spyOn(ciModuleService as any, 'collectModuleProperties').mockImplementation((module) => {
          if (module === ECiModule.DEPENDABOT) {
            return Promise.resolve({ devBranchName: 'develop' });
          }
          return Promise.resolve({});
        });
        
        // Mock displaySetupSummary
        vi.spyOn(ciModuleService as any, 'displaySetupSummary').mockImplementation(() => {});
      });
      
      it('should collect and setup all selected modules', async () => {
        const result = await (ciModuleService as any).setupSelectedModules({});
        
        expect(result).toEqual({
          [ECiModule.DEPENDABOT]: { devBranchName: 'develop' }
        });
        
        expect(cliInterfaceServiceMock.startSpinner).toHaveBeenCalledWith('Setting up CI configuration...');
        expect(cliInterfaceServiceMock.stopSpinner).toHaveBeenCalledWith('CI configuration completed successfully!');
        expect((ciModuleService as any).setupModule).toHaveBeenCalledTimes(2);
        expect((ciModuleService as any).displaySetupSummary).toHaveBeenCalled();
      });
      
      it('should handle setup failures for some modules', async () => {
        // Override setupModule to make one module fail
        (ciModuleService as any).setupModule.mockImplementation((module) => {
          if (module === ECiModule.DEPENDABOT) {
            return Promise.resolve({ isSuccess: true, module });
          }
          return Promise.resolve({ 
            isSuccess: false, 
            module,
            error: new Error('Failed to setup')
          });
        });
        
        const result = await (ciModuleService as any).setupSelectedModules({});
        
        expect(result).toEqual({
          [ECiModule.DEPENDABOT]: { devBranchName: 'develop' }
        });
        
        // Verify displaySetupSummary was called with correct arguments
        expect((ciModuleService as any).displaySetupSummary).toHaveBeenCalledWith(
          [{ isSuccess: true, module: ECiModule.DEPENDABOT }],
          [{ isSuccess: false, module: ECiModule.SNYK, error: expect.any(Error) }]
        );
      });
      
      it('should throw error if provider is not selected', async () => {
        // Clear the provider
        (ciModuleService as any).selectedProvider = undefined;
        
        await expect((ciModuleService as any).setupSelectedModules({}))
          .rejects.toThrow('Provider not selected');
        
        expect(cliInterfaceServiceMock.startSpinner).not.toHaveBeenCalled();
      });
      
      it('should handle errors during setup process', async () => {
        // Make setupModule throw an error
        (ciModuleService as any).setupModule.mockRejectedValue(new Error('Setup error'));
        
        await expect((ciModuleService as any).setupSelectedModules({}))
          .rejects.toThrow('Setup error');
        
        expect(cliInterfaceServiceMock.startSpinner).toHaveBeenCalled();
        expect(cliInterfaceServiceMock.stopSpinner).toHaveBeenCalled();
        // Since we're expecting the function to throw, we should still stop the spinner
        expect(cliInterfaceServiceMock.stopSpinner).toHaveBeenCalledWith();
      });
      
      it('should use saved module properties if available', async () => {
        const savedProperties = {
          [ECiModule.DEPENDABOT]: { devBranchName: 'main' }
        };
        
        await (ciModuleService as any).setupSelectedModules(savedProperties);
        
        // Verify collectModuleProperties was called with the saved properties
        expect((ciModuleService as any).collectModuleProperties).toHaveBeenCalledWith(
          ECiModule.DEPENDABOT,
          { devBranchName: 'main' }
        );
      });
      
      it('should handle saved properties in different formats', async () => {
        const savedProperties = {
          [ECiModule.DEPENDABOT]: true, // Boolean format
          [ECiModule.SNYK]: { isEnabled: true, someOption: 'value' } // Object with isEnabled
        };
        
        // Mock extractModuleProperties to test different formats
        vi.spyOn(ciModuleService as any, 'extractModuleProperties').mockImplementation((moduleConfig) => {
          if (moduleConfig === true) {
            return {};
          }
          if (typeof moduleConfig === 'object' && 'isEnabled' in moduleConfig) {
            const { isEnabled, ...rest } = moduleConfig;
            return rest;
          }
          return moduleConfig;
        });
        
        await (ciModuleService as any).setupSelectedModules(savedProperties);
        
        // Verify extractModuleProperties was called for each module
        expect((ciModuleService as any).extractModuleProperties).toHaveBeenCalledWith(true);
        expect((ciModuleService as any).extractModuleProperties).toHaveBeenCalledWith({ 
          isEnabled: true, 
          someOption: 'value' 
        });
      });
    });
  });
});