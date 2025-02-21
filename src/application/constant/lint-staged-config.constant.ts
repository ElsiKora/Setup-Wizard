import { LINT_STAGED_FEATURE_CONFIG } from "../../domain/constant/lint-staged-feature-config.constant";
import { ELintStagedFeature } from "../../domain/enum/lint-staged-feature.enum";

export const LINT_STAGED_CONFIG: { template: (features: Array<ELintStagedFeature>) => string } = {
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
          commands.push(\`eslint --fix --max-warnings=0 \${eslintFiles.join(" ")}\`);
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
