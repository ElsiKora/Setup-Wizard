import { describe, it, expect } from 'vitest';
import { ConfigMapper } from '../../../../src/application/mapper/config.mapper';
import { EModule } from '../../../../src/domain/enum/module.enum';
import { ELicense } from '../../../../src/domain/enum/license.enum';
import { EEslintFeature } from '../../../../src/domain/enum/eslint-feature.enum';
import { EIde } from '../../../../src/domain/enum/ide.enum';
import { ECiModule } from '../../../../src/domain/enum/ci-module.enum';
import { ECiProvider } from '../../../../src/domain/enum/ci-provider.enum';
import type { IConfig } from '../../../../src/application/interface/config.interface';
import type { IModuleSetupResult } from '../../../../src/application/interface/module-setup-result.interface';

describe('ConfigMapper', () => {
  describe('fromConfigToInitCommandProperties', () => {
    it('should convert boolean config values correctly', () => {
      // Arrange
      const config: Partial<IConfig> = {
        [EModule.PRETTIER]: true,
        [EModule.STYLELINT]: false,
      };

      // Act
      const result = ConfigMapper.fromConfigToInitCommandProperties(config as IConfig);

      // Assert
      expect(result).toEqual({
        [EModule.PRETTIER]: true,
        [EModule.STYLELINT]: false,
      });
    });

    it('should extract isEnabled property from object config values', () => {
      // Arrange
      const config: Partial<IConfig> = {
        [EModule.LICENSE]: {
          isEnabled: true,
          license: ELicense.MIT,
          author: 'Test Author',
          year: 2023,
        },
        [EModule.ESLINT]: {
          isEnabled: false,
          features: [EEslintFeature.TYPESCRIPT],
        },
      };

      // Act
      const result = ConfigMapper.fromConfigToInitCommandProperties(config as IConfig);

      // Assert
      expect(result).toEqual({
        [EModule.LICENSE]: true,
        [EModule.ESLINT]: false,
      });
    });

    it('should handle complex nested objects with isEnabled property', () => {
      // Arrange
      const config: Partial<IConfig> = {
        [EModule.IDE]: {
          isEnabled: true,
          ides: [EIde.VSCODE, EIde.INTELLIJ],
        },
        [EModule.SEMANTIC_RELEASE]: {
          isEnabled: true,
          isPrereleaseEnabled: true,
          mainBranch: 'main',
          preReleaseBranch: 'dev',
          preReleaseChannel: 'beta',
          repositoryUrl: 'https://github.com/user/repo',
        },
        [EModule.CI]: {
          isEnabled: true,
          provider: ECiProvider.GITHUB,
          modules: [ECiModule.BUILD, ECiModule.TEST],
          moduleProperties: {
            [ECiModule.BUILD]: { isEnabled: true, customProp: 'value' },
          },
        },
      };

      // Act
      const result = ConfigMapper.fromConfigToInitCommandProperties(config as IConfig);

      // Assert
      expect(result).toEqual({
        [EModule.IDE]: true,
        [EModule.SEMANTIC_RELEASE]: true,
        [EModule.CI]: true,
      });
    });

    it('should convert undefined values to false', () => {
      // Arrange
      const config: Partial<IConfig> = {
        [EModule.PRETTIER]: undefined,
      };

      // Act
      const result = ConfigMapper.fromConfigToInitCommandProperties(config as IConfig);

      // Assert
      expect(result).toEqual({
        [EModule.PRETTIER]: false,
      });
    });

    it('should handle objects without isEnabled property', () => {
      // Arrange
      const config: Partial<IConfig> = {
        [EModule.LICENSE]: {
          // Missing isEnabled
          license: ELicense.MIT,
          author: 'Test Author',
        } as any,
      };

      // Act
      const result = ConfigMapper.fromConfigToInitCommandProperties(config as IConfig);

      // Assert
      expect(result).toEqual({
        [EModule.LICENSE]: true, // Truthy object is converted to true
      });
    });
  });

  describe('fromSetupResultsToConfig', () => {
    it('should convert setup results to config correctly', () => {
      // Arrange
      const setupResults: Partial<Record<EModule, IModuleSetupResult>> = {
        [EModule.LICENSE]: {
          wasInstalled: true,
          customProperties: {
            license: ELicense.MIT,
            author: 'Test Author',
          },
        },
        [EModule.PRETTIER]: {
          wasInstalled: false,
          customProperties: {
            additionalProperty: 'value',
          },
        },
      };

      // Act
      const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

      // Assert
      expect(result).toEqual({
        [EModule.LICENSE]: {
          isEnabled: true,
          license: ELicense.MIT,
          author: 'Test Author',
        },
        [EModule.PRETTIER]: {
          isEnabled: false,
          additionalProperty: 'value',
        },
      });
    });

    it('should handle empty setup results', () => {
      // Arrange
      const setupResults: Partial<Record<EModule, IModuleSetupResult>> = {};

      // Act
      const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

      // Assert
      expect(result).toEqual({});
    });

    it('should handle setup results without customProperties', () => {
      // Arrange
      const setupResults: Partial<Record<EModule, IModuleSetupResult>> = {
        [EModule.ESLINT]: {
          wasInstalled: true,
          customProperties: undefined,
        },
      };

      // Act
      const result = ConfigMapper.fromSetupResultsToConfig(setupResults);

      // Assert
      expect(result).toEqual({
        [EModule.ESLINT]: {
          isEnabled: true,
        },
      });
    });
  });
});