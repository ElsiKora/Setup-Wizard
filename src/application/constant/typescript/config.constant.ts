interface ITypeScriptConfig {
	compilerOptions: Record<string, unknown>;
	exclude: Array<string>;
	include: Array<string>;
}

interface ITypescriptConfigConstant {
	template: (baseUrl: string, rootDirectory: string, outputDirectory: string, isCleanArchitectureEnabled: boolean, isDecoratorsEnabled: boolean) => string;
}

export const TYPESCRIPT_CONFIG: ITypescriptConfigConstant = {
	template: (baseUrl: string, rootDirectory: string, outputDirectory: string, isCleanArchitectureEnabled: boolean, isDecoratorsEnabled: boolean): string => {
		/* eslint-disable @elsikora/typescript/naming-convention */
		const config: ITypeScriptConfig = {
			compilerOptions: {
				alwaysStrict: true,
				baseUrl,
				declaration: true,
				declarationMap: true,
				esModuleInterop: true,
				forceConsistentCasingInFileNames: true,
				module: "ESNext",
				moduleResolution: "bundler",
				noFallthroughCasesInSwitch: true,
				noImplicitAny: true,
				noImplicitReturns: true,
				noImplicitThis: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				outDir: outputDirectory,
				rootDir: rootDirectory,
				skipLibCheck: true,
				sourceMap: true,
				strict: true,
				strictBindCallApply: true,
				strictFunctionTypes: true,
				strictNullChecks: true,
				strictPropertyInitialization: true,
				target: "ESNext",
			},
			exclude: ["node_modules", outputDirectory.replace(/^\.\//, "")],
			include: [`${rootDirectory.replace(/^\.\//, "")}/**/*`],
		};
		/* eslint-enable @elsikora/typescript/naming-convention */

		// Add clean architecture paths if enabled
		if (isCleanArchitectureEnabled) {
			config.compilerOptions.paths = {
				"@application/*": ["application/*"],
				"@domain/*": ["domain/*"],
				"@infrastructure/*": ["infrastructure/*"],
				"@presentation/*": ["presentation/*"],
			};
		}

		// Add decorator options if enabled
		if (isDecoratorsEnabled) {
			config.compilerOptions.emitDecoratorMetadata = true;
			config.compilerOptions.experimentalDecorators = true;
		}

		// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
		return JSON.stringify(config, null, 2);
	},
};
