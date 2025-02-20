import { IIdeConfig } from '../interface/ide-config.interface';
import {EIde} from "../enum/ide.enum";

export const IDE_CONFIG: Record<EIde, IIdeConfig> = {
    [EIde.VS_CODE] :{
    name: "VS Code",
    description: "Visual Studio Code editor",
    content: [
            {
                filePath: '.vscode/settings.json',
                template: () => JSON.stringify({
                    "eslint.validate": [
                        { "language": "javascript", "autoFix": true },
                        { "language": "javascriptreact", "autoFix": true },
                        { "language": "typescript", "autoFix": true },
                        { "language": "typescriptreact", "autoFix": true },
                        { "language": "json", "autoFix": true },
                        { "language": "jsonc", "autoFix": true },
                        { "language": "yaml", "autoFix": true }
                    ],
                    "editor.codeActionsOnSave": {
                        "source.fixAll.eslint": true,
                        "source.fixAll.prettier": true
                    },
                    "editor.defaultFormatter": "esbenp.prettier-vscode",
                    "editor.formatOnSave": true,
                    "prettier.requireConfig": true,
                    "files.trimTrailingWhitespace": true,
                    "files.insertFinalNewline": true,
                    "typescript.updateImportsOnFileMove.enabled": "always",
                    "javascript.updateImportsOnFileMove.enabled": "always",
                    "explorer.confirmDelete": false,
                    "explorer.confirmDragAndDrop": false,
                    "workbench.editor.enablePreview": false
                }, null, 2)
            }
        ],
    },
    [EIde.INTELLIJ_IDEA]: {
        name: "IntelliJ IDEA",
        description: "JetBrains IntelliJ IDEA",
        content: [
            {
                filePath: '.idea/jsLinters/eslint.xml',
                template: () => `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="EslintConfiguration">
    <option name="configurationDirPath" value="$PROJECT_DIR$" />
    <option name="additionalConfig" value="--fix" />
    <option name="fix-on-save" value="true" />
    <files-pattern value="**/*.{js,jsx,ts,tsx,vue,html,json,yaml,yml}" />
  </component>
</project>`
            },
            {
                filePath: '.idea/prettier.xml',
                template: () => `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="PrettierConfiguration">
    <option name="myConfigurationMode" value="AUTOMATIC" />
    <option name="myRunOnSave" value="true" />
    <option name="myRunOnReformat" value="true" />
  </component>
</project>`
            }
        ]
    }
};
