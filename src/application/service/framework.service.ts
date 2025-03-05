import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import type { EFramework } from "../../domain/enum/framework.enum";
import type { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";

import type { PackageJsonService } from "./package-json.service";

import { FRAMEWORK_CONFIG } from "../../domain/constant/framework-config.constant";
import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";

/**
 * Service for detecting and working with frameworks in a project.
 * Provides methods to identify frameworks based on files and dependencies.
 */
export class FrameworkService {
	/** File system service for performing file operations */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/** Service for working with package.json */
	readonly PACKAGE_JSON_SERVICE: PackageJsonService;

	/**
	 * Initializes a new instance of the FrameworkService.
	 * @param fileSystemService - Service for file system operations
	 * @param packageJsonService - Service for managing package.json
	 */
	constructor(fileSystemService: IFileSystemService, packageJsonService: PackageJsonService) {
		this.PACKAGE_JSON_SERVICE = packageJsonService;
		this.FILE_SYSTEM_SERVICE = fileSystemService;
	}

	/**
	 * Detects frameworks used in the current project.
	 * Checks for framework indicators like specific files or dependencies.
	 * @returns Promise resolving to an array of detected framework configurations
	 */
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

	/**
	 * Extracts and returns unique ESLint features from a list of frameworks.
	 * @param frameworks - Array of framework configurations
	 * @returns Array of unique ESLint features from all frameworks
	 */
	getFeatures(frameworks: Array<IFrameworkConfig>): Array<EEslintFeature> {
		return [...new Set(frameworks.flatMap((f: IFrameworkConfig) => f.features))];
	}

	/**
	 * Gets ignore patterns for linting based on framework configurations.
	 * @param frameworks - Array of framework configurations
	 * @returns Array of file patterns to ignore during linting
	 */
	getIgnorePatterns(frameworks: Array<IFrameworkConfig>): Array<string> {
		return [...new Set(frameworks.flatMap((f: IFrameworkConfig) => [...f.ignorePath.directories.map((directory: string) => `${directory}/**/*`), ...f.ignorePath.patterns]))];
	}

	/**
	 * Gets paths to lint based on framework configurations.
	 * Currently returns the root directory, but could be extended to use framework-specific paths.
	 * @param frameworks - Array of framework configurations
	 * @returns Array of paths to lint
	 */
	getLintPaths(frameworks: Array<IFrameworkConfig>): Array<string> {
		return ["./"];
		// return Array.from(new Set(frameworks.flatMap((f) => f.lintPaths)));
	}

	/**
	 * Checks if framework-specific files exist in the project.
	 * @param config - Framework configuration to check
	 * @returns Promise resolving to true if any framework-specific files are found
	 */
	private async checkFileIndicators(config: IFrameworkConfig): Promise<boolean> {
		if (!config.fileIndicators?.length) {
			return false;
		}

		const fileChecks: Array<Promise<boolean>> = config.fileIndicators.map((file: string) => this.FILE_SYSTEM_SERVICE.isPathExists(file));

		const results: Array<Awaited<boolean>> = await Promise.all(fileChecks);

		return results.some(Boolean);
	}

	/**
	 * Checks if framework-specific packages are installed in the project.
	 * @param config - Framework configuration to check
	 * @returns Promise resolving to true if any framework-specific packages are found
	 */
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

	/**
	 * Determines if a framework is used in the project by checking files and packages.
	 * @param config - Framework configuration to check
	 * @returns Promise resolving to true if the framework is detected
	 */
	private async isFrameworkDetected(config: IFrameworkConfig): Promise<boolean> {
		const [hasRequiredFiles, hasRequiredPackages]: Array<Awaited<boolean>> = await Promise.all([this.checkFileIndicators(config), this.checkPackageIndicators(config)]);

		return hasRequiredFiles || hasRequiredPackages;
	}
}
