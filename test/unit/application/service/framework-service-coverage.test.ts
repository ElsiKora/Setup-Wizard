import { describe, it, expect, vi, beforeEach } from "vitest";
import { FrameworkService } from "../../../../src/application/service/framework.service";
import { EEslintFeature } from "../../../../src/domain/enum/eslint-feature.enum";
import { EFramework } from "../../../../src/domain/enum/framework.enum";
import type { IFrameworkConfig } from "../../../../src/domain/interface/framework-config.interface";

describe("FrameworkService Coverage Tests", () => {
	// Mocks
	const mockFileSystemService = {
		isPathExists: vi.fn(),
		writeFile: vi.fn(),
		readFile: vi.fn(),
	};

	const mockPackageJsonService = {
		hasDependency: vi.fn(),
	};

	// Service instance
	let frameworkService: FrameworkService;

	beforeEach(() => {
		vi.clearAllMocks();

		// Initialize with mocks
		frameworkService = new FrameworkService(mockFileSystemService as any, mockPackageJsonService as any);
	});

	describe("checkFileIndicators", () => {
		it("should return false when file indicators are empty or undefined", async () => {
			// Create a framework config without file indicators (should hit lines 86-88)
			const frameworkConfig: IFrameworkConfig = {
				enum: EFramework.ANGULAR,
				displayName: "Angular",
				description: "Angular framework",
				eslintFeatures: [EEslintFeature.TYPESCRIPT],
				fileIndicators: [], // Empty array
			};

			// Call the private method
			const result = await (frameworkService as any).checkFileIndicators(frameworkConfig);

			// Expect false without checking files
			expect(result).toBe(false);
			expect(mockFileSystemService.isPathExists).not.toHaveBeenCalled();
		});

		it("should return false when file indicators are undefined", async () => {
			// Create a framework config without file indicators (should hit lines 86-88)
			const frameworkConfig: IFrameworkConfig = {
				enum: EFramework.ANGULAR,
				displayName: "Angular",
				description: "Angular framework",
				eslintFeatures: [EEslintFeature.TYPESCRIPT],
				// fileIndicators is undefined
			};

			// Call the private method
			const result = await (frameworkService as any).checkFileIndicators(frameworkConfig);

			// Expect false without checking files
			expect(result).toBe(false);
			expect(mockFileSystemService.isPathExists).not.toHaveBeenCalled();
		});
	});
});
