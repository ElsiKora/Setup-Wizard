import { describe, it, expect } from 'vitest';
import { IDE_CONFIG } from 'bin/domain/constant/ide-config.constant.js';
import { EIde } from 'bin/domain/enum/ide.enum.js';

describe('IDE_CONFIG E2E test', () => {
  it('should export IDE_CONFIG as an object', () => {
    expect(IDE_CONFIG).toBeDefined();
    expect(typeof IDE_CONFIG).toBe('object');
  });

  it('should have entries for all IDE enum values', () => {
    // Check that all EIde enum values are present in IDE_CONFIG
    for (const ide of Object.values(EIde)) {
      expect(IDE_CONFIG).toHaveProperty(ide);
    }
  });

  it('should have the correct structure for each IDE config', () => {
    for (const [ide, config] of Object.entries(IDE_CONFIG)) {
      // Verify basic structure
      expect(config).toHaveProperty('content');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('name');
      
      // Verify content is an array
      expect(Array.isArray(config.content)).toBe(true);
      
      // Verify each content item
      for (const contentItem of config.content) {
        expect(contentItem).toHaveProperty('filePath');
        expect(contentItem).toHaveProperty('template');
        expect(typeof contentItem.filePath).toBe('string');
        expect(typeof contentItem.template).toBe('function');
      }
    }
  });

  describe('IntelliJ IDEA configuration', () => {
    const ideaConfig = IDE_CONFIG[EIde.INTELLIJ_IDEA];
    
    it('should have the correct basic properties', () => {
      expect(ideaConfig.name).toBe('IntelliJ IDEA');
      expect(ideaConfig.description).toBe('JetBrains IntelliJ IDEA');
    });
    
    it('should have the correct number of config files', () => {
      expect(ideaConfig.content.length).toBe(2);
    });
    
    it('should generate the eslint.xml config file', () => {
      const eslintConfig = ideaConfig.content.find(c => c.filePath === '.idea/jsLinters/eslint.xml');
      expect(eslintConfig).toBeDefined();
      
      const template = eslintConfig.template();
      expect(template).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(template).toContain('<component name="EslintConfiguration">');
      expect(template).toContain('<option name="fix-on-save" value="true" />');
    });
    
    it('should generate the prettier.xml config file', () => {
      const prettierConfig = ideaConfig.content.find(c => c.filePath === '.idea/prettier.xml');
      expect(prettierConfig).toBeDefined();
      
      const template = prettierConfig.template();
      expect(template).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(template).toContain('<component name="PrettierConfiguration">');
      expect(template).toContain('<option name="myRunOnSave" value="true" />');
    });
  });

  describe('VS Code configuration', () => {
    const vscodeConfig = IDE_CONFIG[EIde.VS_CODE];
    
    it('should have the correct basic properties', () => {
      expect(vscodeConfig.name).toBe('VS Code');
      expect(vscodeConfig.description).toBe('Visual Studio Code editor');
    });
    
    it('should have the correct number of config files', () => {
      expect(vscodeConfig.content.length).toBe(1);
    });
    
    it('should generate the settings.json config file', () => {
      const settingsConfig = vscodeConfig.content.find(c => c.filePath === '.vscode/settings.json');
      expect(settingsConfig).toBeDefined();
      
      const template = settingsConfig.template();
      expect(template).toContain('"editor.formatOnSave": true');
      expect(template).toContain('"editor.defaultFormatter": "esbenp.prettier-vscode"');
      
      // Verify it's valid JSON
      const parsed = JSON.parse(template);
      expect(parsed).toHaveProperty('editor.codeActionsOnSave');
      expect(parsed).toHaveProperty('eslint.validate');
      expect(Array.isArray(parsed['eslint.validate'])).toBe(true);
      expect(parsed['eslint.validate'].length).toBe(7); // Verify all language validators are present
    });
  });
});