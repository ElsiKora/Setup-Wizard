import { describe, it, expect } from 'vitest';
import { LINT_STAGED_FEATURE_CONFIG } from 'bin/domain/constant/lint-staged-feature-config.constant.js';
import { ELintStagedFeature } from 'bin/domain/enum/lint-staged-feature.enum.js';

describe('LINT_STAGED_FEATURE_CONFIG E2E test', () => {
  it('should export the lint staged feature config constant as an object', () => {
    expect(LINT_STAGED_FEATURE_CONFIG).toBeDefined();
    expect(typeof LINT_STAGED_FEATURE_CONFIG).toBe('object');
  });

  it('should have entries for all lint staged feature enum values', () => {
    // Ensure all ELintStagedFeature enum values have a config entry
    for (const feature of Object.values(ELintStagedFeature)) {
      expect(LINT_STAGED_FEATURE_CONFIG).toHaveProperty(feature);
    }
  });

  it('should have the correct structure for each lint staged feature config', () => {
    for (const [feature, config] of Object.entries(LINT_STAGED_FEATURE_CONFIG)) {
      // Verify structure of each config object
      expect(config).toHaveProperty('fileExtensions');
      expect(Array.isArray(config.fileExtensions)).toBe(true);
      expect(config.fileExtensions.length).toBeGreaterThan(0);
      
      expect(config).toHaveProperty('label');
      expect(typeof config.label).toBe('string');
      expect(config.label.length).toBeGreaterThan(0);
      
      expect(config).toHaveProperty('requiredPackages');
      expect(Array.isArray(config.requiredPackages)).toBe(true);
      expect(config.requiredPackages.length).toBeGreaterThan(0);
    }
  });

  it('should have correct configuration for ESLint feature', () => {
    const eslintConfig = LINT_STAGED_FEATURE_CONFIG[ELintStagedFeature.ESLINT];
    expect(eslintConfig.label).toContain('ESLint');
    expect(eslintConfig.fileExtensions).toContain('js');
    expect(eslintConfig.fileExtensions).toContain('ts');
    expect(eslintConfig.fileExtensions).toContain('tsx');
    expect(eslintConfig.requiredPackages).toContain('eslint');
  });

  it('should have correct configuration for Prettier feature', () => {
    const prettierConfig = LINT_STAGED_FEATURE_CONFIG[ELintStagedFeature.PRETTIER];
    expect(prettierConfig.label).toContain('Prettier');
    expect(prettierConfig.fileExtensions).toContain('*');
    expect(prettierConfig.requiredPackages).toContain('prettier');
  });

  it('should have correct configuration for Stylelint feature', () => {
    const stylelintConfig = LINT_STAGED_FEATURE_CONFIG[ELintStagedFeature.STYLELINT];
    expect(stylelintConfig.label).toContain('Stylelint');
    expect(stylelintConfig.fileExtensions).toContain('css');
    expect(stylelintConfig.fileExtensions).toContain('scss');
    expect(stylelintConfig.requiredPackages).toContain('stylelint');
  });
});