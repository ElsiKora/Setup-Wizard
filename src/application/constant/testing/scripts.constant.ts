interface ITestingScripts {
	testAll: {
		command: string;
		name: string;
	};
	testE2e: {
		command: string;
		name: string;
	};
	testE2eWatch: {
		command: string;
		name: string;
	};
	testUnit: {
		command: string;
		name: string;
	};
	testUnitCoverage: {
		command: string;
		name: string;
	};
	testUnitWatch: {
		command: string;
		name: string;
	};
}

export const TESTING_CONFIG_SCRIPTS: ITestingScripts = {
	testAll: {
		command: "npm run test:unit && npm run test:e2e",
		name: "test:all",
	},
	testE2e: {
		command: "vitest run test/e2e --config vitest.e2e.config.js",
		name: "test:e2e",
	},
	testE2eWatch: {
		command: "vitest test/e2e --config vitest.e2e.config.js",
		name: "test:e2e:watch",
	},
	testUnit: {
		command: "vitest run test/unit --config vitest.unit.config.js",
		name: "test:unit",
	},
	testUnitCoverage: {
		command: "vitest run test/unit --config vitest.unit.config.js --coverage",
		name: "test:unit:coverage",
	},
	testUnitWatch: {
		command: "vitest test/unit --config vitest.unit.config.js",
		name: "test:unit:watch",
	},
};
