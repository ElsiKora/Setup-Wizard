
import {IPackageJsonScripts} from "../../domain/interface/package-json-scripts.interface";
import {EFramework} from "../../domain/enum/framework.enum";
import {EEslintFeature} from "../../domain/enum/eslint-feature.enum";
import {IFrameworkConfig} from "../../domain/interface/framework-config.interface";

export class PackageJsonScriptsGeneratorService {
    generateLintScripts(frameworks: IFrameworkConfig[], customPaths: string[]): IPackageJsonScripts {
        const lintPaths = frameworks.length > 0 ?
            frameworks.flatMap(f => f.lintPaths).join(' ') :
            customPaths.join(' ');

        const baseScripts: IPackageJsonScripts = {
            lint: `eslint ${lintPaths}`,
            'lint:fix': `eslint ${lintPaths} --fix`,
        };

        if (frameworks.length > 0) {
            return this.addFrameworkSpecificLintScripts(baseScripts, frameworks);
        }

        return baseScripts;
    }

    private addFrameworkSpecificLintScripts(scripts: IPackageJsonScripts, frameworks: IFrameworkConfig[]): IPackageJsonScripts {
        const watchableFrameworks = [EFramework.EXPRESS, EFramework.FASTIFY, EFramework.KOA, EFramework.NEST, EFramework.NEXT];
        const hasWatchableFramework = frameworks.some(f => watchableFrameworks.includes(f.name));
        const hasTypescript = frameworks.some(f => f.features.includes(EEslintFeature.TYPESCRIPT));

        if (hasWatchableFramework) {
            const watchPaths = frameworks
                .filter(f => watchableFrameworks.includes(f.name))
                .flatMap(f => f.lintPaths)
                .join(' ');
            scripts['lint:watch'] = `npx eslint-watch ${watchPaths}`;
        }

        if (hasTypescript) {
            scripts['lint:types'] = 'tsc --noEmit';
            scripts['lint:all'] = 'npm run lint && npm run lint:types';
        }

        const hasTestFramework = frameworks.some(f => [EFramework.ANGULAR, EFramework.NEST].includes(f.name));
        if (hasTestFramework) {
            scripts['lint:test'] = 'eslint "**/*.spec.ts"';
            scripts['lint:all'] = 'npm run lint && npm run lint:types && npm run lint:test';
        }

        return scripts;
    }
}
