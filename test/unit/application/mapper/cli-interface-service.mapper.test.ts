import { describe, it, expect } from "vitest";
import { CliInterfaceServiceMapper } from "../../../../src/application/mapper/cli-interface-service.mapper";
import { ELicense } from "../../../../src/domain/enum/license.enum";
import type { ILicenseConfig } from "../../../../src/domain/interface/license-config.interface";

describe("CliInterfaceServiceMapper", () => {
	describe("fromLicenseConfigsToSelectOptions", () => {
		it("should convert license configs to select options correctly", () => {
			// Arrange
			const licenseConfigs: Record<ELicense, ILicenseConfig> = {
				[ELicense.MIT]: {
					name: "MIT License",
					content: "MIT License Content",
				},
				[ELicense.APACHE_2_0]: {
					name: "Apache License 2.0",
					content: "Apache 2.0 License Content",
				},
			};

			// Act
			const result = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(licenseConfigs);

			// Assert
			expect(result).toHaveLength(2);
			expect(result).toEqual([
				{
					label: `MIT License (${ELicense.MIT})`,
					value: ELicense.MIT,
				},
				{
					label: `Apache License 2.0 (${ELicense.APACHE_2_0})`,
					value: ELicense.APACHE_2_0,
				},
			]);
		});

		it("should handle empty license configs", () => {
			// Arrange
			const licenseConfigs: Record<ELicense, ILicenseConfig> = {};

			// Act
			const result = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(licenseConfigs);

			// Assert
			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});
	});
});
