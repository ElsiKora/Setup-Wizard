/* eslint-disable @elsikora/typescript/naming-convention,@elsikora/typescript/no-magic-numbers */
import type { IIdeConfig } from "../interface/ide-config.interface";

import { EIde } from "../enum/ide.enum";

/**
 * Configuration constant for IDE-specific settings.
 * Provides configuration details and template functions for generating
 * IDE-specific configuration files for different editors.
 */
export const IDE_CONFIG: Record<EIde, IIdeConfig> = {
	[EIde.INTELLIJ_IDEA]: {
		content: [
			{
				filePath: ".idea/jsLinters/eslint.xml",
				template: () => `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="EslintConfiguration">
    <option name="configurationDirPath" value="$PROJECT_DIR$" />
    <option name="additionalConfig" value="--fix" />
    <option name="fix-on-save" value="true" />
    <files-pattern value="**/*.{js,jsx,ts,tsx,vue,html,json,yaml,yml}" />
  </component>
</project>`,
			},
			{
				filePath: ".idea/prettier.xml",
				template: () => `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="PrettierConfiguration">
    <option name="myConfigurationMode" value="AUTOMATIC" />
    <option name="myRunOnSave" value="true" />
    <option name="myRunOnReformat" value="true" />
  </component>
</project>`,
			},
		],
		description: "JetBrains IntelliJ IDEA",
		name: "IntelliJ IDEA",
	},
	[EIde.VS_CODE]: {
		content: [
			{
				filePath: ".vscode/settings.json",
				template: () =>
					JSON.stringify(
						{
							"editor.codeActionsOnSave": {
								"source.fixAll.eslint": true,
								"source.fixAll.prettier": true,
							},
							"editor.defaultFormatter": "esbenp.prettier-vscode",
							"editor.formatOnSave": true,
							"eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact", "json", "jsonc", "yaml"],
							"explorer.confirmDelete": false,
							"explorer.confirmDragAndDrop": false,
							"files.insertFinalNewline": true,
							"files.trimTrailingWhitespace": true,
							"javascript.updateImportsOnFileMove.enabled": "always",
							"prettier.requireConfig": true,
							"typescript.updateImportsOnFileMove.enabled": "always",
							"workbench.editor.enablePreview": false,
						},
						null,
						2,
					),
			},
		],
		description: "Visual Studio Code editor",
		name: "VS Code",
	},
};
