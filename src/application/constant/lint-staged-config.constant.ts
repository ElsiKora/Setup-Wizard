import { LINT_STAGED_FEATURE_CONFIG } from "../../domain/constant/lint-staged-feature-config.constant";
import { ELintStagedFeature } from "../../domain/enum/lint-staged-feature.enum";

/**
 * Configuration constant for lint-staged.
 * Provides a template function for generating lint-staged configuration files.
 */
export const LINT_STAGED_CONFIG: {
	/**
	 * Generates a lint-staged configuration file content.
	 *
	 * @param features - Array of lint-staged features to enable
	 * @returns String content for the lint-staged configuration file
	 */
	template: (features: Array<ELintStagedFeature>) => string;
} = {
	/**
	 * Generates a lint-staged configuration file content.
	 * Creates a JavaScript configuration file that dynamically applies linting tools
	 * based on file extensions and enabled features.
	 *
	 * @param features - Array of lint-staged features to enable
	 * @returns String content for the lint-staged configuration file
	 */
	template: (features: Array<ELintStagedFeature>) => {
		const lintCommands: Array<string> = [];
		const fileFilters: Array<string> = [];

		if (features.includes(ELintStagedFeature.PRETTIER)) {
			lintCommands.push('commands.push("prettier --write --ignore-unknown");');
		}

		if (features.includes(ELintStagedFeature.ESLINT)) {
			const extensions: Array<string> = LINT_STAGED_FEATURE_CONFIG[ELintStagedFeature.ESLINT].fileExtensions;
			fileFilters.push(`
        const eslintFiles = files.filter((file) => {
          const validExtensions = ${JSON.stringify(extensions)};
          const fileExtension = file.split(".").pop();
          const hasValidExtension = validExtensions.includes(fileExtension);
          const hasNoExtension = !file.includes(".");
          return hasValidExtension && !hasNoExtension;
        });

        if (eslintFiles.length > 0) {
          commands.push(\`eslint --fix --max-warnings=0 --no-ignore \${eslintFiles.join(" ")}\`);
        }`);
		}

		if (features.includes(ELintStagedFeature.STYLELINT)) {
			const extensions: Array<string> = LINT_STAGED_FEATURE_CONFIG[ELintStagedFeature.STYLELINT].fileExtensions;
			fileFilters.push(`
        const styleFiles = files.filter((file) => {
          const validExtensions = ${JSON.stringify(extensions)};
          const fileExtension = file.split(".").pop();
          return validExtensions.includes(fileExtension);
        });

        if (styleFiles.length > 0) {
          commands.push(\`stylelint --fix \${styleFiles.join(" ")}\`);
        }`);
		}

		return `export default {
  "*": (files) => {
    const commands = [];
    ${lintCommands.join("\n    ")}
    ${fileFilters.join("\n")}
    return commands;
  },
};`;
	},
};
