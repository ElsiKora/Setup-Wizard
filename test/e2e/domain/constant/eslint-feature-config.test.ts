import { describe, it, expect } from 'vitest';
import { ESLINT_FEATURE_CONFIG } from 'bin/domain/constant/eslint-feature-config.constant.js';
import { EEslintFeature } from 'bin/domain/enum/eslint-feature.enum.js';

describe('ESLINT_FEATURE_CONFIG E2E test', () => {
  it('should export the eslint feature config constant as an object', () => {
    expect(ESLINT_FEATURE_CONFIG).toBeDefined();
    expect(typeof ESLINT_FEATURE_CONFIG).toBe('object');
  });

  it('should have entries for all eslint feature enum values', () => {
    // Ensure all EEslintFeature enum values have a config entry
    for (const feature of Object.values(EEslintFeature)) {
      expect(ESLINT_FEATURE_CONFIG).toHaveProperty(feature);
    }
  });

  it('should have the correct structure for each eslint feature config', () => {
    for (const [feature, config] of Object.entries(ESLINT_FEATURE_CONFIG)) {
      // Verify structure of each config object
      expect(config).toHaveProperty('configFlag');
      expect(typeof config.configFlag).toBe('string');
      
      expect(config).toHaveProperty('description');
      expect(typeof config.description).toBe('string');
      
      // Optional properties may not exist on all configs
      if (config.packages !== undefined) {
        expect(Array.isArray(config.packages)).toBe(true);
      }
      
      if (config.detect !== undefined) {
        expect(Array.isArray(config.detect)).toBe(true);
      }
      
      if (config.isRequired !== undefined) {
        expect(typeof config.isRequired).toBe('boolean');
      }
      
      if (config.isRequiresTypescript !== undefined) {
        expect(typeof config.isRequiresTypescript).toBe('boolean');
      }
    }
  });

  it('should have correct specific configurations for known eslint features', () => {
    // Test JavaScript feature (which is required)
    const jsConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT];
    expect(jsConfig.configFlag).toBe('withJavascript');
    expect(jsConfig.description).toBe('JavaScript support');
    expect(jsConfig.isRequired).toBe(true);
    
    // Test TypeScript feature
    const tsConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.TYPESCRIPT];
    expect(tsConfig.configFlag).toBe('withTypescript');
    expect(tsConfig.description).toBe('TypeScript support');
    expect(tsConfig.isRequiresTypescript).toBe(true);
    expect(tsConfig.detect).toContain('typescript');
    
    // Test React feature
    const reactConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.REACT];
    expect(reactConfig.configFlag).toBe('withReact');
    expect(reactConfig.description).toBe('React framework support');
    expect(reactConfig.detect).toContain('react');
    expect(reactConfig.packages).toContain('eslint-plugin-react');
    
    // Test NestJS feature
    const nestConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.NEST];
    expect(nestConfig.configFlag).toBe('withNest');
    expect(nestConfig.description).toBe('NestJS framework support');
    expect(nestConfig.detect).toContain('@nestjs/core');
    expect(nestConfig.isRequiresTypescript).toBe(true);
    
    // Test feature with special packages
    const fsdConfig = ESLINT_FEATURE_CONFIG[EEslintFeature.FSD];
    expect(fsdConfig.configFlag).toBe('withFsd');
    expect(fsdConfig.description).toBe('File structure definition');
    expect(fsdConfig.packages).toContain('@conarti/eslint-plugin-feature-sliced');
  });

  it('should have configFlag values that start with "with"', () => {
    for (const config of Object.values(ESLINT_FEATURE_CONFIG)) {
      expect(config.configFlag.startsWith('with')).toBe(true);
    }
  });
});