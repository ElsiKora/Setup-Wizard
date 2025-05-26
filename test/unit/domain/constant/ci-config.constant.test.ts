import { describe, it, expect } from "vitest";
import { CI_CONFIG } from "../../../../src/domain/constant/ci-config.constant";
import { ECiModule } from "../../../../src/domain/enum/ci-module.enum";
import { ECiProvider } from "../../../../src/domain/enum/ci-provider.enum";

describe("CI_CONFIG", () => {
	it("should exist and be correctly structured", () => {
		expect(CI_CONFIG).toBeDefined();
		expect(CI_CONFIG[ECiModule.CODECOMMIT_SYNC]).toBeDefined();
		expect(CI_CONFIG[ECiModule.RELEASE]).toBeDefined();
	});

	it("should have correct structure for CI modules", () => {
		// Check that each CI module has required properties
		Object.values(ECiModule).forEach((module) => {
			const moduleConfig = CI_CONFIG[module];
			expect(moduleConfig).toBeDefined();
			expect(moduleConfig.content).toBeDefined();

			// Check providers
			Object.values(ECiProvider).forEach((provider) => {
				if (moduleConfig.content[provider]) {
					expect(moduleConfig.content[provider].filePath).toBeDefined();
					expect(moduleConfig.content[provider].template).toBeDefined();
					expect(typeof moduleConfig.content[provider].template).toBe("function");
				}
			});
		});
	});

	it("should generate GitHub workflows content correctly", () => {
		// Test the template functions for various modules

		// CODECOMMIT_SYNC
		const codecommitTemplate = CI_CONFIG[ECiModule.CODECOMMIT_SYNC].content[ECiProvider.GITHUB].template();
		expect(codecommitTemplate).toContain("name: Mirror to CodeCommit");
		expect(codecommitTemplate).toContain("jobs:");
		expect(codecommitTemplate).toContain("mirror_to_codecommit:");

		// RELEASE
		const releaseTemplate = CI_CONFIG[ECiModule.RELEASE].content[ECiProvider.GITHUB].template();
		expect(releaseTemplate).toContain("name: Release");
	});

	it("should handle properties parameter in templates", () => {
		// Test that templates accept properties parameters
		const codecommitTemplate = CI_CONFIG[ECiModule.CODECOMMIT_SYNC].content[ECiProvider.GITHUB].template();

		// Verify template is a string with content
		expect(typeof codecommitTemplate).toBe("string");
		expect(codecommitTemplate.length).toBeGreaterThan(0);

		// Test with empty object parameter
		const templateWithEmptyProps = CI_CONFIG[ECiModule.CODECOMMIT_SYNC].content[ECiProvider.GITHUB].template({});
		expect(typeof templateWithEmptyProps).toBe("string");
		expect(templateWithEmptyProps.length).toBeGreaterThan(0);
	});

	it("should ensure CI templates have proper provider configuration", () => {
		// Check that all modules have at least one provider
		Object.values(ECiModule).forEach((module) => {
			const moduleConfig = CI_CONFIG[module];

			// Each module should have content with at least one provider
			const hasAnyProvider = Object.values(ECiProvider).some((provider) => moduleConfig.content[provider] !== undefined);

			expect(hasAnyProvider).toBe(true);
		});

		// Verify that GitHub provider is commonly used
		const githubProviderCount = Object.values(ECiModule).filter((module) => CI_CONFIG[module].content[ECiProvider.GITHUB] !== undefined).length;

		// Most modules should support GitHub
		expect(githubProviderCount).toBeGreaterThan(1);
	});
});
