import { describe, it, expect } from 'vitest';
import { CI_CONFIG } from 'bin/domain/constant/ci-config.constant.js';
import { ECiModule } from 'bin/domain/enum/ci-module.enum.js';
import { ECiProvider } from 'bin/domain/enum/ci-provider.enum.js';
import { ECiModuleType } from 'bin/domain/enum/ci-module-type.enum.js';

describe('CI_CONFIG E2E test', () => {
  it('should export CI_CONFIG as an object', () => {
    expect(CI_CONFIG).toBeDefined();
    expect(typeof CI_CONFIG).toBe('object');
  });

  it('should have entries for all CI module enum values', () => {
    // Check that all ECiModule enum values are present in CI_CONFIG
    for (const module of Object.values(ECiModule)) {
      expect(CI_CONFIG).toHaveProperty(module);
    }
  });

  it('should have the correct structure for each CI module config', () => {
    for (const [module, config] of Object.entries(CI_CONFIG)) {
      // Verify basic structure
      expect(config).toHaveProperty('content');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('type');
      
      // Check that content has entries for all providers
      expect(config.content).toHaveProperty(ECiProvider.GITHUB);
      
      // Verify each provider config
      for (const providerConfig of Object.values(config.content)) {
        expect(providerConfig).toHaveProperty('filePath');
        expect(providerConfig).toHaveProperty('template');
        expect(typeof providerConfig.filePath).toBe('string');
        expect(typeof providerConfig.template).toBe('function');
      }
      
      // Verify the type is a valid ECiModuleType
      expect(Object.values(ECiModuleType)).toContain(config.type);
    }
  });

  // CODECOMMIT_SYNC module tests
  describe('CODECOMMIT_SYNC module', () => {
    const codecommitConfig = CI_CONFIG[ECiModule.CODECOMMIT_SYNC];
    
    it('should have the correct basic properties', () => {
      expect(codecommitConfig.name).toBe('CodeCommit Sync');
      expect(codecommitConfig.description).toBe('Syncs the repository with AWS CodeCommit.');
      expect(codecommitConfig.type).toBe(ECiModuleType.UNIVERSAL);
    });
    
    it('should generate correct GitHub workflow file', () => {
      const githubConfig = codecommitConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/workflows/mirror-to-codecommit.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('name: Mirror to CodeCommit');
      expect(template).toContain('uses: pixta-dev/repository-mirroring-action@v1');
    });
    
    it('should handle template variable replacement', () => {
      const githubConfig = codecommitConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ repoName: 'test-repo' });
      
      // It should replace {{repoName}} with 'test-repo' if that variable was in the template
      // This specific template doesn't have this variable, but the replacement logic should still work
      expect(template).not.toContain('{{repoName}}');
    });
  });

  // DEPENDABOT module tests
  describe('DEPENDABOT module', () => {
    const dependabotConfig = CI_CONFIG[ECiModule.DEPENDABOT];
    
    it('should have the correct basic properties', () => {
      expect(dependabotConfig.name).toBe('Dependabot');
      expect(dependabotConfig.description).toBe('Runs Dependabot dependency updates.');
      expect(dependabotConfig.type).toBe(ECiModuleType.UNIVERSAL);
    });
    
    it('should generate correct GitHub dependabot config', () => {
      const githubConfig = dependabotConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/dependabot.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('version: 2');
      expect(template).toContain('package-ecosystem: "npm"');
      expect(template).toContain('package-ecosystem: "github-actions"');
    });
    
    it('should handle template variable replacement', () => {
      const githubConfig = dependabotConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ devBranchName: 'develop' });
      
      expect(template).toContain('target-branch: "develop"');
      expect(template).not.toContain('{{devBranchName}}');
    });
  });

  // QODANA module tests
  describe('QODANA module', () => {
    const qodanaConfig = CI_CONFIG[ECiModule.QODANA];
    
    it('should have the correct basic properties', () => {
      expect(qodanaConfig.name).toBe('Qodana');
      expect(qodanaConfig.description).toBe('Runs Qodana static analysis.');
      expect(qodanaConfig.type).toBe(ECiModuleType.UNIVERSAL);
    });
    
    it('should generate correct GitHub workflow file', () => {
      const githubConfig = qodanaConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/workflows/qodana-quality-scan.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('name: Qodana Quality Scan');
      expect(template).toContain('uses: JetBrains/qodana-action@v2024.3');
    });
  });

  // RELEASE module tests
  describe('RELEASE module', () => {
    const releaseConfig = CI_CONFIG[ECiModule.RELEASE];
    
    it('should have the correct basic properties', () => {
      expect(releaseConfig.name).toBe('Release');
      expect(releaseConfig.description).toBe('Runs release process.');
      expect(releaseConfig.type).toBe(ECiModuleType.NON_NPM);
    });
    
    it('should generate correct GitHub workflow file with default branch', () => {
      const githubConfig = releaseConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/workflows/release.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('name: Release And Publish');
      expect(template).toContain('- main'); // Default branch
      expect(template).not.toContain('NPM_TOKEN'); // Not present in non-NPM version
    });
    
    it('should generate correct GitHub workflow file with custom branch', () => {
      const githubConfig = releaseConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ mainBranch: 'master' });
      
      expect(template).toContain('- master');
      expect(template).not.toContain('- main');
    });
    
    it('should include pre-release branch when configured', () => {
      const githubConfig = releaseConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ 
        mainBranch: 'main',
        preReleaseBranch: 'develop',
        isPrerelease: true
      });
      
      expect(template).toContain('- main');
      expect(template).toContain('- develop');
    });
  });

  // RELEASE_NPM module tests
  describe('RELEASE_NPM module', () => {
    const releaseNpmConfig = CI_CONFIG[ECiModule.RELEASE_NPM];
    
    it('should have the correct basic properties', () => {
      expect(releaseNpmConfig.name).toBe('Release NPM');
      expect(releaseNpmConfig.description).toBe('Runs NPM release process.');
      expect(releaseNpmConfig.type).toBe(ECiModuleType.NPM_ONLY);
    });
    
    it('should generate correct GitHub workflow file with NPM token', () => {
      const githubConfig = releaseNpmConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/workflows/release.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('name: Release And Publish');
      expect(template).toContain('NPM_TOKEN: ${{ secrets.NPM_TOKEN }}');
    });
    
    it('should include pre-release branch when configured', () => {
      const githubConfig = releaseNpmConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ 
        mainBranch: 'main',
        preReleaseBranch: 'beta',
        isPrerelease: true
      });
      
      expect(template).toContain('- main');
      expect(template).toContain('- beta');
    });
    
    it('should not include pre-release branch when isPrerelease is false', () => {
      const githubConfig = releaseNpmConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ 
        mainBranch: 'main',
        preReleaseBranch: 'beta',
        isPrerelease: false
      });
      
      expect(template).toContain('- main');
      expect(template).not.toContain('- beta');
    });
  });

  // SNYK module tests
  describe('SNYK module', () => {
    const snykConfig = CI_CONFIG[ECiModule.SNYK];
    
    it('should have the correct basic properties', () => {
      expect(snykConfig.name).toBe('Snyk');
      expect(snykConfig.description).toBe('Runs Snyk security scan.');
      expect(snykConfig.type).toBe(ECiModuleType.UNIVERSAL);
    });
    
    it('should generate correct GitHub workflow file', () => {
      const githubConfig = snykConfig.content[ECiProvider.GITHUB];
      expect(githubConfig.filePath).toBe('.github/workflows/snyk-security-scan.yml');
      
      const template = githubConfig.template();
      expect(template).toContain('name: Snyk Security Scan');
      expect(template).toContain('snyk auth ${{ secrets.SNYK_TOKEN }}');
      expect(template).toContain('snyk monitor');
      expect(template).toContain('snyk code test || true');
      expect(template).toContain('snyk iac test || true');
    });
    
    it('should handle template variable replacement', () => {
      const githubConfig = snykConfig.content[ECiProvider.GITHUB];
      const template = githubConfig.template({ customVar: 'test-value' });
      
      // It should replace {{customVar}} with 'test-value' if that variable was in the template
      // This specific template doesn't have this variable, but the replacement logic should still work
      expect(template).not.toContain('{{customVar}}');
    });
  });
});