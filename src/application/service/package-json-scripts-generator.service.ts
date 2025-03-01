import type { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import type { TPackageJsonScripts } from "../../domain/type/package-json-scripts.type";

import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { EFramework } from "../../domain/enum/framework.enum";

/**
 * Service for generating package.json scripts based on project configuration.
 * Provides functionality to create appropriate lint, test, and build scripts
 * for different frameworks and project setups.
 */
export class PackageJsonScriptsGeneratorService {
	/**
	 * Generates lint-related npm scripts based on detected frameworks.
	 * Creates appropriate scripts for linting, fixing, watching, and type checking.
	 *
	 * @param frameworks - Array of detected frameworks in the project
	 * @param customPaths - Array of custom file paths to lint if no frameworks are detected
	 * @returns Object containing generated npm scripts
	 */
	generateLintScripts(frameworks: Array<IFrameworkConfig>, customPaths: Array<string>): TPackageJsonScripts {
		const lintPaths: string = frameworks.length > 0 ? frameworks.flatMap((f: IFrameworkConfig) => f.lintPaths).join(" ") : customPaths.join(" ");

		const baseScripts: TPackageJsonScripts = {
			lint: `eslint ${lintPaths}`,
			"lint:fix": `eslint ${lintPaths} --fix`,
		};

		if (frameworks.length > 0) {
			return this.addFrameworkSpecificLintScripts(baseScripts, frameworks);
		}

		return baseScripts;
	}

	/**
	 * Adds framework-specific lint scripts based on detected frameworks.
	 * Includes watch scripts for supported frameworks, TypeScript type checking,
	 * and test linting where appropriate.
	 *
	 * @param scripts - Base scripts object to add framework-specific scripts to
	 * @param frameworks - Array of detected frameworks in the project
	 * @returns Extended scripts object with framework-specific lint scripts
	 */
	private addFrameworkSpecificLintScripts(scripts: TPackageJsonScripts, frameworks: Array<IFrameworkConfig>): TPackageJsonScripts {
		const watchableFrameworks: Set<EFramework> = new Set<EFramework>([EFramework.EXPRESS, EFramework.FASTIFY, EFramework.KOA, EFramework.NEST, EFramework.NEXT]);
		const hasWatchableFramework: boolean = frameworks.some((f: IFrameworkConfig) => watchableFrameworks.has(f.name));
		const hasTypescript: boolean = frameworks.some((f: IFrameworkConfig) => f.features.includes(EEslintFeature.TYPESCRIPT));

		if (hasWatchableFramework) {
			const watchPaths: string = frameworks
				.filter((f: IFrameworkConfig) => watchableFrameworks.has(f.name))
				.flatMap((f: IFrameworkConfig) => f.lintPaths)
				.join(" ");
			scripts["lint:watch"] = `npx eslint-watch ${watchPaths}`;
		}

		if (hasTypescript) {
			scripts["lint:types"] = "tsc --noEmit";
			scripts["lint:all"] = "npm run lint && npm run lint:types";
		}

		const hasTestFramework: boolean = frameworks.some((f: IFrameworkConfig) => [EFramework.ANGULAR, EFramework.NEST].includes(f.name));

		if (hasTestFramework) {
			scripts["lint:test"] = 'eslint "**/*.spec.ts"';
			scripts["lint:all"] = "npm run lint && npm run lint:types && npm run lint:test";
		}

		return scripts;
	}
}
