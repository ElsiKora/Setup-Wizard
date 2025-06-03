import { describe, it, expect } from "vitest";
import { LINT_STAGED_CONFIG } from "../../../../bin/application/constant/lint-staged/config.constant.js";
import { SEMANTIC_RELEASE_CONFIG } from "../../../../bin/application/constant/semantic-release/config.constant.js";
import { ESLINT_CONFIG } from "../../../../bin/application/constant/eslint/config.constant.js";
import { ELintStagedFeature } from "../../../../bin/domain/enum/lint-staged-feature.enum.js";
import { EEslintFeature } from "../../../../bin/domain/enum/eslint-feature.enum.js";

describe("Application Constants E2E test", () => {
	describe("LINT_STAGED_CONFIG", () => {
		it("should export LINT_STAGED_CONFIG as an object with a template function", () => {
			expect(LINT_STAGED_CONFIG).toBeDefined();
			expect(typeof LINT_STAGED_CONFIG).toBe("object");
			expect(typeof LINT_STAGED_CONFIG.template).toBe("function");
		});

		it("should generate a basic lint-staged config with no features", () => {
			const config = LINT_STAGED_CONFIG.template([]);

			// Should have the basic structure with no commands
			expect(config).toContain("export default {");
			expect(config).toContain('"*": (files) => {');
			expect(config).toContain("const commands = [];");
			expect(config).toContain("return commands;");

			// Should not contain any feature-specific commands
			expect(config).not.toContain("prettier");
			expect(config).not.toContain("eslint");
			expect(config).not.toContain("stylelint");
		});

		it("should include prettier commands when prettier feature is enabled", () => {
			const config = LINT_STAGED_CONFIG.template([ELintStagedFeature.PRETTIER]);

			expect(config).toContain('commands.push("prettier --write --ignore-unknown");');
			expect(config).not.toContain("eslint");
			expect(config).not.toContain("stylelint");
		});

		it("should include eslint commands when eslint feature is enabled", () => {
			const config = LINT_STAGED_CONFIG.template([ELintStagedFeature.ESLINT]);

			expect(config).not.toContain("prettier");
			expect(config).toContain("const eslintFiles = files.filter");
			expect(config).toContain("eslint --fix --max-warnings=0 --no-warn-ignored");
			expect(config).not.toContain("stylelint");
		});

		it("should include stylelint commands when stylelint feature is enabled", () => {
			const config = LINT_STAGED_CONFIG.template([ELintStagedFeature.STYLELINT]);

			expect(config).not.toContain("prettier");
			expect(config).not.toContain("eslint");
			expect(config).toContain("const styleFiles = files.filter");
			expect(config).toContain("stylelint --fix");
		});

		it("should include all commands when all features are enabled", () => {
			const config = LINT_STAGED_CONFIG.template([ELintStagedFeature.PRETTIER, ELintStagedFeature.ESLINT, ELintStagedFeature.STYLELINT]);

			expect(config).toContain('commands.push("prettier --write --ignore-unknown");');
			expect(config).toContain("const eslintFiles = files.filter");
			expect(config).toContain("eslint --fix --max-warnings=0 --no-warn-ignored");
			expect(config).toContain("const styleFiles = files.filter");
			expect(config).toContain("stylelint --fix");
		});
	});

	describe("SEMANTIC_RELEASE_CONFIG", () => {
		it("should export SEMANTIC_RELEASE_CONFIG as an object with a template function", () => {
			expect(SEMANTIC_RELEASE_CONFIG).toBeDefined();
			expect(typeof SEMANTIC_RELEASE_CONFIG).toBe("object");
			expect(typeof SEMANTIC_RELEASE_CONFIG.template).toBe("function");
		});

		it("should generate a basic semantic-release config with required parameters", () => {
			const repositoryUrl = "https://github.com/test/repo.git";
			const mainBranch = "main";

			const config = SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch);

			// Should have the basic structure
			expect(config).toContain('import process from "node:process";');
			expect(config).toContain("const config = {");
			expect(config).toContain(`branches: [`);
			expect(config).toContain(`"${mainBranch}"`);
			expect(config).toContain(`repositoryUrl: "${repositoryUrl}"`);

			// Should have the default plugins
			expect(config).toContain("@semantic-release/commit-analyzer");
			expect(config).toContain("@semantic-release/release-notes-generator");
			expect(config).toContain("@semantic-release/github");
			expect(config).toContain("@semantic-release/npm");
			expect(config).toContain("@semantic-release/changelog");
			expect(config).toContain("@semantic-release/git");

			// Should not have backmerge plugin
			expect(config).not.toContain("@saithodev/semantic-release-backmerge");
		});

		it("should include pre-release configuration when preReleaseBranch and preReleaseChannel are provided", () => {
			const repositoryUrl = "https://github.com/test/repo.git";
			const mainBranch = "main";
			const preReleaseBranch = "develop";
			const preReleaseChannel = "beta";

			const config = SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel);

			expect(config).toContain(`channel: "${preReleaseChannel}"`);
			expect(config).toContain(`name: "${preReleaseBranch}"`);
			expect(config).toContain("prerelease: true");
		});

		it("should include backmerge configuration when isBackmergeEnabled and developBranch are provided", () => {
			const repositoryUrl = "https://github.com/test/repo.git";
			const mainBranch = "main";
			const isBackmergeEnabled = true;
			const developBranch = "develop";

			const config = SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, undefined, undefined, isBackmergeEnabled, developBranch);

			expect(config).toContain("@saithodev/semantic-release-backmerge");
			expect(config).toContain(`backmergeBranches: ["${developBranch}"]`);
			expect(config).toContain('backmergeStrategy: "rebase"');
		});

		it("should include both pre-release and backmerge configurations when all parameters are provided", () => {
			const repositoryUrl = "https://github.com/test/repo.git";
			const mainBranch = "main";
			const preReleaseBranch = "beta";
			const preReleaseChannel = "preview";
			const isBackmergeEnabled = true;
			const developBranch = "develop";

			const config = SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel, isBackmergeEnabled, developBranch);

			expect(config).toContain(`channel: "${preReleaseChannel}"`);
			expect(config).toContain(`name: "${preReleaseBranch}"`);
			expect(config).toContain("prerelease: true");
			expect(config).toContain("@saithodev/semantic-release-backmerge");
			expect(config).toContain(`backmergeBranches: ["${developBranch}"]`);
		});

		it("should set default value for isBackmergeEnabled when not provided", () => {
			const repositoryUrl = "https://github.com/test/repo.git";
			const mainBranch = "main";
			const developBranch = "develop";

			// Not providing isBackmergeEnabled (should default to false)
			const config = SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, undefined, undefined, undefined, developBranch);

			// Should not include backmerge configurations
			expect(config).not.toContain("@saithodev/semantic-release-backmerge");
		});
	});

	describe("ESLINT_CONFIG", () => {
		it("should export ESLINT_CONFIG as an object with a template function", () => {
			expect(ESLINT_CONFIG).toBeDefined();
			expect(typeof ESLINT_CONFIG).toBe("object");
			expect(typeof ESLINT_CONFIG.template).toBe("function");
		});

		it("should generate a basic ESLint config with ignores and no features", () => {
			const ignores = ["node_modules", "dist", "build"];
			const features: Array<EEslintFeature> = [];

			const config = ESLINT_CONFIG.template(ignores, features);

			// Should have the basic structure
			expect(config).toContain("import { createConfig } from '@elsikora/eslint-config';");
			expect(config).toContain("const config = {");
			expect(config).toContain(`ignores: ${JSON.stringify(ignores, null, 2)}`);
			expect(config).toContain("export default [config,");
			expect(config).toContain("...(await createConfig({");
			expect(config).toContain("}))]");

			// Should not contain any feature configurations
			expect(config).not.toContain("withTypescript: true");
			expect(config).not.toContain("withReact: true");
		});

		it("should include feature configuration flags for provided features", () => {
			const ignores = ["node_modules", "dist"];
			const features = [EEslintFeature.TYPESCRIPT, EEslintFeature.REACT, EEslintFeature.NODE];

			const config = ESLINT_CONFIG.template(ignores, features);

			// Should include feature config flags
			expect(config).toContain("withTypescript: true");
			expect(config).toContain("withReact: true");
			expect(config).toContain("withNode: true");

			// Should not include other feature flags
			expect(config).not.toContain("withJsx: true");
			expect(config).not.toContain("withNext: true");
		});

		it("should correctly format multiple feature flags", () => {
			const ignores = ["node_modules"];
			const features = [EEslintFeature.TYPESCRIPT, EEslintFeature.REACT];

			const config = ESLINT_CONFIG.template(ignores, features);

			// Check that feature flags are formatted correctly with newlines between them
			expect(config).toContain("  withTypescript: true,\n  withReact: true");
		});

		it("should properly handle empty ignores array", () => {
			const ignores: string[] = [];
			const features = [EEslintFeature.JAVASCRIPT];

			const config = ESLINT_CONFIG.template(ignores, features);

			expect(config).toContain("ignores: []");
			expect(config).toContain("withJavascript: true");
		});
	});
});
