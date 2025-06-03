interface ITestingConfig {
	e2eConfigTemplate: (isTypeScript: boolean, isCoverageEnabled: boolean) => string;
	unitConfigTemplate: (isTypeScript: boolean, isCoverageEnabled: boolean) => string;
}

export const TESTING_CONFIG: ITestingConfig = {
	e2eConfigTemplate: (isTypeScript: boolean, isCoverageEnabled: boolean): string => {
		const imports: Array<string> = [];

		if (isTypeScript) {
			imports.push('import tsconfigPaths from "vite-tsconfig-paths";');
		}
		imports.push('import { defineConfig } from "vitest/config";');

		const plugins: Array<string> = [];

		if (isTypeScript) {
			plugins.push("tsconfigPaths()");
		}

		const coverageConfig: string = isCoverageEnabled
			? `
		coverage: {
			include: ["src/**/*"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},`
			: "";

		return `${imports.join("\n")}

export default defineConfig({${
			plugins.length > 0
				? `
	plugins: [${plugins.join(", ")}],`
				: ""
		}
	publicDir: false,
	test: {${coverageConfig}
		environment: "node",
		exclude: ["node_modules/**/*"],
		globals: true,
		include: ["test/e2e/**/*.test.${isTypeScript ? "ts" : "js"}"],
		root: ".",
		testTimeout: 10_000,
		watch: false,
	},
});
`;
	},

	unitConfigTemplate: (isTypeScript: boolean, isCoverageEnabled: boolean): string => {
		const imports: Array<string> = [];

		if (isTypeScript) {
			imports.push('import tsconfigPaths from "vite-tsconfig-paths";');
		}
		imports.push('import { defineConfig } from "vitest/config";');

		const plugins: Array<string> = [];

		if (isTypeScript) {
			plugins.push("tsconfigPaths()");
		}

		const coverageConfig: string = isCoverageEnabled
			? `
		coverage: {
			include: ["src/**/*"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},`
			: "";

		return `${imports.join("\n")}

export default defineConfig({${
			plugins.length > 0
				? `
	plugins: [${plugins.join(", ")}],`
				: ""
		}
	publicDir: false,
	test: {${coverageConfig}
		environment: "node",
		exclude: ["node_modules/**/*"],
		globals: true,
		include: ["test/unit/**/*.test.${isTypeScript ? "ts" : "js"}"],
		root: ".",
		testTimeout: 10_000,
		watch: false,
	},
});
`;
	},
};
