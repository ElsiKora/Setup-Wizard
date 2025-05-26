import { describe, it, expect } from "vitest";
import { LICENSE_CONFIG } from "bin/domain/constant/license-config.constant.js";
import { ELicense } from "bin/domain/enum/license.enum.js";

describe("LICENSE_CONFIG E2E test", () => {
	it("should export LICENSE_CONFIG as an object", () => {
		expect(LICENSE_CONFIG).toBeDefined();
		expect(typeof LICENSE_CONFIG).toBe("object");
	});

	it("should have entries for all license enum values", () => {
		// Check that all ELicense enum values are present in LICENSE_CONFIG
		for (const license of Object.values(ELicense)) {
			expect(LICENSE_CONFIG).toHaveProperty(license);
		}
	});

	it("should have the correct structure for each license config", () => {
		for (const [license, config] of Object.entries(LICENSE_CONFIG)) {
			// Verify basic structure
			expect(config).toHaveProperty("description");
			expect(config).toHaveProperty("name");
			expect(config).toHaveProperty("template");

			// Verify types
			expect(typeof config.description).toBe("string");
			expect(typeof config.name).toBe("string");
			expect(typeof config.template).toBe("function");

			// Both description and name should not be empty
			expect(config.description.length).toBeGreaterThan(0);
			expect(config.name.length).toBeGreaterThan(0);
		}
	});

	// Test for template functions
	describe("License template functions", () => {
		it("should generate MIT license with year and author", () => {
			const mitConfig = LICENSE_CONFIG[ELicense.MIT];
			const year = "2023";
			const author = "John Doe";

			const template = mitConfig.template(year, author);

			expect(template).toContain("MIT License");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
			expect(template).toContain("Permission is hereby granted, free of charge, to any person obtaining a copy");
		});

		it("should generate GPL-3.0 license with year and author", () => {
			const gplConfig = LICENSE_CONFIG[ELicense.GPL_3_0];
			const year = "2023";
			const author = "John Doe";

			const template = gplConfig.template(year, author);

			expect(template).toContain("GNU GENERAL PUBLIC LICENSE");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
			expect(template).toContain("Version 3, 29 June 2007");
		});

		it("should generate Apache-2.0 license with year and author", () => {
			const apacheConfig = LICENSE_CONFIG[ELicense.APACHE_2_0];
			const year = "2023";
			const author = "John Doe";

			const template = apacheConfig.template(year, author);

			expect(template).toContain("Apache License");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
			expect(template).toContain("Version 2.0, January 2004");
		});

		it("should generate AGPL-3.0 license with year and author", () => {
			const agplConfig = LICENSE_CONFIG[ELicense.AGPL_3_0];
			const year = "2023";
			const author = "John Doe";

			const template = agplConfig.template(year, author);

			expect(template).toContain("GNU AFFERO GENERAL PUBLIC LICENSE");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
			expect(template).toContain("Version 3, 19 November 2007");
		});

		it("should generate BSL-1.0 license with year and author", () => {
			const bslConfig = LICENSE_CONFIG[ELicense.BSL_1_0];
			const year = "2023";
			const author = "John Doe";

			const template = bslConfig.template(year, author);

			expect(template).toContain("Boost Software License - Version 1.0");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
		});

		it("should generate ISC license with year and author", () => {
			const iscConfig = LICENSE_CONFIG[ELicense.ISC];
			const year = "2023";
			const author = "John Doe";

			const template = iscConfig.template(year, author);

			expect(template).toContain("ISC License");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
		});

		it("should generate LGPL-3.0 license with year and author", () => {
			const lgplConfig = LICENSE_CONFIG[ELicense.LGPL_3_0];
			const year = "2023";
			const author = "John Doe";

			const template = lgplConfig.template(year, author);

			expect(template).toContain("GNU LESSER GENERAL PUBLIC LICENSE");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
			expect(template).toContain("Version 3, 29 June 2007");
		});

		it("should generate MPL-2.0 license with year and author", () => {
			const mplConfig = LICENSE_CONFIG[ELicense.MPL_2_0];
			const year = "2023";
			const author = "John Doe";

			const template = mplConfig.template(year, author);

			expect(template).toContain("Mozilla Public License Version 2.0");
			expect(template).toContain(`Copyright (c) ${year} ${author}`);
		});

		it("should generate Unlicense without requiring year and author", () => {
			const unlicenseConfig = LICENSE_CONFIG[ELicense.UNLICENSED];

			// The Unlicense doesn't require year and author
			const template = unlicenseConfig.template("", "");

			expect(template).toContain("This is free and unencumbered software released into the public domain");
			expect(template).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
			expect(template).toContain("For more information, please refer to <https://unlicense.org>");
		});
	});
});
