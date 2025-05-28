import { ETestingFramework } from "../../../domain/enum/testing-framework.enum";

import { TESTING_E2E_TEST_PATH, TESTING_JASMINE_CLI_COMMAND, TESTING_JEST_CLI_COMMAND, TESTING_MOCHA_CLI_COMMAND, TESTING_MOCHA_E2E_PATTERN, TESTING_MOCHA_UNIT_PATTERN, TESTING_NODEMON_CLI_COMMAND, TESTING_NYC_CLI_COMMAND, TESTING_UNIT_TEST_PATH, TESTING_VITEST_CLI_COMMAND } from "./package-names.constant";

interface ITestingScripts {
	testAll: {
		command: () => string;
		name: string;
	};
	testE2e: {
		command: (framework: ETestingFramework, configFile: string) => string;
		name: string;
	};
	testE2eWatch: {
		command: (framework: ETestingFramework, configFile: string) => string;
		name: string;
	};
	testUnit: {
		command: (framework: ETestingFramework, configFile: string) => string;
		name: string;
	};
	testUnitCoverage: {
		command: (framework: ETestingFramework, configFile: string) => string;
		name: string;
	};
	testUnitWatch: {
		command: (framework: ETestingFramework, configFile: string) => string;
		name: string;
	};
}

export const TESTING_CONFIG_SCRIPTS: ITestingScripts = {
	testAll: {
		command: (): string => "npm run test:unit && npm run test:e2e",
		name: "test:all",
	},
	testE2e: {
		command: (framework: ETestingFramework, configFile: string): string => {
			switch (framework) {
				case ETestingFramework.JASMINE: {
					return `${TESTING_JASMINE_CLI_COMMAND} --config=${configFile}`;
				}

				case ETestingFramework.JEST: {
					return `${TESTING_JEST_CLI_COMMAND} --config ${configFile}`;
				}

				case ETestingFramework.MOCHA: {
					return `${TESTING_MOCHA_CLI_COMMAND} ${TESTING_MOCHA_E2E_PATTERN}`;
				}

				case ETestingFramework.VITEST: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_E2E_TEST_PATH} --config ${configFile}`;
				}

				default: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_E2E_TEST_PATH} --config ${configFile}`;
				}
			}
		},
		name: "test:e2e",
	},
	testE2eWatch: {
		command: (framework: ETestingFramework, configFile: string): string => {
			switch (framework) {
				case ETestingFramework.JASMINE: {
					return `${TESTING_NODEMON_CLI_COMMAND} --exec '${TESTING_JASMINE_CLI_COMMAND} --config=${configFile}'`;
				}

				case ETestingFramework.JEST: {
					return `${TESTING_JEST_CLI_COMMAND} --watch --config ${configFile}`;
				}

				case ETestingFramework.MOCHA: {
					return `${TESTING_MOCHA_CLI_COMMAND} --watch ${TESTING_MOCHA_E2E_PATTERN}`;
				}

				case ETestingFramework.VITEST: {
					return `${TESTING_VITEST_CLI_COMMAND} ${TESTING_E2E_TEST_PATH} --config ${configFile}`;
				}

				default: {
					return `${TESTING_VITEST_CLI_COMMAND} ${TESTING_E2E_TEST_PATH} --config ${configFile}`;
				}
			}
		},
		name: "test:e2e:watch",
	},
	testUnit: {
		command: (framework: ETestingFramework, configFile: string): string => {
			switch (framework) {
				case ETestingFramework.JASMINE: {
					return `${TESTING_JASMINE_CLI_COMMAND} --config=${configFile}`;
				}

				case ETestingFramework.JEST: {
					return `${TESTING_JEST_CLI_COMMAND} --config ${configFile}`;
				}

				case ETestingFramework.MOCHA: {
					return `${TESTING_MOCHA_CLI_COMMAND} ${TESTING_MOCHA_UNIT_PATTERN}`;
				}

				case ETestingFramework.VITEST: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_UNIT_TEST_PATH} --config ${configFile}`;
				}

				default: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_UNIT_TEST_PATH} --config ${configFile}`;
				}
			}
		},
		name: "test:unit",
	},
	testUnitCoverage: {
		command: (framework: ETestingFramework, configFile: string): string => {
			switch (framework) {
				case ETestingFramework.JASMINE: {
					return `${TESTING_NYC_CLI_COMMAND} ${TESTING_JASMINE_CLI_COMMAND} --config=${configFile}`;
				}

				case ETestingFramework.JEST: {
					return `${TESTING_JEST_CLI_COMMAND} --coverage --config ${configFile}`;
				}

				case ETestingFramework.MOCHA: {
					return `${TESTING_NYC_CLI_COMMAND} ${TESTING_MOCHA_CLI_COMMAND} ${TESTING_MOCHA_UNIT_PATTERN}`;
				}

				case ETestingFramework.VITEST: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_UNIT_TEST_PATH} --config ${configFile} --coverage`;
				}

				default: {
					return `${TESTING_VITEST_CLI_COMMAND} run ${TESTING_UNIT_TEST_PATH} --config ${configFile} --coverage`;
				}
			}
		},
		name: "test:unit:coverage",
	},
	testUnitWatch: {
		command: (framework: ETestingFramework, configFile: string): string => {
			switch (framework) {
				case ETestingFramework.JASMINE: {
					return `${TESTING_NODEMON_CLI_COMMAND} --exec '${TESTING_JASMINE_CLI_COMMAND} --config=${configFile}'`;
				}

				case ETestingFramework.JEST: {
					return `${TESTING_JEST_CLI_COMMAND} --watch --config ${configFile}`;
				}

				case ETestingFramework.MOCHA: {
					return `${TESTING_MOCHA_CLI_COMMAND} --watch ${TESTING_MOCHA_UNIT_PATTERN}`;
				}

				case ETestingFramework.VITEST: {
					return `${TESTING_VITEST_CLI_COMMAND} ${TESTING_UNIT_TEST_PATH} --config ${configFile}`;
				}

				default: {
					return `${TESTING_VITEST_CLI_COMMAND} ${TESTING_UNIT_TEST_PATH} --config ${configFile}`;
				}
			}
		},
		name: "test:unit:watch",
	},
};
