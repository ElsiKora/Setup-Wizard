import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import type { EFramework } from "../../domain/enum/framework.enum";
import type { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";

import type { PackageJsonService } from "./package-json.service";

import { FRAMEWORK_CONFIG } from "../../domain/constant/framework-config.constant";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";

export class FrameworkService {
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	constructor(fileSystemService: IFileSystemService, packageJsonService: PackageJsonService) {
		this.PACKAGE_JSON_SERVICE = packageJsonService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	async detect(): Promise<Array<IFrameworkConfig>> {
		const detectedFrameworks: Array<IFrameworkConfig> = [];

		const frameworkEntries: Array<[EFramework, IFrameworkConfig]> = Object.entries(FRAMEWORK_CONFIG) as Array<[EFramework, IFrameworkConfig]>;

		for (const [, config] of frameworkEntries) {
			if (await this.isFrameworkDetected(config)) {
				detectedFrameworks.push(config);
			}
		}

		return detectedFrameworks;
	}

	getFeatures(frameworks: Array<IFrameworkConfig>): Array<EEslintFeature> {
		return [...new Set(frameworks.flatMap((f: IFrameworkConfig) => f.features))];
	}

	getIgnorePatterns(frameworks: Array<IFrameworkConfig>): Array<string> {
		return [...new Set(frameworks.flatMap((f: IFrameworkConfig) => [...f.ignorePath.directories.map((directory: string) => `${directory}/**/*`), ...f.ignorePath.patterns]))];
	}

	getLintPaths(frameworks: Array<IFrameworkConfig>): Array<string> {
		return ["./"];
		// return Array.from(new Set(frameworks.flatMap((f) => f.lintPaths)));
	}

	private async checkFileIndicators(config: IFrameworkConfig): Promise<boolean> {
		if (!config.fileIndicators?.length) {
			return false;
		}

		const fileChecks: Array<Promise<boolean>> = config.fileIndicators.map((file: string) => this.FILE_SYSTEM_SERVICE.isPathExists(file));

		const results: Array<Awaited<boolean>> = await Promise.all(fileChecks);

		return results.some(Boolean);
	}

	private async checkPackageIndicators(config: IFrameworkConfig): Promise<boolean> {
		const [dependencies, devDependencies]: Array<Awaited<Record<string, string>>> = await Promise.all([this.PACKAGE_JSON_SERVICE.getDependencies(EPackageJsonDependencyType.PROD), this.PACKAGE_JSON_SERVICE.getDependencies(EPackageJsonDependencyType.DEV)]);

		const {
			dependencies: depIndicators = [],
			devDependencies: developmentDepIndicators = [],
			either = [],
		}: {
			dependencies?: Array<string>;
			devDependencies?: Array<string>;
			either?: Array<string>;
		} = config.packageIndicators;

		return depIndicators.some((packageName: string) => packageName in dependencies) || developmentDepIndicators.some((packageName: string) => packageName in devDependencies) || either.some((packageName: string) => packageName in dependencies || packageName in devDependencies);
	}

	private async isFrameworkDetected(config: IFrameworkConfig): Promise<boolean> {
		const [hasRequiredFiles, hasRequiredPackages]: Array<Awaited<boolean>> = await Promise.all([this.checkFileIndicators(config), this.checkPackageIndicators(config)]);

		return hasRequiredFiles || hasRequiredPackages;
	}
}
