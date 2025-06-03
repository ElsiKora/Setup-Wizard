import { describe, it, expect } from "vitest";
import { ESLINT_FEATURE_CONFIG } from "../../../../src/domain/constant/eslint-feature-config.constant";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";

describe("ESLINT_FEATURE_CONFIG", () => {
	it("should define configuration for all ESLint features", () => {
		expect(ESLINT_FEATURE_CONFIG).toBeDefined();

		// Check that we have configs for all enum values
		const allFeatures = Object.values(EEslintFeature);
		allFeatures.forEach((feature) => {
			expect(ESLINT_FEATURE_CONFIG[feature]).toBeDefined();
		});

		// Check number of configs matches number of enum values
		expect(Object.keys(ESLINT_FEATURE_CONFIG).length).toBe(allFeatures.length);
	});

	it("should have correct structure for each feature config", () => {
		// Check structure of each feature config
		Object.entries(ESLINT_FEATURE_CONFIG).forEach(([feature, config]) => {
			expect(config).toHaveProperty("configFlag");
			expect(config).toHaveProperty("description");
			expect(config).toHaveProperty("packages");
			expect(Array.isArray(config.packages)).toBe(true);

			// Check format of configFlag (should be camelCase with "with" prefix)
			expect(config.configFlag).toMatch(/^with[A-Z]/);

			// Check description is not empty
			expect(config.description.length).toBeGreaterThan(0);
		});
	});

	it("should mark JavaScript as required", () => {
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.JAVASCRIPT].isRequired).toBe(true);
	});

	it("should have correct detect property for frameworks", () => {
		// React should have detect property
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.REACT]).toHaveProperty("detect");
		expect(Array.isArray(ESLINT_FEATURE_CONFIG[EEslintFeature.REACT].detect)).toBe(true);
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.REACT].detect).toContain("react");

		// TypeScript should have detect property
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TYPESCRIPT]).toHaveProperty("detect");
		expect(Array.isArray(ESLINT_FEATURE_CONFIG[EEslintFeature.TYPESCRIPT].detect)).toBe(true);
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TYPESCRIPT].detect).toContain("typescript");

		// Node should have detect property
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NODE]).toHaveProperty("detect");
		expect(Array.isArray(ESLINT_FEATURE_CONFIG[EEslintFeature.NODE].detect)).toBe(true);
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NODE].detect).toContain("node");
	});

	it("should mark TypeScript dependencies appropriately", () => {
		// Nest requires TypeScript
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEST].isRequiresTypescript).toBe(true);
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEST].packages).toContain("@elsikora/eslint-plugin-nestjs-typed");

		// TypeORM requires TypeScript
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TYPEORM].isRequiresTypescript).toBe(true);
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TYPEORM].packages).toContain("eslint-plugin-typeorm-typescript");
	});

	it("should have appropriate package dependencies for features", () => {
		// FSD should have FSD plugin
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.FSD].packages).toContain("@conarti/eslint-plugin-feature-sliced");

		// React should have React plugins
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.REACT].packages).toContain("@eslint-react/eslint-plugin");
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.REACT].packages).toContain("eslint-plugin-react");

		// JSX should have a11y plugin
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.JSX].packages).toContain("eslint-plugin-jsx-a11y");

		// I18next should have i18next plugin
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.I18NEXT].packages).toContain("eslint-plugin-i18next");

		// NO_SECRETS should have no-secrets plugin
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NO_SECRETS].packages).toContain("eslint-plugin-no-secrets");

		// Storybook should have storybook plugin
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.STORYBOOK].packages).toContain("eslint-plugin-storybook");
	});

	it("should detect Tailwind CSS correctly", () => {
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TAILWIND_CSS]).toHaveProperty("detect");
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.TAILWIND_CSS].detect).toContain("tailwindcss");
	});

	it("should detect Next.js correctly", () => {
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEXT]).toHaveProperty("detect");
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEXT].detect).toContain("next");
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEXT].detect).toContain("next/types");
		expect(ESLINT_FEATURE_CONFIG[EEslintFeature.NEXT].packages).toContain("@next/eslint-plugin-next");
	});

	it("should access all features to ensure full code coverage", () => {
		// This test ensures we access all properties of all features
		Object.values(EEslintFeature).forEach((feature) => {
			const config = ESLINT_FEATURE_CONFIG[feature];
			// Access all properties
			const { configFlag, description, packages, detect, isRequired, isRequiresTypescript } = config;

			// Verify basic properties exist
			expect(configFlag).toBeDefined();
			expect(description).toBeDefined();
			expect(packages).toBeDefined();

			// Optional properties may or may not exist
			if (detect) expect(Array.isArray(detect)).toBe(true);
			if (isRequired !== undefined) expect(typeof isRequired).toBe("boolean");
			if (isRequiresTypescript !== undefined) expect(typeof isRequiresTypescript).toBe("boolean");
		});
	});
});
