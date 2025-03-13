import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EEslintFeature } from '../../../../src/domain/enum/eslint-feature.enum';
import { EPackageJsonDependencyType } from '../../../../src/domain/enum/package-json-dependency-type.enum';
import type { IFileSystemService } from '../../../../src/application/interface/file-system-service.interface';
import type { PackageJsonService } from '../../../../src/application/service/package-json.service';
import type { IFrameworkConfig } from '../../../../src/domain/interface/framework-config.interface';

// Mock the framework config constant
vi.mock('../../../../src/domain/constant/framework-config.constant', () => {
  return {
    FRAMEWORK_CONFIG: {
      react: {
        name: 'react',
        displayName: 'React',
        description: 'React library',
        features: [EEslintFeature.REACT],
        fileIndicators: ['src/index.jsx', 'src/App.jsx'],
        packageIndicators: {
          dependencies: ['react', 'react-dom'],
          devDependencies: ['@types/react'],
          either: ['react-router'],
        },
        ignorePath: {
          directories: ['node_modules', 'build'],
          patterns: ['*.min.js'],
        },
        isSupportWatch: true,
        lintPaths: ['src/**/*.{js,jsx,ts,tsx}'],
      },
      typescript: {
        name: 'typescript',
        displayName: 'TypeScript',
        description: 'TypeScript language',
        features: [EEslintFeature.TYPESCRIPT],
        fileIndicators: ['tsconfig.json'],
        packageIndicators: {
          dependencies: [],
          devDependencies: ['typescript'],
        },
        ignorePath: {
          directories: ['dist'],
          patterns: ['*.js.map'],
        },
        isSupportWatch: true,
        lintPaths: ['src/**/*.ts'],
      },
    }
  };
});

// Import after mocking
import { FrameworkService } from '../../../../src/application/service/framework.service';

describe('FrameworkService', () => {
  let frameworkService: FrameworkService;
  let mockFileSystemService: IFileSystemService;
  let mockPackageJsonService: PackageJsonService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock services
    mockFileSystemService = {
      isPathExists: vi.fn(),
    } as unknown as IFileSystemService;

    mockPackageJsonService = {
      getDependencies: vi.fn(),
    } as unknown as PackageJsonService;
    
    // Create service instance
    frameworkService = new FrameworkService(mockFileSystemService, mockPackageJsonService);
  });

  describe('constructor', () => {
    it('should initialize with the provided services', () => {
      expect(frameworkService.FILE_SYSTEM_SERVICE).toBe(mockFileSystemService);
      expect(frameworkService.PACKAGE_JSON_SERVICE).toBe(mockPackageJsonService);
    });
  });

  describe('detect', () => {
    it('should detect frameworks based on file indicators', async () => {
      // Mock file checks to indicate React files exist but not TypeScript
      mockFileSystemService.isPathExists.mockImplementation((path: string) => {
        return Promise.resolve(path.includes('jsx'));
      });

      // Mock package dependencies to be empty
      mockPackageJsonService.getDependencies.mockResolvedValue({});

      const result = await frameworkService.detect();

      // Should detect React framework
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('react');
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith('src/index.jsx');
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith('src/App.jsx');
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith('tsconfig.json');
    });

    it('should detect frameworks based on package indicators', async () => {
      // Mock file checks to indicate no files exist
      mockFileSystemService.isPathExists.mockResolvedValue(false);
      
      // Mock dependencies to show TypeScript is installed
      mockPackageJsonService.getDependencies.mockImplementation((type: EPackageJsonDependencyType) => {
        if (type === EPackageJsonDependencyType.DEV) {
          return Promise.resolve({ 'typescript': '4.5.0' });
        }
        return Promise.resolve({});
      });

      const result = await frameworkService.detect();

      // Should detect TypeScript framework
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('typescript');
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.PROD);
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.DEV);
    });

    it('should detect multiple frameworks', async () => {
      // Mock file checks to indicate React files exist
      mockFileSystemService.isPathExists.mockImplementation((path: string) => {
        return Promise.resolve(path.includes('jsx') || path.includes('tsconfig.json'));
      });
      
      // Mock dependencies to show React and TypeScript are installed
      mockPackageJsonService.getDependencies.mockImplementation((type: EPackageJsonDependencyType) => {
        if (type === EPackageJsonDependencyType.PROD) {
          return Promise.resolve({ 'react': '17.0.0', 'react-dom': '17.0.0' });
        }
        if (type === EPackageJsonDependencyType.DEV) {
          return Promise.resolve({ 'typescript': '4.5.0' });
        }
        return Promise.resolve({});
      });

      const result = await frameworkService.detect();

      // Should detect both React and TypeScript frameworks
      expect(result).toHaveLength(2);
      expect(result.map(f => f.name)).toContain('react');
      expect(result.map(f => f.name)).toContain('typescript');
    });

    it('should return empty array when no frameworks are detected', async () => {
      // Mock file checks to indicate no files exist
      mockFileSystemService.isPathExists.mockResolvedValue(false);
      
      // Mock dependencies to be empty
      mockPackageJsonService.getDependencies.mockResolvedValue({});

      const result = await frameworkService.detect();

      // Should detect no frameworks
      expect(result).toHaveLength(0);
    });
  });

  describe('getFeatures', () => {
    it('should extract unique features from frameworks', () => {
      // Create framework configs for testing
      const frameworks: IFrameworkConfig[] = [
        {
          name: 'react',
          displayName: 'React',
          description: 'React library',
          features: [EEslintFeature.REACT, EEslintFeature.JSX_A11Y],
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { directories: [], patterns: [] },
          isSupportWatch: true,
          lintPaths: [],
        },
        {
          name: 'typescript',
          displayName: 'TypeScript',
          description: 'TypeScript language',
          features: [EEslintFeature.TYPESCRIPT, EEslintFeature.JSX_A11Y], // Note duplicate JSX_A11Y
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { directories: [], patterns: [] },
          isSupportWatch: true,
          lintPaths: [],
        },
      ];

      const features = frameworkService.getFeatures(frameworks);

      // Should return unique features (3 unique features from the 4 total)
      expect(features).toHaveLength(3);
      expect(features).toContain(EEslintFeature.REACT);
      expect(features).toContain(EEslintFeature.JSX_A11Y);
      expect(features).toContain(EEslintFeature.TYPESCRIPT);
    });

    it('should return empty array for empty input', () => {
      const features = frameworkService.getFeatures([]);
      expect(features).toHaveLength(0);
    });
  });

  describe('getIgnorePatterns', () => {
    it('should extract unique ignore patterns from frameworks', () => {
      // Create framework configs for testing
      const frameworks: IFrameworkConfig[] = [
        {
          name: 'react',
          displayName: 'React',
          description: 'React library',
          features: [],
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { 
            directories: ['node_modules', 'build'], 
            patterns: ['*.min.js'] 
          },
          isSupportWatch: true,
          lintPaths: [],
        },
        {
          name: 'typescript',
          displayName: 'TypeScript',
          description: 'TypeScript language',
          features: [],
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { 
            directories: ['node_modules', 'dist'], // Note duplicate node_modules
            patterns: ['*.js.map'] 
          },
          isSupportWatch: true,
          lintPaths: [],
        },
      ];

      const patterns = frameworkService.getIgnorePatterns(frameworks);

      // Should include expanded directories and patterns
      expect(patterns).toContain('node_modules/**/*');
      expect(patterns).toContain('build/**/*');
      expect(patterns).toContain('dist/**/*');
      expect(patterns).toContain('*.min.js');
      expect(patterns).toContain('*.js.map');
      
      // Should return unique patterns (5 unique patterns)
      expect(patterns).toHaveLength(5);
    });

    it('should return empty array for empty input', () => {
      const patterns = frameworkService.getIgnorePatterns([]);
      expect(patterns).toHaveLength(0);
    });
  });

  describe('getLintPaths', () => {
    it('should return default paths regardless of frameworks', () => {
      // Create framework configs for testing
      const frameworks: IFrameworkConfig[] = [
        {
          name: 'react',
          displayName: 'React',
          description: 'React library',
          features: [],
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { directories: [], patterns: [] },
          isSupportWatch: true,
          lintPaths: ['src/**/*.jsx'],
        },
        {
          name: 'typescript',
          displayName: 'TypeScript',
          description: 'TypeScript language',
          features: [],
          fileIndicators: [],
          packageIndicators: {},
          ignorePath: { directories: [], patterns: [] },
          isSupportWatch: true,
          lintPaths: ['src/**/*.ts'],
        },
      ];

      const paths = frameworkService.getLintPaths(frameworks);

      // Should return the default path "./"
      expect(paths).toEqual(["./"]); 
    });
  });

  describe('private methods through detect tests', () => {
    it('should check file indicators correctly', async () => {
      // This test indirectly tests checkFileIndicators through detect

      // Mock one file existing and one not
      mockFileSystemService.isPathExists.mockImplementation((path: string) => {
        return Promise.resolve(path === 'src/index.jsx');
      });
      
      mockPackageJsonService.getDependencies.mockResolvedValue({});

      await frameworkService.detect();

      // Verify the file checks were made
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith('src/index.jsx');
      expect(mockFileSystemService.isPathExists).toHaveBeenCalledWith('src/App.jsx');
    });

    it('should check package indicators correctly', async () => {
      // This test indirectly tests checkPackageIndicators through detect

      mockFileSystemService.isPathExists.mockResolvedValue(false);
      
      // Mock different dependency types
      mockPackageJsonService.getDependencies.mockImplementation((type: EPackageJsonDependencyType) => {
        if (type === EPackageJsonDependencyType.PROD) {
          return Promise.resolve({ 'react': '17.0.0' });
        }
        return Promise.resolve({});
      });

      const result = await frameworkService.detect();

      // Should detect React based on package
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('react');
      
      // Verify the package checks were made
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.PROD);
      expect(mockPackageJsonService.getDependencies).toHaveBeenCalledWith(EPackageJsonDependencyType.DEV);
    });

    it('should detect a framework when either file or package is found', async () => {
      // Mock file not found
      mockFileSystemService.isPathExists.mockResolvedValue(false);
      
      // Mock package found in "either" category
      mockPackageJsonService.getDependencies.mockImplementation((type: EPackageJsonDependencyType) => {
        if (type === EPackageJsonDependencyType.PROD) {
          return Promise.resolve({ 'react-router': '6.0.0' });
        }
        return Promise.resolve({});
      });

      const result = await frameworkService.detect();

      // Should detect React based on "either" package
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('react');
    });
  });
});