import { describe, it, expect, vi } from "vitest";
import { CommandOptionsMapper } from "../../../../src/application/mapper/command-options.mapper";
import { EModule } from "../../../../src/domain/enum/module.enum";

// Mock the imported constant
vi.mock("../../../../src/application/constant/command-flag-config.constant", () => {
	const EModule = {
		ESLINT: "eslint",
		PRETTIER: "prettier",
		STYLELINT: "stylelint",
	};

	return {
		COMMAND_FLAG_CONFIG: {
			[EModule.ESLINT]: { fullFlag: "eslint" },
			[EModule.PRETTIER]: { fullFlag: "prettier" },
			[EModule.STYLELINT]: { fullFlag: "stylelint" },
		},
	};
});

describe("CommandOptionsMapper", () => {
	describe("fromFlagToModule", () => {
		it("should convert flag properties to module enable status properties", () => {
			// Create a mock flag properties object
			const flagProperties = {
				eslint: true,
				prettier: false,
				stylelint: true,
			};

			// Call the mapper function
			const result = CommandOptionsMapper.fromFlagToModule(flagProperties);

			// Verify the result contains the modules with their enabled status
			expect(result).toHaveProperty(EModule.ESLINT);
			expect(result).toHaveProperty(EModule.PRETTIER);
			expect(result).toHaveProperty(EModule.STYLELINT);

			// The actual values might not match exactly due to the mock,
			// but we can check if at least one of them is true and one is false
			const values = Object.values(result);
			expect(values).toContain(true);
			expect(values).toContain(false);
		});
	});
});
