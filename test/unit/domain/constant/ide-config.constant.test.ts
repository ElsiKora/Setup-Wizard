import { describe, it, expect } from "vitest";
import { IDE_CONFIG } from "../../../../src/domain/constant/ide-config.constant";
import { EIde } from "../../../../src/domain/enum/ide.enum";

describe("IDE_CONFIG constant", () => {
	it("should have config for IntelliJ IDEA", () => {
		expect(IDE_CONFIG[EIde.INTELLIJ_IDEA]).toBeDefined();
		expect(IDE_CONFIG[EIde.INTELLIJ_IDEA].name).toBe("IntelliJ IDEA");
		expect(IDE_CONFIG[EIde.INTELLIJ_IDEA].description).toBe("JetBrains IntelliJ IDEA");
		expect(IDE_CONFIG[EIde.INTELLIJ_IDEA].content).toHaveLength(2);
	});

	it("should have config for VS Code", () => {
		expect(IDE_CONFIG[EIde.VS_CODE]).toBeDefined();
		expect(IDE_CONFIG[EIde.VS_CODE].name).toBe("VS Code");
		expect(IDE_CONFIG[EIde.VS_CODE].description).toBe("Visual Studio Code editor");
		expect(IDE_CONFIG[EIde.VS_CODE].content).toHaveLength(1);
	});

	describe("Template functions", () => {
		it("should generate correct IntelliJ IDEA eslint.xml template", () => {
			const eslintTemplate = IDE_CONFIG[EIde.INTELLIJ_IDEA].content[0].template();

			expect(eslintTemplate).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(eslintTemplate).toContain('<component name="EslintConfiguration">');
			expect(eslintTemplate).toContain('<option name="fix-on-save" value="true" />');
			expect(eslintTemplate).toContain('<files-pattern value="**/*.{js,jsx,ts,tsx,vue,html,json,yaml,yml}" />');
		});

		it("should generate correct IntelliJ IDEA prettier.xml template", () => {
			const prettierTemplate = IDE_CONFIG[EIde.INTELLIJ_IDEA].content[1].template();

			expect(prettierTemplate).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(prettierTemplate).toContain('<component name="PrettierConfiguration">');
			expect(prettierTemplate).toContain('<option name="myRunOnSave" value="true" />');
			expect(prettierTemplate).toContain('<option name="myRunOnReformat" value="true" />');
		});

		it("should generate correct VS Code settings.json template", () => {
			const settingsTemplate = IDE_CONFIG[EIde.VS_CODE].content[0].template();

			expect(settingsTemplate).toContain('"editor.codeActionsOnSave"');
			expect(settingsTemplate).toContain('"source.fixAll.eslint": "explicit"');
			expect(settingsTemplate).toContain('"editor.formatOnSave": true');
			expect(settingsTemplate).toContain('"prettier.requireConfig": true');

			// Verify it's valid JSON
			const parsedSettings = JSON.parse(settingsTemplate);
			expect(parsedSettings).toHaveProperty("editor.defaultFormatter", "esbenp.prettier-vscode");
			expect(parsedSettings).toHaveProperty("eslint.validate");

			// Verify eslint validate array contains proper items
			const eslintValidate = parsedSettings["eslint.validate"];
			expect(Array.isArray(eslintValidate)).toBe(true);
			expect(eslintValidate.length).toBe(7);

			// Check one specific item
			expect(eslintValidate.some((item: any) => item === "typescript")).toBe(true);
		});
	});
});
