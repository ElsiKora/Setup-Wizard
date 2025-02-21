import type { IFrameworkConfig } from "../../domain/interface/framework-config.interface";
import type { TPackageJsonScripts } from "../../domain/type/package-json-scripts.type";

import { EEslintFeature } from "../../domain/enum/eslint-feature.enum";
import { EFramework } from "../../domain/enum/framework.enum";

export class PackageJsonScriptsGeneratorService {
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
