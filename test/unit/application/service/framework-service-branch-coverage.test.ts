import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EPackageJsonDependencyType } from '../../../../src/domain/enum/package-json-dependency-type.enum';
import type { IFileSystemService } from '../../../../src/application/interface/file-system-service.interface';
import type { PackageJsonService } from '../../../../src/application/service/package-json.service';
import type { IFrameworkConfig } from '../../../../src/domain/interface/framework-config.interface';

// Direct import for direct testing
import { FrameworkService } from '../../../../src/application/service/framework.service';

describe('FrameworkService Branch Coverage', () => {
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

  describe('checkFileIndicators method', () => {
    it('should return false when fileIndicators array is empty', async () => {
      // Create a direct test for the private method
      const emptyConfig: IFrameworkConfig = {
        name: 'empty',
        displayName: 'Empty',
        description: 'No file indicators',
        features: [],
        fileIndicators: [],
        packageIndicators: {},
        ignorePath: {
          directories: [],
          patterns: [],
        },
        isSupportWatch: true,
        lintPaths: [],
      };
      
      // Access the private method using type assertion
      const result = await (frameworkService as any).checkFileIndicators(emptyConfig);
      
      // Verify the method returns false for empty fileIndicators
      expect(result).toBe(false);
      
      // Ensure isPathExists was not called
      expect(mockFileSystemService.isPathExists).not.toHaveBeenCalled();
    });
    
    it('should return false when fileIndicators is undefined', async () => {
      // Create a config without fileIndicators property
      const configWithoutFileIndicators: IFrameworkConfig = {
        name: 'noIndicators',
        displayName: 'No Indicators',
        description: 'Undefined file indicators',
        features: [],
        // fileIndicators is intentionally omitted
        packageIndicators: {},
        ignorePath: {
          directories: [],
          patterns: [],
        },
        isSupportWatch: true,
        lintPaths: [],
      } as any; // Using any to bypass TypeScript checks
      
      // Access the private method using type assertion
      const result = await (frameworkService as any).checkFileIndicators(configWithoutFileIndicators);
      
      // Verify the method returns false for undefined fileIndicators
      expect(result).toBe(false);
      
      // Ensure isPathExists was not called
      expect(mockFileSystemService.isPathExists).not.toHaveBeenCalled();
    });
  });
});