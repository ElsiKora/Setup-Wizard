import { describe, it, expect } from "vitest";
import { FRAMEWORK_CONFIG } from "bin/domain/constant/framework-config.constant.js";
import { EFramework } from "bin/domain/enum/framework.enum.js";
import { EEslintFeature } from "bin/domain/enum/eslint-feature.enum.js";

describe("FRAMEWORK_CONFIG E2E test", () => {
	it("should export the framework config constant as an object", () => {
		expect(FRAMEWORK_CONFIG).toBeDefined();
		expect(typeof FRAMEWORK_CONFIG).toBe("object");
	});

	it("should have entries for all framework enum values", () => {
		// Ensure all EFramework enum values have a config entry
		for (const framework of Object.values(EFramework)) {
			expect(FRAMEWORK_CONFIG).toHaveProperty(framework);
		}
	});

	it("should have the correct structure for each framework config", () => {
		for (const [framework, config] of Object.entries(FRAMEWORK_CONFIG)) {
			// Verify structure of each config object
			expect(config).toHaveProperty("displayName");
			expect(typeof config.displayName).toBe("string");

			expect(config).toHaveProperty("features");
			expect(Array.isArray(config.features)).toBe(true);
			// Verify each feature is a valid EEslintFeature
			config.features.forEach((feature) => {
				expect(Object.values(EEslintFeature)).toContain(feature);
			});

			expect(config).toHaveProperty("ignorePath");
			expect(config.ignorePath).toHaveProperty("directories");
			expect(Array.isArray(config.ignorePath.directories)).toBe(true);
			expect(config.ignorePath).toHaveProperty("patterns");
			expect(Array.isArray(config.ignorePath.patterns)).toBe(true);

			expect(config).toHaveProperty("lintPaths");
			expect(Array.isArray(config.lintPaths)).toBe(true);

			expect(config).toHaveProperty("name");
			expect(config.name).toBe(framework);

			expect(config).toHaveProperty("packageIndicators");
			expect(typeof config.packageIndicators).toBe("object");
		}
	});

	it("should have correct specific configurations for known frameworks", () => {
		// Test a few specific framework configurations to ensure they're correct
		const reactConfig = FRAMEWORK_CONFIG[EFramework.REACT];
		expect(reactConfig.displayName).toBe("React");
		expect(reactConfig.features).toContain(EEslintFeature.REACT);
		expect(reactConfig.features).toContain(EEslintFeature.JSX);
		expect(reactConfig.packageIndicators.dependencies).toContain("react");
		expect(reactConfig.packageIndicators.dependencies).toContain("react-dom");

		const nestConfig = FRAMEWORK_CONFIG[EFramework.NEST];
		expect(nestConfig.displayName).toBe("NestJS");
		expect(nestConfig.features).toContain(EEslintFeature.NEST);
		expect(nestConfig.features).toContain(EEslintFeature.TYPESCRIPT);
		expect(nestConfig.packageIndicators.dependencies).toContain("@nestjs/core");
		expect(nestConfig.packageIndicators.dependencies).toContain("@nestjs/common");

		const viteConfig = FRAMEWORK_CONFIG[EFramework.VITE];
		expect(viteConfig.displayName).toBe("Vite");
		expect(viteConfig.fileIndicators).toContain("vite.config.js");
		expect(viteConfig.fileIndicators).toContain("vite.config.ts");
		expect(viteConfig.packageIndicators.devDependencies).toContain("vite");
	});

	it("should have the right properties for frameworks with isSupportWatch capability", () => {
		// Check frameworks that should have isSupportWatch property
		const expressConfig = FRAMEWORK_CONFIG[EFramework.EXPRESS];
		expect(expressConfig.isSupportWatch).toBe(true);

		const nestConfig = FRAMEWORK_CONFIG[EFramework.NEST];
		expect(nestConfig.isSupportWatch).toBe(true);

		const nextConfig = FRAMEWORK_CONFIG[EFramework.NEXT];
		expect(nextConfig.isSupportWatch).toBe(true);

		const fastifyConfig = FRAMEWORK_CONFIG[EFramework.FASTIFY];
		expect(fastifyConfig.isSupportWatch).toBe(true);

		const koaConfig = FRAMEWORK_CONFIG[EFramework.KOA];
		expect(koaConfig.isSupportWatch).toBe(true);
	});
});
