import { describe, it, expect } from 'vitest';
import { ESLINT_FEATURE_GROUPS } from '../../../../src/domain/constant/eslint-feature-groups.constant';
import { ESLINT_FEATURE_CONFIG } from '../../../../src/domain/constant/eslint-feature-config.constant';
import { EEslintFeature } from '../../../../src/domain/enum/eslint-feature.enum';

describe('ESLINT_FEATURE_GROUPS', () => {
  it('should define feature groups with correct structure', () => {
    expect(ESLINT_FEATURE_GROUPS).toBeDefined();
    expect(Array.isArray(ESLINT_FEATURE_GROUPS)).toBe(true);
    
    // Check that we have feature groups defined
    expect(ESLINT_FEATURE_GROUPS.length).toBeGreaterThan(0);
    
    // Check structure of each group
    ESLINT_FEATURE_GROUPS.forEach(group => {
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('features');
      expect(Array.isArray(group.features)).toBe(true);
      expect(group.features.length).toBeGreaterThan(0);
    });
  });
  
  it('should include all features from EEslintFeature enum', () => {
    // Get all features from all groups
    const featuresInGroups = ESLINT_FEATURE_GROUPS.flatMap(group => group.features);
    const uniqueFeaturesInGroups = [...new Set(featuresInGroups)];
    
    // Get all features from enum
    const allEnumFeatures = Object.values(EEslintFeature);
    
    // Check all enum features are included in groups
    allEnumFeatures.forEach(feature => {
      expect(uniqueFeaturesInGroups).toContain(feature);
    });
    
    // Check no extra features are in groups that aren't in enum
    expect(uniqueFeaturesInGroups.length).toBe(allEnumFeatures.length);
  });
  
  it('should have valid features that are defined in ESLINT_FEATURE_CONFIG', () => {
    // Check each feature in groups has a corresponding config
    ESLINT_FEATURE_GROUPS.forEach(group => {
      group.features.forEach(feature => {
        const featureConfig = ESLINT_FEATURE_CONFIG[feature];
        expect(featureConfig).toBeDefined();
        expect(featureConfig).toHaveProperty('configFlag');
        expect(featureConfig).toHaveProperty('description');
      });
    });
  });
  
  it('should have specific groups for core features and styling', () => {
    // Check for specific important groups
    const groupNames = ESLINT_FEATURE_GROUPS.map(group => group.name);
    expect(groupNames).toContain('Core Features');
    expect(groupNames).toContain('Styling');
    
    // Verify contents of Core Features group
    const coreGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Core Features');
    expect(coreGroup?.features).toContain(EEslintFeature.JAVASCRIPT);
    expect(coreGroup?.features).toContain(EEslintFeature.TYPESCRIPT);
    
    // Verify contents of Styling group
    const stylingGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Styling');
    expect(stylingGroup?.features).toContain(EEslintFeature.PRETTIER);
  });
  
  it('should access all lines in the constant file', () => {
    // This test is designed to access specific feature groups to improve coverage
    
    // Access Security group
    const securityGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Security');
    expect(securityGroup).toBeDefined();
    expect(securityGroup?.features).toContain(EEslintFeature.NO_SECRETS);
    
    // Access Project Architecture group
    const architectureGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Project Architecture');
    expect(architectureGroup).toBeDefined();
    expect(architectureGroup?.features).toContain(EEslintFeature.FSD);
    
    // Access Other Tools group
    const toolsGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Other Tools');
    expect(toolsGroup).toBeDefined();
    expect(toolsGroup?.features).toContain(EEslintFeature.NODE);
    
    // Access Frameworks group
    const frameworksGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Frameworks');
    expect(frameworksGroup).toBeDefined();
    expect(frameworksGroup?.features).toContain(EEslintFeature.REACT);
    
    // Access File Types group
    const fileTypesGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'File Types');
    expect(fileTypesGroup).toBeDefined();
    expect(fileTypesGroup?.features).toContain(EEslintFeature.JSON);
    
    // Access Code Quality group
    const qualityGroup = ESLINT_FEATURE_GROUPS.find(g => g.name === 'Code Quality');
    expect(qualityGroup).toBeDefined();
    expect(qualityGroup?.features).toContain(EEslintFeature.SONAR);
  });
});