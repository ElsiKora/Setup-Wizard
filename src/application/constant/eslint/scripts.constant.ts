interface IEslintConfigScripts {
	lint: IEslintScript;
	lintAll: IEslintScript;
	lintAllFix: IEslintScript;
	lintFix: IEslintScript;
	lintTypes: IEslintScript;
	lintTypesFix: IEslintScript;
	lintWatch: IEslintScript;
}

interface IEslintScript {
	command: (lintPaths: Array<string>) => string;
	name: string;
}

export const ESLINT_CONFIG_SCRIPTS: IEslintConfigScripts = {
	lint: {
		command: (lintPaths: Array<string>): string => `eslint ${lintPaths.length > 0 ? lintPaths.join(" ") : "."}`,
		name: "lint",
	},
	lintAll: {
		command: (): string => "npm run lint && npm run lint:types",
		name: "lint:all",
	},
	lintAllFix: {
		command: (): string => "npm run lint:fix && npm run lint:types:fix",
		name: "lint:all:fix",
	},
	lintFix: {
		command: (lintPaths: Array<string>): string => `eslint --fix ${lintPaths.length > 0 ? lintPaths.join(" ") : "."}`,
		name: "lint:fix",
	},
	lintTypes: {
		command: (): string => "tsc --noEmit",
		name: "lint:types",
	},
	lintTypesFix: {
		command: (): string => "tsc --noEmit --skipLibCheck",
		name: "lint:types:fix",
	},
	lintWatch: {
		command: (lintPaths: Array<string>): string => `npx eslint-watch ${lintPaths.join(" ")}`,
		name: "lint:watch",
	},
};
