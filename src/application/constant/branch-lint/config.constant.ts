/**
 * Configuration constant for branch-lint.
 * Provides a template function for generating branch-lint configuration files.
 */
export const BRANCH_LINT_CONFIG: {
	/**
	 * Generates a branch-lint configuration file content.
	 * @param isTicketIdEnabled - Whether ticket placeholder is enabled in branch pattern
	 * @returns String content for the branch-lint configuration file
	 */
	template: (isTicketIdEnabled: boolean) => string;
} = {
	/**
	 * Generates a branch-lint configuration file content.
	 * Creates a configuration with branch types, ignore patterns, and validation rules.
	 * @param isTicketIdEnabled - Whether ticket placeholder is enabled in branch pattern
	 * @returns String content for the branch-lint configuration file
	 */
	template: (isTicketIdEnabled: boolean) => {
		const branchPattern: string = isTicketIdEnabled ? ":type/:ticket-:name" : ":type/:name";

		return `export default {
  branches: {
    bugfix: { description: "🐞 Fixing issues in existing functionality", title: "Bugfix" },
    feature: { description: "✨ Integration of new functionality", title: "Feature" },
    hotfix: { description: "🚑 Critical fixes for urgent issues", title: "Hotfix" },
    release: { description: "📦 Preparing a new release version", title: "Release" },
    support: { description: "🛠️ Support and maintenance tasks", title: "Support" },
  },
  ignore: ["dev"],
  rules: {
    "branch-max-length": 50,
    "branch-min-length": 5,
    "branch-pattern": "${branchPattern}",
    "branch-prohibited": ["main", "master", "release"],
    "branch-subject-pattern": "[a-z0-9-]+",
  },
};`;
	},
};
