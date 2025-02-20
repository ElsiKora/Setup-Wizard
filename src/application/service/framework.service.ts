import { FRAMEWORK_CONFIG } from "../../domain/constant/framework-config.constant";
import { EFramework } from "../../domain/enum/framework.enum";
import { PackageJsonService } from "./package-json.service";
import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import { IFileSystemService } from "../interface/file-system-service.interface";

export class FrameworkService {
  constructor(
    private readonly fileSystemService: IFileSystemService,
    private readonly packageJsonService: PackageJsonService,
  ) {}

  async detect(): Promise<IFrameworkConfig[]> {
    const detectedFrameworks: IFrameworkConfig[] = [];
    const frameworkEntries = Object.entries(FRAMEWORK_CONFIG) as [
      EFramework,
      IFrameworkConfig,
    ][];

    for (const [_, config] of frameworkEntries) {
      if (await this.isFrameworkDetected(config)) {
        detectedFrameworks.push(config);
      }
    }

    return detectedFrameworks;
  }

  private async isFrameworkDetected(
    config: IFrameworkConfig,
  ): Promise<boolean> {
    const [hasRequiredFiles, hasRequiredPackages] = await Promise.all([
      this.checkFileIndicators(config),
      this.checkPackageIndicators(config),
    ]);

    return hasRequiredFiles || hasRequiredPackages;
  }

  private async checkFileIndicators(
    config: IFrameworkConfig,
  ): Promise<boolean> {
    if (!config.fileIndicators?.length) {
      return false;
    }

    const fileChecks = config.fileIndicators.map((file) =>
      this.fileSystemService.isPathExists(file),
    );

    const results = await Promise.all(fileChecks);
    return results.some((exists: any) => exists);
  }

  private async checkPackageIndicators(
    config: IFrameworkConfig,
  ): Promise<boolean> {
    const [dependencies, devDependencies] = await Promise.all([
      this.packageJsonService.getDependencies("dependencies"),
      this.packageJsonService.getDependencies("devDependencies"),
    ]);

    const {
      dependencies: depIndicators = [],
      devDependencies: devDepIndicators = [],
      either = [],
    } = config.packageIndicators;

    return (
      depIndicators.some((pkg) => pkg in dependencies) ||
      devDepIndicators.some((pkg) => pkg in devDependencies) ||
      either.some((pkg) => pkg in dependencies || pkg in devDependencies)
    );
  }

  getLintPaths(frameworks: IFrameworkConfig[]): string[] {
    return ["./"];
    //return Array.from(new Set(frameworks.flatMap((f) => f.lintPaths)));
  }

  getIgnorePatterns(frameworks: IFrameworkConfig[]): string[] {
    return Array.from(
      new Set(
        frameworks.flatMap((f) => [
          ...f.ignorePath.directories.map((directory) => `${directory}/**/*`),
          ...f.ignorePath.patterns,
        ]),
      ),
    );
  }

  getFeatures(frameworks: IFrameworkConfig[]): EEslintFeature[] {
    return Array.from(new Set(frameworks.flatMap((f) => f.features)));
  }
}
