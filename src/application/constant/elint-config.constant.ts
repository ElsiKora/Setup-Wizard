/* eslint-disable @elsikora-typescript/no-magic-numbers */
import type { EEslintFeature } from "../../domain/enum/eslint-feature.enum";

import { ESLINT_FEATURE_CONFIG } from "../../domain/constant/eslint-feature-config.constant";

/**
 * Configuration constant for ESLint.
 * Provides a template function for generating ESLint configuration files.
 */
export const ESLINT_CONFIG: {
	/**
	 * Generates an ESLint configuration file content.
	 * @param ignores - Array of file patterns to ignore in linting
	 * @param features - Array of ESLint features to enable
	 * @returns String content for the ESLint configuration file
	 */
	template: (ignores: Array<string>, features: Array<EEslintFeature>) => string;
} = {
	/**
	 * Generates an ESLint configuration file content.
	 * Creates a configuration file that uses @elsikora/eslint-config with the specified features.
	 * @param ignores - Array of file patterns to ignore in linting
	 * @param features - Array of ESLint features to enable
	 * @returns String content for the ESLint configuration file
	 */
	template: (ignores: Array<string>, features: Array<EEslintFeature>) => {
		const featureConfig: string = features.map((feature: EEslintFeature) => `  ${ESLINT_FEATURE_CONFIG[feature].configFlag}: true`).join(",\n");

		return `import { createConfig } from '@elsikora/eslint-config';

const config = {
  ignores: ${JSON.stringify(ignores, null, 2)}
};

export default [config,
...(await createConfig({
${featureConfig}
}))];`;
	},
};
