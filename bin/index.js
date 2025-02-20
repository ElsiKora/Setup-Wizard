#!/usr/bin/env node
import { Command } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import { multiselect, isCancel, groupMultiselect, text, note, log, confirm, spinner, select } from '@clack/prompts';
import fs from 'fs/promises';
import path from 'node:path';

var ECommand;
(function (ECommand) {
    ECommand["INIT"] = "init";
    ECommand["ANALYZE"] = "analyze";
})(ECommand || (ECommand = {}));

var EModule;
(function (EModule) {
    EModule["ESLINT"] = "eslint";
    EModule["PRETTIER"] = "prettier";
    EModule["STYLELINT"] = "stylelint";
    EModule["CI"] = "ci";
    EModule["SEMANTIC_RELEASE"] = "semantic-release";
    EModule["COMMITLINT"] = "commitlint";
    EModule["GITIGNORE"] = "gitignore";
    EModule["LICENSE"] = "license";
    EModule["IDE"] = "ide";
})(EModule || (EModule = {}));

const COMMAND_FLAG_CONFIG = {
    [EModule.ESLINT]: {
        shortFlag: 'e',
        fullFlag: 'withEslint',
        description: 'Add ESLint configuration'
    },
    [EModule.PRETTIER]: {
        shortFlag: 'p',
        fullFlag: 'withPrettier',
        description: 'Add Prettier configuration'
    },
    [EModule.STYLELINT]: {
        shortFlag: 's',
        fullFlag: 'withStylelint',
        description: 'Add Stylelint configuration'
    },
    [EModule.CI]: {
        shortFlag: 'i',
        fullFlag: 'withCI',
        description: 'Add GitHub CI configuration'
    },
    [EModule.SEMANTIC_RELEASE]: {
        shortFlag: 'r',
        fullFlag: 'withSemanticRelease',
        description: 'Add semantic-release configuration'
    },
    [EModule.COMMITLINT]: {
        shortFlag: 'c',
        fullFlag: 'withCommitlint',
        description: 'Add commitlint configuration'
    },
    [EModule.GITIGNORE]: {
        shortFlag: 'g',
        fullFlag: 'withGitignore',
        description: 'Add .gitignore file'
    },
    [EModule.LICENSE]: {
        shortFlag: 'l',
        fullFlag: 'withLicense',
        description: 'Add LICENSE file'
    },
    [EModule.IDE]: {
        shortFlag: 'd',
        fullFlag: 'withIde',
        description: 'Add IDE configuration'
    }
};

class CommandOptionsMapper {
    static fromFlagToModule(properties) {
        const commandProperties = {};
        Object.entries(COMMAND_FLAG_CONFIG).forEach(([module, config]) => {
            const moduleKey = module;
            commandProperties[moduleKey] = properties[config.fullFlag] || false;
        });
        return commandProperties;
    }
}

class InitCommandRegistrar {
    program;
    commandFactory;
    constructor(program, commandFactory) {
        this.program = program;
        this.commandFactory = commandFactory;
    }
    execute() {
        const command = this.program.command(ECommand.INIT).description(`Initialize project configuration files

This command generates configuration files for your project based on selected options.`);
        Object.values(COMMAND_FLAG_CONFIG).forEach((commandFlagConfig) => {
            command.option(`-${commandFlagConfig.shortFlag}, --${commandFlagConfig.fullFlag}`, commandFlagConfig.description);
        });
        command.option(`-a, --all`, "Enable all modules");
        command.action(async (properties) => {
            const mapperProperties = CommandOptionsMapper.fromFlagToModule(properties);
            if (properties.all) {
                Object.keys(mapperProperties).forEach((key) => {
                    mapperProperties[key] = true;
                });
            }
            const command = this.commandFactory.createCommand(ECommand.INIT, mapperProperties);
            await command.execute();
        });
        return command;
    }
}

const LICENSE_FILE_NAMES = ["LICENSE", "LICENSE.txt", "LICENSE.md", "license", "license.txt", "license.md", "COPYING", "COPYING.txt", "COPYING.md"];

class CliInterfaceServiceMapper {
    static fromLicenseConfigsToSelectOptions(properties) {
        return Object.entries(properties).map(([license, config]) => ({
            label: `${config.name} (${license})`,
            value: license
        }));
    }
}

var ELicense;
(function (ELicense) {
    ELicense["AGPL_3_0"] = "AGPL_3_0";
    ELicense["ISC"] = "ISC";
    ELicense["BSL_1_0"] = "BSL_1_0";
    ELicense["MIT"] = "MIT";
    ELicense["APACHE_2_0"] = "APACHE_2_0";
    ELicense["GPL_3_0"] = "GPL_3_0";
    ELicense["LGPL_3_0"] = "LGPL_3_0";
    ELicense["MPL_2_0"] = "MPL_2_0";
    ELicense["UNLICENSED"] = "UNLICENSED";
})(ELicense || (ELicense = {}));

const LICENSE_CONFIG = {
    [ELicense.AGPL_3_0]: {
        description: "Similar to GPLv3 but requires source code distribution for software running over networks (e.g., web applications)",
        name: "GNU Affero General Public License v3.0",
        template: (year, author) => `GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

Copyright (c) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Additional permission under GNU GPL version 3 section 7

If you modify this Program, or any covered work, by linking or combining
it with other code, such other code is not for that reason alone subject
to any of the requirements of the GNU Affero GPL version 3.`,
    },
    [ELicense.APACHE_2_0]: {
        description: "A permissive license with strong patent protection and requirements for preserving copyright and license notices",
        name: "Apache License 2.0",
        template: (year, author) => `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

1. Definitions.

"License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

"Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

"Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity.

"You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

"Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

"Object" form shall mean any form resulting from mechanical transformation or translation of a Source form.

"Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work.

"Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work.

Copyright (c) ${year} ${author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
    },
    [ELicense.BSL_1_0]: {
        description: "A simple permissive license only requiring preservation of copyright and license notices for source distributions",
        name: "Boost Software License 1.0",
        template: (year, author) => `Boost Software License - Version 1.0 - August 17th, 2003

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person or organization
obtaining a copy of the software and accompanying documentation covered by
this license (the "Software") to use, reproduce, display, distribute,
execute, and transmit the Software, and to prepare derivative works of the
Software, and to permit third-parties to whom the Software is furnished to
do so, all subject to the following:

The copyright notices in the Software and this entire statement, including
the above license grant, this restriction and the following disclaimer,
must be included in all copies of the Software, in whole or in part, and
all derivative works of the Software, unless such copies or derivative
works are solely in the form of machine-executable object code generated by
a source language processor.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
    },
    [ELicense.GPL_3_0]: {
        description: "A copyleft license that requires anyone who distributes your code or a derivative work to make the source available under the same terms",
        name: "GNU General Public License v3.0",
        template: (year, author) => `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (c) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,
    },
    [ELicense.ISC]: {
        description: "A permissive license letting people do anything with your code with proper attribution and without warranty",
        name: "ISC License",
        template: (year, author) => `ISC License

Copyright (c) ${year} ${author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`,
    },
    [ELicense.LGPL_3_0]: {
        description: "A copyleft license that permits use in proprietary software while maintaining copyleft for the LGPL-licensed components",
        name: "GNU Lesser General Public License v3.0",
        template: (year, author) => `GNU LESSER GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (c) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,
    },
    [ELicense.MIT]: {
        description: "A short and simple permissive license with conditions only requiring preservation of copyright and license notices",
        name: "MIT License",
        template: (year, author) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    },
    [ELicense.MPL_2_0]: {
        description: "A copyleft license that is file-based and allows inclusion in larger works under different licenses",
        name: "Mozilla Public License 2.0",
        template: (year, author) => `Mozilla Public License Version 2.0
==================================

Copyright (c) ${year} ${author}

1. Definitions
--------------

1.1. "Contributor"
    means each individual or legal entity that creates, contributes to
    the creation of, or owns Covered Software.

1.2. "Contributor Version"
    means the combination of the Contributions of others (if any) used
    by a Contributor and that particular Contributor's Contribution.

1.3. "Contribution"
    means Covered Software of a particular Contributor.

1.4. "Covered Software"
    means Source Code Form to which the initial Contributor has attached
    the notice in Exhibit A, the Executable Form of such Source Code
    Form, and Modifications of such Source Code Form, in each case
    including portions thereof.

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.`,
    },
    [ELicense.UNLICENSED]: {
        description: "A license with no conditions whatsoever which dedicates works to the public domain",
        name: "The Unlicense",
        template: (_year, _author) => `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,
    },
};

var EPackageJsonDependencyVersionFlag;
(function (EPackageJsonDependencyVersionFlag) {
    EPackageJsonDependencyVersionFlag["EXACT"] = "=";
    EPackageJsonDependencyVersionFlag["GREATER_THAN"] = ">";
    EPackageJsonDependencyVersionFlag["GREATER_THAN_OR_EQUAL"] = ">=";
    EPackageJsonDependencyVersionFlag["LESS_THAN"] = "<";
    EPackageJsonDependencyVersionFlag["LESS_THAN_OR_EQUAL"] = "<=";
    EPackageJsonDependencyVersionFlag["TILDE"] = "~";
    EPackageJsonDependencyVersionFlag["CARET"] = "^";
    EPackageJsonDependencyVersionFlag["ANY"] = "";
})(EPackageJsonDependencyVersionFlag || (EPackageJsonDependencyVersionFlag = {}));

class PackageJsonService {
    fileSystemService;
    commandService;
    filePath = "package.json";
    constructor(fileSystemService, commandService) {
        this.fileSystemService = fileSystemService;
        this.commandService = commandService;
    }
    async get() {
        const content = await this.fileSystemService.readFile(this.filePath);
        return JSON.parse(content);
    }
    async set(packageJson) {
        await this.fileSystemService.writeFile(this.filePath, JSON.stringify(packageJson, null, 2));
    }
    async getProperty(property) {
        const packageJson = await this.get();
        return packageJson[property];
    }
    async setProperty(property, value) {
        const packageJson = await this.get();
        packageJson[property] = value;
        await this.set(packageJson);
    }
    async addDependency(name, version, type = "dependencies") {
        const packageJson = await this.get();
        packageJson[type] = packageJson[type] || {};
        packageJson[type][name] = version;
        await this.set(packageJson);
    }
    async removeDependency(name, type = "dependencies") {
        const packageJson = await this.get();
        if (packageJson[type] && packageJson[type][name]) {
            delete packageJson[type][name];
            await this.set(packageJson);
        }
    }
    async addScript(name, command) {
        const packageJson = await this.get();
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts[name] = command;
        await this.set(packageJson);
    }
    async removeScript(name) {
        const packageJson = await this.get();
        if (packageJson.scripts && packageJson.scripts[name]) {
            delete packageJson.scripts[name];
            await this.set(packageJson);
        }
    }
    async exists() {
        return this.fileSystemService.isPathExists(this.filePath);
    }
    async getInstalledDependencyVersion(name, type = "any") {
        console.log("name", name);
        console.log("type", type);
        const packageJson = await this.get();
        let versionString;
        if (type === "any") {
            versionString = packageJson.dependencies?.[name] || packageJson.devDependencies?.[name] || packageJson.peerDependencies?.[name] || packageJson.optionalDependencies?.[name];
        }
        else {
            versionString = packageJson[type]?.[name];
        }
        if (!versionString)
            return undefined;
        let flag = EPackageJsonDependencyVersionFlag.ANY;
        let version = versionString;
        if (versionString.startsWith(">=")) {
            flag = EPackageJsonDependencyVersionFlag.GREATER_THAN_OR_EQUAL;
            version = versionString.substring(2);
        }
        else if (versionString.startsWith(">")) {
            flag = EPackageJsonDependencyVersionFlag.GREATER_THAN;
            version = versionString.substring(1);
        }
        else if (versionString.startsWith("<=")) {
            flag = EPackageJsonDependencyVersionFlag.LESS_THAN_OR_EQUAL;
            version = versionString.substring(2);
        }
        else if (versionString.startsWith("<")) {
            flag = EPackageJsonDependencyVersionFlag.LESS_THAN;
            version = versionString.substring(1);
        }
        else if (versionString.startsWith("=")) {
            flag = EPackageJsonDependencyVersionFlag.EXACT;
            version = versionString.substring(1);
        }
        else if (versionString.startsWith("~")) {
            flag = EPackageJsonDependencyVersionFlag.TILDE;
            version = versionString.substring(1);
        }
        else if (versionString.startsWith("^")) {
            flag = EPackageJsonDependencyVersionFlag.CARET;
            version = versionString.substring(1);
        }
        const cleanVersion = version.trim();
        let versionOnly = cleanVersion;
        let prereleaseChannel;
        let isPrerelease = false;
        const prereleaseMatch = cleanVersion.match(/[-+]([a-zA-Z0-9.-]+)(?:\+[a-zA-Z0-9.-]+)?$/);
        if (prereleaseMatch) {
            isPrerelease = true;
            prereleaseChannel = prereleaseMatch[1];
            versionOnly = cleanVersion.split(/[-+]/)[0];
        }
        const versionParts = versionOnly.split(".").map((part) => parseInt(part, 10));
        const majorVersion = versionParts[0] || 0;
        const minorVersion = versionParts[1] || 0;
        const patchVersion = versionParts[2] || 0;
        return {
            flag,
            version: cleanVersion,
            majorVersion,
            minorVersion,
            patchVersion,
            prereleaseChannel,
            isPrerelease,
        };
    }
    async getDependencies(type = "dependencies") {
        const packageJson = await this.get();
        return packageJson[type] || {};
    }
    async isExistsDependency(name, type = "any") {
        const packageJson = await this.get();
        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};
        const peerDependencies = packageJson.peerDependencies || {};
        const optionalDependencies = packageJson.optionalDependencies || {};
        if (type === "any") {
            return !!dependencies[name] || !!devDependencies[name] || !!peerDependencies[name] || !!optionalDependencies[name];
        }
        else {
            return packageJson[type] ? !!packageJson[type][name] : false;
        }
    }
    async merge(partial) {
        const packageJson = await this.get();
        const merged = { ...packageJson, ...partial };
        await this.set(merged);
    }
    async validate() {
        const packageJson = await this.get();
        const requiredFields = ["name", "version"];
        const missingFields = requiredFields.filter((field) => !packageJson[field]);
        return missingFields;
    }
    async installPackages(packages, version, type = "dependencies") {
        const packageList = Array.isArray(packages) ? packages : [packages];
        const typeFlag = this.getDependencyTypeFlag(type);
        if (version && !Array.isArray(packages)) {
            const packageWithVersion = `${packages}@${version}`;
            await this.commandService.execute(`npm install ${typeFlag} ${packageWithVersion}`);
            return;
        }
        const packageString = packageList.join(" ");
        await this.commandService.execute(`npm install ${typeFlag} ${packageString}`);
    }
    async uninstallPackages(packages) {
        const packageList = Array.isArray(packages) ? packages : [packages];
        const packageString = packageList.join(" ");
        await this.commandService.execute(`npm uninstall ${packageString}`);
    }
    getDependencyTypeFlag(type) {
        const flags = {
            dependencies: "--save",
            devDependencies: "--save-dev",
            peerDependencies: "--save-peer",
            optionalDependencies: "--save-optional",
        };
        return flags[type];
    }
}

class NodeCommandService {
    execAsync = promisify(exec);
    async execute(command) {
        try {
            await this.execAsync(command);
        }
        catch (error) {
            throw error;
        }
    }
}

class ConfigService {
    fileSystemService;
    filePath = "elsikora-sw.config.js";
    constructor(fileSystemService) {
        this.fileSystemService = fileSystemService;
    }
    async get() {
        try {
            if (!(await this.exists())) {
                return {};
            }
            if (typeof require !== "undefined") {
                if (require.cache[require.resolve(this.filePath)]) {
                    delete require.cache[require.resolve(this.filePath)];
                }
                const configModule = await import(this.filePath);
                return configModule.default || {};
            }
            const content = await this.fileSystemService.readFile(this.filePath);
            const configMatch = content.match(/export\s+default\s+(\{[\s\S]*?\});?\s*$/);
            if (configMatch && configMatch[1]) {
                try {
                    return Function(`"use strict"; return ${configMatch[1]}`)();
                }
                catch (evalError) {
                    console.error("Failed to parse config:", evalError);
                    return {};
                }
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.error("Error reading config:", error);
            return {};
        }
    }
    async set(config) {
        const configContent = `export default ${this.objectToJsString(config)};`;
        await this.fileSystemService.writeFile(this.filePath, configContent);
    }
    objectToJsString(obj, indent = 0) {
        if (obj === null)
            return "null";
        if (obj === undefined)
            return "undefined";
        const indentStr = " ".repeat(indent);
        const nextIndentStr = " ".repeat(indent + 2);
        if (Array.isArray(obj)) {
            if (obj.length === 0)
                return "[]";
            const items = obj.map((item) => `${nextIndentStr}${this.objectToJsString(item, indent + 2)}`).join(",\n");
            return `[\n${items}\n${indentStr}]`;
        }
        if (typeof obj === "object") {
            if (Object.keys(obj).length === 0)
                return "{}";
            const entries = Object.entries(obj)
                .map(([key, value]) => {
                const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;
                return `${nextIndentStr}${formattedKey}: ${this.objectToJsString(value, indent + 2)}`;
            })
                .join(",\n");
            return `{\n${entries}\n${indentStr}}`;
        }
        if (typeof obj === "string")
            return `'${obj.replace(/'/g, "\\'")}'`;
        if (typeof obj === "function")
            return obj.toString();
        return String(obj);
    }
    needsQuotes(key) {
        const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        const reservedWords = new Set(["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"]);
        return !validIdentifier.test(key) || reservedWords.has(key) || key.includes("-");
    }
    async getProperty(property) {
        const config = await this.get();
        return config[property];
    }
    async setProperty(property, value) {
        const config = await this.get();
        config[property] = value;
        await this.set(config);
    }
    async exists() {
        return this.fileSystemService.isPathExists(this.filePath);
    }
    async merge(partial) {
        try {
            // Если partial пустой, просто возвращаемся без изменений
            if (Object.keys(partial).length === 0) {
                return;
            }
            const config = (await this.exists()) ? await this.get() : {};
            const deepMerge = (target, source) => {
                const result = { ...target };
                for (const key in source) {
                    if (source[key] instanceof Object && key in target && target[key] instanceof Object && !(source[key] instanceof Array) && !(target[key] instanceof Array)) {
                        result[key] = deepMerge(target[key], source[key]);
                    }
                    else {
                        result[key] = source[key];
                    }
                }
                return result;
            };
            const merged = deepMerge(config, partial);
            await this.set(merged);
        }
        catch (error) {
            console.error("Error merging config:", error);
            await this.set(partial);
        }
    }
}

class LicenseModuleService {
    cliInterfaceService;
    fileSystemService;
    packageJsonService;
    commandService;
    configService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
        this.configService = new ConfigService(fileSystemService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            // Get saved config if available
            const savedConfig = await this.getSavedConfig();
            const setupResult = await this.generateNewLicense(savedConfig);
            this.displaySetupSummary(setupResult.success, setupResult.license, setupResult.author, setupResult.error);
            // Return the license configuration in customProperties
            if (setupResult.success && setupResult.license) {
                return {
                    wasInstalled: true,
                    customProperties: {
                        year: new Date().getFullYear(),
                        author: setupResult.author,
                        license: setupResult.license,
                    },
                };
            }
            return { wasInstalled: setupResult.success };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete license installation", error);
            throw error;
        }
    }
    async getSavedConfig() {
        try {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                if (config[EModule.LICENSE]) {
                    return config[EModule.LICENSE];
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async handleExistingSetup() {
        try {
            const existingLicense = await this.fileSystemService.isOneOfPathsExists(LICENSE_FILE_NAMES);
            if (!existingLicense) {
                return true;
            }
            const shouldReplace = !!(await this.cliInterfaceService.confirm(`An existing license file was found (${existingLicense}). Would you like to replace it?`));
            if (!shouldReplace) {
                this.cliInterfaceService.warn("Keeping existing license file.");
                return false;
            }
            try {
                await this.fileSystemService.deleteFile(existingLicense);
                this.cliInterfaceService.success("Deleted existing license file.");
                return true;
            }
            catch (error) {
                this.cliInterfaceService.handleError("Failed to delete existing license file", error);
                return false;
            }
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to check existing license setup", error);
            return false;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to generate LICENSE for your project?"));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async selectLicense(savedLicense) {
        try {
            const options = CliInterfaceServiceMapper.fromLicenseConfigsToSelectOptions(LICENSE_CONFIG);
            const initialValue = savedLicense || undefined;
            return (await this.cliInterfaceService.select("Select a license for your project:", options, initialValue));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to select license", error);
            throw error;
        }
    }
    async generateNewLicense(savedConfig) {
        try {
            const license = await this.selectLicense(savedConfig?.license);
            const result = await this.createLicenseFile(license, savedConfig?.author);
            return {
                success: true,
                license,
                author: result.author,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
            };
        }
    }
    async createLicenseFile(license, savedAuthor) {
        this.cliInterfaceService.startSpinner("Generating license file...");
        try {
            let packageAuthor;
            try {
                packageAuthor = await this.packageJsonService.getProperty("author");
            }
            catch (error) {
                this.cliInterfaceService.warn("Failed to get author from package.json, using saved or default");
                packageAuthor = null;
            }
            // Determine author name with priority: saved > package.json > default
            let authorName;
            if (savedAuthor) {
                authorName = savedAuthor;
            }
            else if (packageAuthor) {
                if (typeof packageAuthor === "object" && "name" in packageAuthor) {
                    authorName = packageAuthor.name;
                }
                else if (typeof packageAuthor === "string" && packageAuthor.length > 0) {
                    authorName = packageAuthor;
                }
                else {
                    authorName = "Your Name";
                }
            }
            else {
                authorName = "Your Name";
            }
            // Confirm or modify the author name
            authorName = await this.cliInterfaceService.text("Enter the copyright holder's name:", "Your Name", authorName);
            const year = new Date().getFullYear().toString();
            const licenseFileContent = LICENSE_CONFIG[license].template(year, authorName);
            await this.fileSystemService.writeFile("LICENSE", licenseFileContent);
            await this.packageJsonService.setProperty("license", license);
            this.cliInterfaceService.stopSpinner("License file generated");
            return { author: authorName };
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner();
            throw error;
        }
    }
    displaySetupSummary(success, license, author, error) {
        const summary = [];
        const year = new Date().getFullYear().toString();
        if (success && license) {
            summary.push("Successfully created configuration:", `✓ LICENSE file (${LICENSE_CONFIG[license].name})`, ``, `Updated package.json "license" field`, "", "License details:", `- Type: ${LICENSE_CONFIG[license].name}`, `- Author: ${author}`, `- Year: ${year}`, "");
        }
        else {
            summary.push("Failed configuration:", `✗ LICENSE - ${error?.message || "Unknown error"}`);
        }
        summary.push("", "Remember to:", "- Review the generated LICENSE file", "- Include license information in your documentation");
        this.cliInterfaceService.note("License Setup Summary", summary.join("\n"));
    }
}

const GITIGNORE_CONFIG = `# Compiled output
/dist/
/build/
/out/
/tmp/
/temp/

# Dependency directories
/node_modules/
jspm_packages/
.pnp/
.pnp.js
.yarn/
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Error logs
*.log.*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
[Dd]esktop.ini

# Tests
/coverage/
/.nyc_output/
.jest/
junit.xml
/cypress/videos/
/cypress/screenshots/
/test-results/
/playwright-report/
/e2e-results/

# IDEs and editors
/.idea/
/.vscode/
*.sublime-workspace
*.sublime-project
/.atom/
/.emacs.d/
/.ensime_cache/
/.nvim/
/.c9/
*.launch
.settings/
.project
.classpath
*.iml
*.ipr
*.iws
.idea_modules/
*.code-workspace
.history/

# IDE - Visual Studio Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.vs/

# Environment variables
.env
.env.*
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
*.env
.envrc

# Cloud Platform Files
.elasticbeanstalk/*
!.elasticbeanstalk/*.cfg.yml
!.elasticbeanstalk/*.global.yml
.pestenska/*
.vercel
.now
.netlify
.deployment/
.terraform/
*.tfstate
*.tfstate.*
.vagrant/

# Dependency lock files
/package-lock.json
/yarn.lock
/pnpm-lock.yaml
/bun.lockb
*.lock-wscript
composer.lock
Gemfile.lock

# Runtime data
*.pid
*.pid.lock
*.seed
*.pid.db
pids/
*.pid

# System Files
.husky/
.git-rewrite/

# Process Managers
.pm2/
ecosystem.config.js
process.json

# Framework specific
# Next.js
.next/
out/
next-env.d.ts

# Nuxt.js
.nuxt/
dist/
.output/

# Gatsby
.cache/
public/

# Vue
.vue-test-utils/

# React
.react-debug/
storybook-static/

# Angular
.angular/
dist/
tmp/
/connect.lock
/libpeerconnection.log

# Docusaurus
.docusaurus/
.cache-loader/

# Static site generators
_site/
.jekyll-cache/
.jekyll-metadata
.hugo_build.lock

# Serverless architectures
.serverless/
.aws-sam/
.sst/

# Service integrations
.firebase/
.amplify/
.sentryclirc
.contentful.json

# Misc files
*.swp
*.swo
*.swn
*.bak
*.tmp
*.temp
*~
.svn/
CVS/
.hg/
.fuse_hidden*
.directory
.nfs*
._*
.Trash-*

# Package specific
.rollup.cache/
tsconfig.tsbuildinfo
.eslintcache
.stylelintcache
.prettiercache
.webpack/
.turbo
.svelte-kit

# Local dev tools
.nodemon-debug
.clinic/
.depcruise.cache

# Documentation
/docs/_build/
/site/

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# TypeScript incremental compilation cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# macOS
.AppleDouble
.LSOverride
Icon
Network Trash Folder
Temporary Items

# Windows
$RECYCLE.BIN/
System Volume Information
`;

class GitignoreModuleService {
    cliInterfaceService;
    fileSystemService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            const setupResult = await this.generateNewGitignore();
            this.displaySetupSummary(setupResult.success, setupResult.error);
            return { wasInstalled: true };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete .gitignore installation", error);
            throw error;
        }
    }
    async handleExistingSetup() {
        try {
            const existingGitignore = await this.fileSystemService.isOneOfPathsExists([".gitignore"]);
            if (!existingGitignore) {
                return true;
            }
            const shouldReplace = !!(await this.cliInterfaceService.confirm(`An existing .gitignore file was found (${existingGitignore}). Would you like to replace it?`));
            if (!shouldReplace) {
                this.cliInterfaceService.warn("Keeping existing .gitignore file.");
                return false;
            }
            try {
                await this.fileSystemService.deleteFile(existingGitignore);
                this.cliInterfaceService.success("Deleted existing .gitignore file.");
                return true;
            }
            catch (error) {
                this.cliInterfaceService.handleError("Failed to delete existing .gitignore file", error);
                return false;
            }
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to check existing .gitignore setup", error);
            return false;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to generate .gitignore file for your project?"));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async generateNewGitignore() {
        this.cliInterfaceService.startSpinner("Generating .gitignore file...");
        try {
            await this.fileSystemService.writeFile(".gitignore", GITIGNORE_CONFIG);
            this.cliInterfaceService.stopSpinner(".gitignore file generated");
            return { success: true };
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner();
            return { success: false, error: error };
        }
    }
    displaySetupSummary(success, error) {
        const summary = [];
        if (success) {
            summary.push("Successfully created configuration:", "✓ .gitignore file");
        }
        else {
            summary.push("Failed configuration:", `✗ .gitignore - ${error?.message || "Unknown error"}`);
        }
        summary.push("", "The .gitignore configuration includes:", "- Build outputs and dependencies", "- Common IDEs and editors", "- Testing and coverage files", "- Environment and local config files", "- System and temporary files", "- Framework-specific files", "- Lock files", "", "You can customize it further by editing .gitignore");
        this.cliInterfaceService.note("Gitignore Setup Summary", summary.join("\n"));
    }
}

var ECiProvider;
(function (ECiProvider) {
    ECiProvider["GITHUB"] = "GitHub";
})(ECiProvider || (ECiProvider = {}));

var ECiModule;
(function (ECiModule) {
    ECiModule["CODECOMMIT_SYNC"] = "codecommit-sync";
    ECiModule["DEPENDABOT"] = "dependabot";
    ECiModule["QODANA"] = "qodana";
    ECiModule["RELEASE_NPM"] = "release-npm";
    ECiModule["RELEASE"] = "release";
    ECiModule["SNYK"] = "snyk";
})(ECiModule || (ECiModule = {}));

var ECiModuleType;
(function (ECiModuleType) {
    ECiModuleType["UNIVERSAL"] = "universal";
    ECiModuleType["NPM_ONLY"] = "npm_only";
    ECiModuleType["NON_NPM"] = "non_npm";
})(ECiModuleType || (ECiModuleType = {}));

const CI_CONFIG = {
    [ECiModule.CODECOMMIT_SYNC]: {
        name: "CodeCommit Sync",
        description: "Syncs the repository with AWS CodeCommit.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Mirror to CodeCommit
on: push

jobs:
  mirror_to_codecommit:
    name: Mirror to CodeCommit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Mirror to CodeCommit
        uses: pixta-dev/repository-mirroring-action@v1
        with:
          target_repo_url: \${{ secrets.CODECOMMIT_SSH_REPOSITORY_URL }}
          ssh_private_key: \${{ secrets.CODECOMMIT_SSH_PRIVATE_KEY }}
          ssh_username: \${{ secrets.CODECOMMIT_SSH_PRIVATE_KEY_ID }}`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/workflows/codecommit-sync.yml"
            }
        }
    },
    [ECiModule.QODANA]: {
        name: "Qodana",
        description: "Runs Qodana static analysis.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Qodana Quality Scan
on: push

jobs:
  qodana:
    name: Qodana Quality Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Qodana Scan
        uses: JetBrains/qodana-action@v2023.3
        env:
          QODANA_TOKEN: \${{ secrets.QODANA_TOKEN }}`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/workflows/qodana.yml"
            }
        }
    },
    [ECiModule.DEPENDABOT]: {
        name: "Dependabot",
        description: "Runs Dependabot dependency updates.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    target-branch: "{{devBranchName}}"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
    target-branch: "{{devBranchName}}"`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/dependabot.yml"
            }
        }
    },
    [ECiModule.RELEASE]: {
        name: "Release",
        description: "Runs release process.",
        type: ECiModuleType.NON_NPM,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Release and Publish
on:
  push:
    branches:
      - main

jobs:
  changesets:
    runs-on: ubuntu-latest
    outputs:
      hasChangesets: \${{ steps.changesets.outputs.hasChangesets }}
      publishedPackages: \${{ steps.changesets.outputs.publishedPackages }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: yarn install

      - name: Create Release Pull Request
        id: changesets
        uses: changesets/action@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  prepare-release-info:
    needs: changesets
    runs-on: ubuntu-latest
    outputs:
      version: \${{ steps.get_version.outputs.version }}
      release_notes: \${{ steps.generate_release_notes.outputs.release_notes }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: List tags
        run: git tag

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Get package version
        id: get_version
        run: echo "::set-output name=version::$(jq -r '.version' package.json)"

      - name: Generate release notes
        id: generate_release_notes
        run: |
          notes=$(git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%h: %s")
          if [ -z "$notes" ]; then
            echo "No new changes to release."
            notes="No new changes."
          fi
          echo "::set-output name=release_notes::$(echo "$notes" | base64)"

  github-release:
    needs: prepare-release-info
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Decode Release Notes
        id: decode
        run: echo "::set-output name=release_notes::$(echo '\${{ needs.prepare-release-info.outputs.release_notes }}' | base64 --decode)"

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ needs.prepare-release-info.outputs.version }}
          release_name: Release \${{ needs.prepare-release-info.outputs.version }}
          body: \${{ steps.decode.outputs.release_notes }}
          draft: false
          prerelease: false`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/workflows/release.yml"
            }
        }
    },
    [ECiModule.RELEASE_NPM]: {
        name: "Release NPM",
        description: "Runs NPM release process.",
        type: ECiModuleType.NPM_ONLY,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Release
on:
  push:
    branches:
      - main

concurrency: \${{ github.workflow }}-\${{ github.ref }}
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
      - name: Install Dependencies
        run: yarn

      - name: Create Release Pull Request or Publish to NPM
        id: changesets
        uses: changesets/action@v1
        with:
          publish: yarn release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/workflows/release.yml"
            }
        }
    },
    [ECiModule.SNYK]: {
        name: "Snyk",
        description: "Runs Snyk security scan.",
        type: ECiModuleType.UNIVERSAL,
        content: {
            [ECiProvider.GITHUB]: {
                template: (properties = {}) => {
                    let content = `name: Snyk Security Scan
on: push

jobs:
  build:
    name: Snyk Security Scan
    environment: snyk-npm
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Snyk
        run: |
          npm install snyk -g
          npm install snyk-to-html -g
          snyk auth \${{ secrets.SNYK_TOKEN }}

      - name: Install dependencies
        run: npm install

      - name: Snyk Open Source
        run: |
          snyk monitor

      - name: Snyk Code
        run: |
          snyk code test || true

      - name: Snyk IaC
        run: |
          snyk iac test || true`;
                    Object.entries(properties).forEach(([key, value]) => {
                        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
                    });
                    return content;
                },
                filePath: ".github/workflows/snyk.yml"
            }
        }
    }
};

class CiModuleService {
    cliInterfaceService;
    fileSystemService;
    selectedProvider;
    selectedModules = [];
    configService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.configService = new ConfigService(fileSystemService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            const savedConfig = await this.getSavedConfig();
            const moduleType = await this.determineModuleType(savedConfig?.isNpmPackage);
            this.selectedProvider = await this.selectProvider(savedConfig?.provider);
            this.selectedModules = await this.selectCompatibleModules(moduleType, savedConfig?.modules || []);
            if (this.selectedModules.length === 0) {
                this.cliInterfaceService.warn("No CI modules selected.");
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                this.cliInterfaceService.warn("Setup cancelled by user.");
                return { wasInstalled: false };
            }
            const moduleProperties = await this.setupSelectedModules(savedConfig?.moduleProperties || {});
            const customProperties = {
                provider: this.selectedProvider,
                modules: this.selectedModules,
                moduleProperties,
                isNpmPackage: moduleType === ECiModuleType.NPM_ONLY,
            };
            return {
                wasInstalled: true,
                customProperties,
            };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete CI setup", error);
            throw error;
        }
    }
    async handleExistingSetup() {
        try {
            const existingFiles = await this.findExistingCiFiles();
            if (existingFiles.length === 0) {
                return true;
            }
            this.cliInterfaceService.warn("Found existing CI configuration files that might be modified:\n" + existingFiles.map((file) => `- ${file}`).join("\n"));
            return await this.cliInterfaceService.confirm("Do you want to continue? This might overwrite existing files.", false);
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to check existing CI setup", error);
            return false;
        }
    }
    async findExistingCiFiles() {
        if (!this.selectedProvider || !this.selectedModules || this.selectedModules.length === 0) {
            return [];
        }
        const existingFiles = [];
        for (const module of this.selectedModules) {
            const config = CI_CONFIG[module];
            const providerConfig = config.content[this.selectedProvider];
            if (providerConfig && (await this.fileSystemService.isPathExists(providerConfig.filePath))) {
                existingFiles.push(providerConfig.filePath);
            }
        }
        return existingFiles;
    }
    async shouldInstall() {
        try {
            return await this.cliInterfaceService.confirm("Would you like to set up CI workflows?");
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async determineModuleType(savedIsNpmPackage) {
        const defaultValue = savedIsNpmPackage !== undefined ? savedIsNpmPackage : false;
        const isNpmPackage = await this.cliInterfaceService.confirm("Is this package going to be published to NPM?", defaultValue);
        return isNpmPackage ? ECiModuleType.NPM_ONLY : ECiModuleType.NON_NPM;
    }
    async selectProvider(savedProvider) {
        const providers = Object.values(ECiProvider).map((provider) => ({
            label: provider,
            value: provider,
            description: this.getProviderDescription(provider),
        }));
        const initialProvider = savedProvider || undefined;
        return await this.cliInterfaceService.select("Select CI provider:", providers, initialProvider);
    }
    getProviderDescription(provider) {
        const descriptions = {
            [ECiProvider.GITHUB]: "GitHub Actions - Cloud-based CI/CD",
        };
        return descriptions[provider] || provider;
    }
    async selectCompatibleModules(moduleType, savedModules) {
        const compatibleModules = Object.entries(CI_CONFIG)
            .filter(([_, config]) => {
            return config.type === ECiModuleType.UNIVERSAL || config.type === moduleType;
        })
            .map(([key, config]) => ({
            label: config.name,
            value: key,
            description: config.description,
        }));
        const compatibleValues = compatibleModules.map((module) => module.value);
        const validSavedModules = savedModules.filter((module) => compatibleValues.includes(module));
        return await this.cliInterfaceService.multiselect("Select the CI modules you want to set up:", compatibleModules, false, validSavedModules);
    }
    async setupSelectedModules(savedProperties = {}) {
        if (!this.selectedProvider) {
            throw new Error("Provider not selected");
        }
        try {
            const moduleProperties = {};
            for (const module of this.selectedModules) {
                // Get only actual properties, not the isEnabled flag
                const savedModuleProps = this.extractModuleProperties(savedProperties[module]);
                const properties = await this.collectModuleProperties(module, savedModuleProps);
                // Only store properties if they exist, don't use boolean flags
                if (Object.keys(properties).length > 0) {
                    moduleProperties[module] = properties;
                }
            }
            this.cliInterfaceService.startSpinner("Setting up CI configuration...");
            const results = await Promise.all(this.selectedModules.map((module) => {
                const setupProps = moduleProperties[module] || {};
                return this.setupModule(module, setupProps);
            }));
            this.cliInterfaceService.stopSpinner("CI configuration completed successfully!");
            const successfulSetups = results.filter((r) => r.success);
            const failedSetups = results.filter((r) => !r.success);
            this.displaySetupSummary(successfulSetups, failedSetups);
            return moduleProperties;
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner();
            throw error;
        }
    }
    extractModuleProperties(moduleConfig) {
        if (!moduleConfig) {
            return {};
        }
        if (typeof moduleConfig === "boolean") {
            return {};
        }
        if (typeof moduleConfig === "object" && moduleConfig !== null && "isEnabled" in moduleConfig) {
            // Remove isEnabled flag and return actual properties
            const { isEnabled, ...properties } = moduleConfig;
            return properties;
        }
        return moduleConfig;
    }
    async setupModule(module, properties) {
        try {
            const config = CI_CONFIG[module];
            const providerConfig = config.content[this.selectedProvider];
            if (!providerConfig) {
                throw new Error(`Provider ${this.selectedProvider} is not supported for ${config.name}`);
            }
            const dirPath = providerConfig.filePath.split("/").slice(0, -1).join("/");
            if (dirPath) {
                await this.fileSystemService.createDirectory(dirPath, {
                    recursive: true,
                });
            }
            const content = providerConfig.template(properties);
            await this.fileSystemService.writeFile(providerConfig.filePath, content);
            return { module, success: true };
        }
        catch (error) {
            const formattedError = error;
            return { module, success: false, error: formattedError };
        }
    }
    async collectModuleProperties(module, savedProperties = {}) {
        const properties = {};
        if (module === ECiModule.DEPENDABOT) {
            const defaultBranch = savedProperties.devBranchName || "dev";
            properties.devBranchName = await this.cliInterfaceService.text("Enter the target branch for Dependabot updates:", "dev", defaultBranch);
        }
        return properties;
    }
    async getSavedConfig() {
        try {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                if (config[EModule.CI]) {
                    const ciConfig = config[EModule.CI];
                    // Standardize the moduleProperties format
                    if (ciConfig.moduleProperties) {
                        const standardizedProps = {};
                        Object.entries(ciConfig.moduleProperties).forEach(([moduleKey, moduleValue]) => {
                            standardizedProps[moduleKey] = this.extractModuleProperties(moduleValue);
                        });
                        ciConfig.moduleProperties = standardizedProps;
                    }
                    return ciConfig;
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    displaySetupSummary(successful, failed) {
        const summary = ["Successfully created configurations:", ...successful.map(({ module }) => `✓ ${CI_CONFIG[module].name}`)];
        if (failed.length > 0) {
            summary.push("Failed configurations:", ...failed.map(({ module, error }) => `✗ ${CI_CONFIG[module].name} - ${error?.message || "Unknown error"}`));
        }
        summary.push("", "The workflows will be activated when you push to the repository.", "", "Note: Make sure to set up required secrets in your CI provider.");
        this.cliInterfaceService.note("CI Setup Summary", summary.join("\n"));
    }
}

var EIde;
(function (EIde) {
    EIde["INTELLIJ_IDEA"] = "intellij-idea";
    EIde["VS_CODE"] = "vs-code";
})(EIde || (EIde = {}));

const IDE_CONFIG = {
    [EIde.VS_CODE]: {
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

class IdeModuleService {
    cliInterfaceService;
    fileSystemService;
    selectedIdes = [];
    configService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.configService = new ConfigService(fileSystemService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            const savedConfig = await this.getSavedConfig();
            this.selectedIdes = await this.selectIdes(savedConfig?.ides || []);
            if (this.selectedIdes.length === 0) {
                this.cliInterfaceService.warn("No IDEs selected.");
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                this.cliInterfaceService.warn("Setup cancelled by user.");
                return { wasInstalled: false };
            }
            await this.setupSelectedIdes();
            return {
                wasInstalled: true,
                customProperties: {
                    ides: this.selectedIdes,
                },
            };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete IDE setup", error);
            throw error;
        }
    }
    async getSavedConfig() {
        try {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                if (config[EModule.IDE]) {
                    return config[EModule.IDE];
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async shouldInstall() {
        return await this.cliInterfaceService.confirm("Would you like to set up ESLint and Prettier configurations for your code editors?", true);
    }
    async selectIdes(savedIdes = []) {
        const choices = Object.entries(IDE_CONFIG).map(([ide, config]) => ({
            label: config.name,
            value: ide,
            description: config.description,
        }));
        const validSavedIdes = savedIdes.filter((ide) => Object.values(EIde).includes(ide));
        const initialSelection = validSavedIdes.length > 0 ? validSavedIdes : undefined;
        return await this.cliInterfaceService.multiselect("Select your code editor(s):", choices, true, initialSelection);
    }
    async handleExistingSetup() {
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length === 0) {
            return true;
        }
        this.cliInterfaceService.warn("Found existing IDE configuration files that might be modified:\n" + existingFiles.map((file) => `- ${file}`).join("\n"));
        return await this.cliInterfaceService.confirm("Do you want to continue? This might overwrite existing files.", false);
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const ide of this.selectedIdes) {
            const configContent = IDE_CONFIG[ide].content;
            for (const config of configContent) {
                if (await this.fileSystemService.isPathExists(config.filePath)) {
                    existingFiles.push(config.filePath);
                }
            }
        }
        return existingFiles;
    }
    async setupSelectedIdes() {
        this.cliInterfaceService.startSpinner("Setting up IDE configurations...");
        try {
            const results = await Promise.all(this.selectedIdes.map((ide) => this.setupIde(ide)));
            this.cliInterfaceService.stopSpinner("IDE configuration completed successfully!");
            const successfulSetups = results.filter((r) => r.success);
            const failedSetups = results.filter((r) => !r.success);
            this.displaySetupSummary(successfulSetups, failedSetups);
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner();
            throw error;
        }
    }
    async setupIde(ide) {
        try {
            const configContent = IDE_CONFIG[ide].content;
            for (const config of configContent) {
                await this.fileSystemService.createDirectory(config.filePath, { recursive: true });
                await this.fileSystemService.writeFile(config.filePath, config.template());
            }
            return { ide, success: true };
        }
        catch (error) {
            return { ide, success: false, error: error };
        }
    }
    displaySetupSummary(successful, failed) {
        const summary = [
            "Successfully created configurations:",
            ...successful.map(({ ide }) => {
                const files = IDE_CONFIG[ide].content.map((config) => `  - ${config.filePath}`).join("\n");
                return `✓ ${IDE_CONFIG[ide].name}:\n${files}`;
            }),
        ];
        if (failed.length > 0) {
            summary.push("Failed configurations:", ...failed.map(({ ide, error }) => `✗ ${IDE_CONFIG[ide].name} - ${error?.message || "Unknown error"}`));
        }
        this.cliInterfaceService.note("IDE Setup Summary", summary.join("\n"));
    }
}

var EEslintFeature;
(function (EEslintFeature) {
    EEslintFeature["CHECK_FILE"] = "checkFile";
    EEslintFeature["JAVASCRIPT"] = "javascript";
    EEslintFeature["JSON"] = "json";
    EEslintFeature["NEST"] = "nest";
    EEslintFeature["NODE"] = "node";
    EEslintFeature["PACKAGE_JSON"] = "packageJson";
    EEslintFeature["PERFECTIONIST"] = "perfectionist";
    EEslintFeature["PRETTIER"] = "prettier";
    EEslintFeature["REACT"] = "react";
    EEslintFeature["REGEXP"] = "regexp";
    EEslintFeature["SONAR"] = "sonar";
    EEslintFeature["STYLISTIC"] = "stylistic";
    EEslintFeature["TAILWIND_CSS"] = "tailwindCss";
    EEslintFeature["TYPEORM"] = "typeorm";
    EEslintFeature["TYPESCRIPT"] = "typescript";
    EEslintFeature["UNICORN"] = "unicorn";
    EEslintFeature["YAML"] = "yaml";
})(EEslintFeature || (EEslintFeature = {}));

const ESLINT_CONFIG_FILE_NAMES = ["eslint.config.js",
    "eslint.config.cjs",
    "eslint.config.mjs",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    ".eslintrc.json",
    ".eslintrc",
    ".eslintignore"];

const ESLINT_FEATURE_CONFIG = {
    [EEslintFeature.CHECK_FILE]: {
        description: "File naming rules",
        packages: ["eslint-plugin-check-file"],
        configFlag: "withCheckFile",
    },
    [EEslintFeature.JAVASCRIPT]: {
        description: "JavaScript support",
        packages: [],
        required: true,
        configFlag: "withJavascript",
    },
    [EEslintFeature.JSON]: {
        description: "JSON files support",
        packages: ["eslint-plugin-jsonc"],
        configFlag: "withJson",
    },
    [EEslintFeature.NEST]: {
        description: "NestJS framework support",
        detect: ["@nestjs/core", "@nestjs/common"],
        packages: [
            "eslint-plugin-ng-module-sort",
            "@elsikora/eslint-plugin-nestjs-typed",
        ],
        requiresTypescript: true,
        configFlag: "withNest",
    },
    [EEslintFeature.NODE]: {
        description: "Node.js specific rules",
        detect: ["node", "@types/node"],
        packages: ["eslint-plugin-n"],
        configFlag: "withNode",
    },
    [EEslintFeature.PACKAGE_JSON]: {
        description: "package.json linting",
        packages: ["eslint-plugin-package-json"],
        configFlag: "withPackageJson",
    },
    [EEslintFeature.PERFECTIONIST]: {
        description: "Code organization rules",
        packages: ["eslint-plugin-perfectionist"],
        configFlag: "withPerfectionist",
    },
    [EEslintFeature.PRETTIER]: {
        description: "Prettier integration",
        detect: ["prettier"],
        packages: ["eslint-plugin-prettier", "eslint-config-prettier", "prettier"],
        configFlag: "withPrettier",
    },
    [EEslintFeature.REACT]: {
        description: "React framework support",
        detect: ["react", "react-dom", "@types/react"],
        packages: ["@eslint-react/eslint-plugin"],
        configFlag: "withReact",
    },
    [EEslintFeature.REGEXP]: {
        description: "RegExp linting",
        packages: ["eslint-plugin-regexp"],
        configFlag: "withRegexp",
    },
    [EEslintFeature.SONAR]: {
        description: "SonarJS code quality rules",
        packages: ["eslint-plugin-sonarjs"],
        configFlag: "withSonar",
    },
    [EEslintFeature.STYLISTIC]: {
        description: "Stylistic rules",
        packages: ["@stylistic/eslint-plugin"],
        configFlag: "withStylistic",
    },
    [EEslintFeature.TAILWIND_CSS]: {
        description: "Tailwind CSS support",
        detect: ["tailwindcss"],
        packages: ["eslint-plugin-tailwindcss"],
        configFlag: "withTailwindCss",
    },
    [EEslintFeature.TYPEORM]: {
        description: "TypeORM support",
        detect: ["typeorm", "@typeorm/core"],
        packages: ["eslint-plugin-typeorm-typescript"],
        configFlag: "withTypeorm",
        requiresTypescript: true,
    },
    [EEslintFeature.TYPESCRIPT]: {
        description: "TypeScript support",
        detect: ["typescript", "@types/node"],
        packages: [
            "typescript",
            "@typescript-eslint/parser",
            "@typescript-eslint/eslint-plugin",
            "typescript-eslint",
        ],
        requiresTypescript: true,
        configFlag: "withTypescript",
    },
    [EEslintFeature.UNICORN]: {
        description: "Unicorn rules",
        packages: ["eslint-plugin-unicorn"],
        configFlag: "withUnicorn",
    },
    [EEslintFeature.YAML]: {
        description: "YAML files support",
        packages: ["eslint-plugin-yml"],
        configFlag: "withYaml",
    },
};

const ESLINT_CONFIG_CORE_DEPENDENCIES = ["@elsikora/eslint-config", "eslint", "@eslint/js", "@eslint/compat", "@types/eslint__js"];

const ESLINT_FEATURE_GROUPS = [
    {
        name: "Code Quality",
        features: [EEslintFeature.SONAR, EEslintFeature.UNICORN, EEslintFeature.PERFECTIONIST]
    },
    {
        name: "Core Features",
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT]
    },
    {
        name: "File Types",
        features: [EEslintFeature.JSON, EEslintFeature.YAML, EEslintFeature.CHECK_FILE, EEslintFeature.PACKAGE_JSON]
    },
    {
        name: "Frameworks",
        features: [EEslintFeature.REACT, EEslintFeature.NEST]
    },
    {
        name: "Other Tools",
        features: [EEslintFeature.NODE, EEslintFeature.REGEXP, EEslintFeature.TYPEORM]
    },
    {
        name: "Styling",
        features: [EEslintFeature.TAILWIND_CSS, EEslintFeature.PRETTIER, EEslintFeature.STYLISTIC]
    }
];

const ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME = "@elsikora/eslint-config";

var EFramework;
(function (EFramework) {
    // Frontend frameworks/libraries
    EFramework["ANGULAR"] = "angular";
    EFramework["NEXT"] = "next";
    EFramework["REACT"] = "react";
    EFramework["VUE"] = "vue";
    EFramework["SVELTE"] = "svelte";
    EFramework["SOLID"] = "solid";
    EFramework["QWIK"] = "qwik";
    EFramework["PREACT"] = "preact";
    EFramework["POLYMER"] = "polymer";
    EFramework["LIT"] = "lit";
    EFramework["ALPINE"] = "alpine";
    EFramework["EMBER"] = "ember";
    EFramework["BACKBONE"] = "backbone";
    EFramework["MITHRIL"] = "mithril";
    EFramework["MARKO"] = "marko";
    // Meta-frameworks
    EFramework["NEST"] = "nest";
    EFramework["ASTRO"] = "astro";
    EFramework["GATSBY"] = "gatsby";
    EFramework["VITE"] = "vite";
    EFramework["GRIDSOME"] = "gridsome";
    EFramework["ELEVENTY"] = "eleventy";
    EFramework["SVELTEKIT"] = "sveltekit";
    // Backend frameworks
    EFramework["EXPRESS"] = "express";
    EFramework["FASTIFY"] = "fastify";
    EFramework["KOA"] = "koa";
    EFramework["HAPI"] = "hapi";
    EFramework["ADONIS"] = "adonis";
    EFramework["METEOR"] = "meteor";
    EFramework["SAILS"] = "sails";
    EFramework["LOOPBACK"] = "loopback";
    EFramework["RESTIFY"] = "restify";
    EFramework["FEATHERS"] = "feathers";
    EFramework["STRAPI"] = "strapi";
    EFramework["MEDUSA"] = "medusa";
    EFramework["DIRECTUS"] = "directus";
    EFramework["KEYSTONE"] = "keystone";
    // Desktop/Mobile
    EFramework["ELECTRON"] = "electron";
    EFramework["TAURI"] = "tauri";
    EFramework["CAPACITOR"] = "capacitor";
    EFramework["IONIC"] = "ionic";
    EFramework["REACT_NATIVE"] = "react-native";
    EFramework["FLUTTER"] = "flutter";
    EFramework["EXPO"] = "expo";
    EFramework["NATIVESCRIPT"] = "nativescript";
    // Full-stack frameworks
    EFramework["REDWOOD"] = "redwood";
    EFramework["BLITZ"] = "blitz";
    EFramework["FRESH"] = "fresh";
    EFramework["REMIX"] = "remix";
    EFramework["NUXT"] = "nuxt";
    // Testing frameworks
    EFramework["JEST"] = "jest";
    EFramework["CYPRESS"] = "cypress";
    EFramework["VITEST"] = "vitest";
    EFramework["MOCHA"] = "mocha";
    EFramework["JASMINE"] = "jasmine";
    EFramework["KARMA"] = "karma";
    EFramework["PLAYWRIGHT"] = "playwright";
    EFramework["PUPPETEER"] = "puppeteer";
    EFramework["WEBDRIVERIO"] = "webdriverio";
    EFramework["NIGHTWATCH"] = "nightwatch";
    // UI Component Libraries
    EFramework["MATERIAL_UI"] = "material-ui";
    EFramework["CHAKRA_UI"] = "chakra-ui";
    EFramework["TAILWIND"] = "tailwind";
    EFramework["BOOTSTRAP"] = "bootstrap";
    EFramework["ANTD"] = "antd";
    EFramework["STORYBOOK"] = "storybook";
    EFramework["STYLED_COMPONENTS"] = "styled-components";
    // State Management
    EFramework["REDUX"] = "redux";
    EFramework["MOBX"] = "mobx";
    EFramework["RECOIL"] = "recoil";
    EFramework["ZUSTAND"] = "zustand";
    EFramework["JOTAI"] = "jotai";
    EFramework["XSTATE"] = "xstate";
    EFramework["PINIA"] = "pinia";
    // Build Tools
    EFramework["WEBPACK"] = "webpack";
    EFramework["ROLLUP"] = "rollup";
    EFramework["PARCEL"] = "parcel";
    EFramework["ESBUILD"] = "esbuild";
    EFramework["TURBOPACK"] = "turbopack";
    EFramework["SNOWPACK"] = "snowpack";
    // API/GraphQL
    EFramework["APOLLO"] = "apollo";
    EFramework["TRPC"] = "trpc";
    EFramework["GRAPHQL"] = "graphql";
    EFramework["RELAY"] = "relay";
    EFramework["TANSTACK_QUERY"] = "tanstack-query";
    EFramework["SWR"] = "swr";
    // Development Tools
    EFramework["PRETTIER"] = "prettier";
    EFramework["ESLINT"] = "eslint";
    EFramework["BABEL"] = "babel";
    EFramework["TYPESCRIPT"] = "typescript";
    EFramework["POSTCSS"] = "postcss";
    EFramework["SASS"] = "sass";
    EFramework["LESS"] = "less";
    // Server Side
    EFramework["PRISMA"] = "prisma";
    EFramework["SEQUELIZE"] = "sequelize";
    EFramework["TYPEORM"] = "typeorm";
    EFramework["MONGOOSE"] = "mongoose";
    EFramework["DRIZZLE"] = "drizzle";
    // Other
    EFramework["NONE"] = "none";
})(EFramework || (EFramework = {}));

const FRAMEWORK_CONFIG = {
    // Angular
    [EFramework.ANGULAR]: {
        name: EFramework.ANGULAR,
        displayName: "Angular",
        description: "Angular framework project",
        fileIndicators: ["angular.json", ".angular-cli.json", "angular-cli.json"],
        packageIndicators: {
            dependencies: ["@angular/core"],
            devDependencies: ["@angular-devkit/build-angular"],
        },
        lintPaths: ["src/**/*.ts", "src/**/*.html", "src/**/*.scss"],
        ignorePath: {
            directories: [".angular"],
            patterns: ["src/assets/**/*", "src/environments/**/*", "*.spec.ts"],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
            EEslintFeature.SONAR,
            EEslintFeature.STYLISTIC,
        ],
    },
    // Next.js
    [EFramework.NEXT]: {
        name: EFramework.NEXT,
        displayName: "Next.js",
        description: "Next.js React framework project",
        fileIndicators: ["next.config.js", "next.config.mjs", "next.config.ts"],
        packageIndicators: {
            dependencies: ["next"],
            either: ["react", "react-dom"],
        },
        isSupportWatch: true,
        lintPaths: ["pages/**/*", "app/**/*", "components/**/*", "lib/**/*"],
        ignorePath: {
            directories: [".next"],
            patterns: ["**/*.d.ts", "public/**/*"],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.TAILWIND_CSS,
            EEslintFeature.PRETTIER,
        ],
    },
    // NestJS
    [EFramework.NEST]: {
        name: EFramework.NEST,
        displayName: "NestJS",
        description: "NestJS framework project",
        fileIndicators: ["nest-cli.json", ".nest-cli.json"],
        isSupportWatch: true,
        packageIndicators: {
            dependencies: ["@nestjs/core", "@nestjs/common"],
            devDependencies: ["@nestjs/cli"],
        },
        lintPaths: ["src/**/*.ts", "test/**/*.ts", "libs/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
        },
        features: [
            EEslintFeature.NEST,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PERFECTIONIST,
            EEslintFeature.SONAR,
        ],
    },
    // React
    [EFramework.REACT]: {
        name: EFramework.REACT,
        displayName: "React",
        description: "React library project",
        fileIndicators: ["src/App.jsx", "src/App.tsx"], // удалены файлы vite.config.*
        packageIndicators: {
            dependencies: ["react", "react-dom"],
        },
        lintPaths: ["src/**/*", "components/**/*"],
        ignorePath: {
            directories: [],
            patterns: ["**/*.d.ts", "public/**/*"],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.TAILWIND_CSS,
            EEslintFeature.PRETTIER,
        ],
    },
    // Vue.js
    [EFramework.VUE]: {
        name: EFramework.VUE,
        displayName: "Vue.js",
        description: "Vue.js framework project",
        fileIndicators: ["vue.config.js", ".vuerc"], // удалён vite.config.ts
        packageIndicators: {
            dependencies: ["vue"],
            devDependencies: ["@vue/cli-service"],
        },
        lintPaths: ["src/**/*.vue", "src/**/*.ts", "src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: ["public/**/*", "**/*.d.ts"],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
            EEslintFeature.TAILWIND_CSS,
        ],
    },
    // Express.js
    [EFramework.EXPRESS]: {
        name: EFramework.EXPRESS,
        displayName: "Express.js",
        description: "Express.js Node.js framework project",
        isSupportWatch: true,
        fileIndicators: [], // удалены общие файлы типа app.js, server.js, index.js
        packageIndicators: {
            dependencies: ["express"],
        },
        lintPaths: [
            "src/**/*.js",
            "routes/**/*.js",
            "controllers/**/*.js",
            "models/**/*.js",
        ],
        ignorePath: {
            directories: [],
            patterns: ["public/**/*", "uploads/**/*"],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.PERFECTIONIST,
            EEslintFeature.SONAR,
        ],
    },
    // Fastify
    [EFramework.FASTIFY]: {
        name: EFramework.FASTIFY,
        displayName: "Fastify",
        description: "Fastify Node.js framework project",
        fileIndicators: ["fastify.config.js", "fastify.config.ts"],
        isSupportWatch: true,
        packageIndicators: {
            dependencies: ["fastify"],
        },
        lintPaths: ["src/**/*.ts", "routes/**/*.ts", "plugins/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: ["test/**/*", "**/*.spec.ts"],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PERFECTIONIST,
        ],
    },
    // Koa
    [EFramework.KOA]: {
        name: EFramework.KOA,
        displayName: "Koa",
        description: "Koa Node.js framework project",
        fileIndicators: [], // удалены общие app.js, server.js, index.js
        isSupportWatch: true,
        packageIndicators: {
            dependencies: ["koa"],
        },
        lintPaths: ["src/**/*.js", "routes/**/*.js", "middleware/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: ["public/**/*", "test/**/*"],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.PERFECTIONIST,
        ],
    },
    // Remix
    [EFramework.REMIX]: {
        name: EFramework.REMIX,
        displayName: "Remix",
        description: "Remix React framework project",
        fileIndicators: ["remix.config.js", "remix.config.ts", "app/root.tsx"],
        packageIndicators: {
            dependencies: ["@remix-run/react", "@remix-run/node"],
        },
        lintPaths: ["app/**/*", "routes/**/*", "styles/**/*"],
        ignorePath: {
            directories: ["public/build"],
            patterns: ["public/**/*", "**/*.d.ts"],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.TAILWIND_CSS,
        ],
    },
    // Nuxt.js
    [EFramework.NUXT]: {
        name: EFramework.NUXT,
        displayName: "Nuxt.js",
        description: "Nuxt.js Vue framework project",
        fileIndicators: ["nuxt.config.js", "nuxt.config.ts"],
        packageIndicators: {
            dependencies: ["nuxt"],
            devDependencies: ["@nuxt/types"],
        },
        lintPaths: ["pages/**/*.vue", "components/**/*.vue", "layouts/**/*.vue"],
        ignorePath: {
            directories: [".nuxt"],
            patterns: ["static/**/*", "assets/**/*"],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
            EEslintFeature.TAILWIND_CSS,
        ],
    },
    // Svelte
    [EFramework.SVELTE]: {
        name: EFramework.SVELTE,
        displayName: "Svelte",
        description: "Svelte framework project",
        fileIndicators: ["svelte.config.js"], // оставляем только svelte.config.js
        packageIndicators: {
            dependencies: ["svelte"],
            devDependencies: ["@sveltejs/kit"],
        },
        lintPaths: ["src/**/*.svelte", "src/**/*.ts", "src/**/*.js"],
        ignorePath: {
            directories: [".svelte-kit"],
            patterns: ["static/**/*", "**/*.d.ts"],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
            EEslintFeature.TAILWIND_CSS,
        ],
    },
    // Astro
    [EFramework.ASTRO]: {
        name: EFramework.ASTRO,
        displayName: "Astro",
        description: "Astro static site generator",
        fileIndicators: ["astro.config.mjs", "astro.config.ts"],
        packageIndicators: {
            dependencies: ["astro"],
            devDependencies: ["@astrojs/tailwind"],
        },
        lintPaths: ["src/**/*.astro", "src/**/*.ts", "src/**/*.tsx"],
        ignorePath: {
            directories: [".astro"],
            patterns: ["public/**/*", "**/*.d.ts"],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.TAILWIND_CSS,
            EEslintFeature.PRETTIER,
        ],
    },
    // Electron
    [EFramework.ELECTRON]: {
        name: EFramework.ELECTRON,
        displayName: "Electron",
        description: "Electron desktop application framework",
        fileIndicators: [
            "electron.config.js",
            "electron-builder.yml",
            "electron-builder.json",
        ],
        packageIndicators: {
            dependencies: ["electron"],
            devDependencies: ["electron-builder"],
        },
        lintPaths: ["src/**/*", "app/**/*", "main/**/*", "renderer/**/*"],
        ignorePath: {
            directories: ["release"],
            patterns: ["build/**/*", "**/*.d.ts"],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    // Generic project
    [EFramework.NONE]: {
        name: EFramework.NONE,
        displayName: "Generic Project",
        description: "No specific framework detected",
        packageIndicators: {},
        lintPaths: ["src/**/*", "lib/**/*"],
        ignorePath: {
            directories: [],
            patterns: ["**/*.min.js", "**/*.bundle.js"],
        },
        features: [
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    // -----------------------------
    // Frontend frameworks/libraries
    // -----------------------------
    [EFramework.SOLID]: {
        name: EFramework.SOLID,
        displayName: "Solid.js",
        description: "Solid.js frontend library project",
        fileIndicators: [], // удалены неоднозначные файлы
        packageIndicators: {
            dependencies: ["solid-js"],
        },
        lintPaths: ["src/**/*.tsx", "components/**/*.tsx"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.QWIK]: {
        name: EFramework.QWIK,
        displayName: "Qwik",
        description: "Qwik resumable frontend framework project",
        fileIndicators: ["qwik.config.ts"], // оставляем только qwik.config.ts
        packageIndicators: {
            dependencies: ["@builder.io/qwik"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.PREACT]: {
        name: EFramework.PREACT,
        displayName: "Preact",
        description: "Preact lightweight React alternative",
        fileIndicators: ["preact.config.js"], // оставляем только preact.config.js
        packageIndicators: {
            dependencies: ["preact"],
        },
        lintPaths: ["src/**/*.jsx", "src/**/*.tsx"],
        ignorePath: {
            directories: [],
            patterns: ["**/*.d.ts"],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.POLYMER]: {
        name: EFramework.POLYMER,
        displayName: "Polymer",
        description: "Polymer library project",
        fileIndicators: ["polymer.json"],
        packageIndicators: {
            dependencies: ["@polymer/polymer"],
        },
        lintPaths: ["src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.LIT]: {
        name: EFramework.LIT,
        displayName: "Lit",
        description: "Lit library project for web components",
        fileIndicators: [], // убраны неоднозначные конфиги
        packageIndicators: {
            dependencies: ["lit"],
        },
        lintPaths: ["src/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.ALPINE]: {
        name: EFramework.ALPINE,
        displayName: "Alpine.js",
        description: "Alpine.js lightweight frontend framework",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["alpinejs"],
        },
        lintPaths: ["src/**/*.js", "public/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.EMBER]: {
        name: EFramework.EMBER,
        displayName: "Ember.js",
        description: "Ember.js framework project",
        fileIndicators: ["ember-cli-build.js", ".ember-cli"],
        packageIndicators: {
            dependencies: ["ember-source", "ember-cli"],
        },
        lintPaths: ["app/**/*", "tests/**/*"],
        ignorePath: {
            directories: ["tmp"],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.BACKBONE]: {
        name: EFramework.BACKBONE,
        displayName: "Backbone.js",
        description: "Backbone.js framework project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["backbone", "underscore"],
        },
        lintPaths: ["src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.MITHRIL]: {
        name: EFramework.MITHRIL,
        displayName: "Mithril.js",
        description: "Mithril.js framework project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["mithril"],
        },
        lintPaths: ["src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.MARKO]: {
        name: EFramework.MARKO,
        displayName: "Marko",
        description: "Marko UI framework project",
        fileIndicators: ["marko-cli.json"],
        packageIndicators: {
            dependencies: ["marko"],
        },
        lintPaths: ["src/**/*.marko", "src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    // -------------------------------
    // Meta-frameworks
    // -------------------------------
    [EFramework.GATSBY]: {
        name: EFramework.GATSBY,
        displayName: "Gatsby",
        description: "Gatsby React-based static site generator",
        fileIndicators: [
            "gatsby-config.js",
            "gatsby-config.ts",
            "gatsby-node.js",
            "gatsby-node.ts",
        ],
        packageIndicators: {
            dependencies: ["gatsby"],
            either: ["react", "react-dom"],
        },
        lintPaths: ["src/**/*", "plugins/**/*"],
        ignorePath: {
            directories: ["public", ".cache"],
            patterns: ["**/*.d.ts"],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.VITE]: {
        name: EFramework.VITE,
        displayName: "Vite",
        description: "Vite frontend build tool / dev server project",
        fileIndicators: ["vite.config.js", "vite.config.ts"],
        packageIndicators: {
            devDependencies: ["vite"],
        },
        lintPaths: ["src/**/*", "public/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.GRIDSOME]: {
        name: EFramework.GRIDSOME,
        displayName: "Gridsome",
        description: "Gridsome Vue.js static site generator",
        fileIndicators: ["gridsome.config.js", "gridsome.config.ts"],
        packageIndicators: {
            dependencies: ["gridsome", "vue"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.ELEVENTY]: {
        name: EFramework.ELEVENTY,
        displayName: "Eleventy",
        description: "Eleventy static site generator",
        fileIndicators: [".eleventy.js", "eleventy.config.js"],
        packageIndicators: {
            devDependencies: ["@11ty/eleventy"],
        },
        lintPaths: ["src/**/*", "content/**/*"],
        ignorePath: {
            directories: ["_site"],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.SVELTEKIT]: {
        name: EFramework.SVELTEKIT,
        displayName: "SvelteKit",
        description: "SvelteKit meta-framework project",
        fileIndicators: ["svelte.config.js", "svelte.config.ts"],
        packageIndicators: {
            dependencies: ["@sveltejs/kit", "svelte"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [".svelte-kit"],
            patterns: [],
        },
        features: [
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
            EEslintFeature.TAILWIND_CSS,
        ],
    },
    // -------------------------------
    // Backend frameworks
    // -------------------------------
    [EFramework.HAPI]: {
        name: EFramework.HAPI,
        displayName: "hapi",
        description: "hapi Node.js framework project",
        fileIndicators: [], // удалены общие файлы
        packageIndicators: {
            dependencies: ["@hapi/hapi"],
        },
        lintPaths: ["src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.ADONIS]: {
        name: EFramework.ADONIS,
        displayName: "AdonisJS",
        description: "AdonisJS Node.js framework project",
        fileIndicators: [".adonisrc.json"], // оставлен только уникальный конфиг
        packageIndicators: {
            dependencies: ["@adonisjs/core"],
        },
        lintPaths: ["app/**/*.ts", "start/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.METEOR]: {
        name: EFramework.METEOR,
        displayName: "Meteor",
        description: "Meteor full-stack JS framework project",
        fileIndicators: [".meteor/release"],
        packageIndicators: {
            dependencies: ["meteor-node-stubs"],
        },
        lintPaths: ["client/**/*", "server/**/*", "imports/**/*"],
        ignorePath: {
            directories: ["public"],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.SAILS]: {
        name: EFramework.SAILS,
        displayName: "Sails.js",
        description: "Sails.js MVC Node.js framework project",
        fileIndicators: ["sails.config.js"], // удалён общий app.js
        packageIndicators: {
            dependencies: ["sails"],
        },
        lintPaths: ["api/**/*.js", "config/**/*.js"],
        ignorePath: {
            directories: ["views"],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.LOOPBACK]: {
        name: EFramework.LOOPBACK,
        displayName: "LoopBack",
        description: "LoopBack Node.js framework project",
        fileIndicators: ["loopback.json"],
        packageIndicators: {
            dependencies: ["@loopback/core"],
        },
        lintPaths: ["src/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.RESTIFY]: {
        name: EFramework.RESTIFY,
        displayName: "Restify",
        description: "Restify Node.js framework project",
        fileIndicators: [], // удалены общие server.js, index.js
        packageIndicators: {
            dependencies: ["restify"],
        },
        lintPaths: ["src/**/*.js"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.FEATHERS]: {
        name: EFramework.FEATHERS,
        displayName: "Feathers",
        description: "Feathers Node.js framework project",
        fileIndicators: ["feathers-cli.json"],
        packageIndicators: {
            dependencies: ["@feathersjs/feathers"],
        },
        lintPaths: ["src/**/*.js", "src/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
        ],
    },
    [EFramework.STRAPI]: {
        name: EFramework.STRAPI,
        displayName: "Strapi",
        description: "Strapi Headless CMS framework project",
        fileIndicators: [], // удалены неоднозначные конфигурационные файлы
        packageIndicators: {
            dependencies: ["strapi"],
        },
        lintPaths: ["src/**/*", "config/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.NODE,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
        ],
    },
    [EFramework.MEDUSA]: {
        name: EFramework.MEDUSA,
        displayName: "Medusa",
        description: "Medusa JS eCommerce backend framework",
        fileIndicators: ["medusa-config.js", "medusa-config.ts"],
        packageIndicators: {
            dependencies: ["@medusajs/medusa"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.DIRECTUS]: {
        name: EFramework.DIRECTUS,
        displayName: "Directus",
        description: "Directus headless CMS project",
        fileIndicators: ["directus.config.js", "directus-extension.json"],
        packageIndicators: {
            dependencies: ["directus"],
        },
        lintPaths: ["extensions/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.KEYSTONE]: {
        name: EFramework.KEYSTONE,
        displayName: "Keystone",
        description: "Keystone.js headless CMS framework",
        fileIndicators: ["keystone.ts", "keystone.js"],
        packageIndicators: {
            dependencies: ["@keystone-6/core"],
        },
        lintPaths: ["schema/**/*", "routes/**/*"],
        ignorePath: {
            directories: [".keystone"],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    // --------------------
    // Desktop / Mobile
    // --------------------
    [EFramework.TAURI]: {
        name: EFramework.TAURI,
        displayName: "Tauri",
        description: "Tauri desktop application framework",
        fileIndicators: ["tauri.conf.json"],
        packageIndicators: {
            dependencies: ["@tauri-apps/api"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: ["src-tauri"],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.CAPACITOR]: {
        name: EFramework.CAPACITOR,
        displayName: "Capacitor",
        description: "Capacitor mobile application framework",
        fileIndicators: ["capacitor.config.json", "capacitor.config.ts"],
        packageIndicators: {
            dependencies: ["@capacitor/core"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: ["android", "ios"],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.IONIC]: {
        name: EFramework.IONIC,
        displayName: "Ionic",
        description: "Ionic mobile & desktop framework project",
        fileIndicators: ["ionic.config.json"],
        packageIndicators: {
            dependencies: ["@ionic/angular"],
            either: ["@ionic/react", "@ionic/vue"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: ["www"],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    [EFramework.REACT_NATIVE]: {
        name: EFramework.REACT_NATIVE,
        displayName: "React Native",
        description: "React Native mobile application project",
        fileIndicators: [], // удалены общие файлы index.js, App.js
        packageIndicators: {
            dependencies: ["react-native"],
            either: ["react"],
        },
        lintPaths: ["App.js", "src/**/*"],
        ignorePath: {
            directories: ["android", "ios"],
            patterns: [],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.FLUTTER]: {
        name: EFramework.FLUTTER,
        displayName: "Flutter",
        description: "Flutter cross-platform framework (Dart)",
        fileIndicators: ["pubspec.yaml"],
        packageIndicators: {
            dependencies: [],
            devDependencies: [],
        },
        lintPaths: [],
        ignorePath: {
            directories: [".dart_tool"],
            patterns: [],
        },
        features: [
            // для Dart ESLint нет, поэтому оставляем только Prettier
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.EXPO]: {
        name: EFramework.EXPO,
        displayName: "Expo",
        description: "Expo framework for React Native apps",
        fileIndicators: ["app.json", "app.config.js"],
        packageIndicators: {
            dependencies: ["expo"],
            either: ["react", "react-native"],
        },
        lintPaths: ["App.js", "src/**/*"],
        ignorePath: {
            directories: ["ios", "android"],
            patterns: [],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.NATIVESCRIPT]: {
        name: EFramework.NATIVESCRIPT,
        displayName: "NativeScript",
        description: "NativeScript cross-platform framework",
        fileIndicators: ["nativescript.config.ts", "nativescript.config.js"],
        packageIndicators: {
            dependencies: ["nativescript"],
        },
        lintPaths: ["app/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    // --------------------
    // Full-stack frameworks
    // --------------------
    [EFramework.REDWOOD]: {
        name: EFramework.REDWOOD,
        displayName: "RedwoodJS",
        description: "RedwoodJS full-stack framework project",
        fileIndicators: ["redwood.toml"],
        packageIndicators: {
            dependencies: ["@redwoodjs/core"],
        },
        lintPaths: ["api/src/**/*", "web/src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.BLITZ]: {
        name: EFramework.BLITZ,
        displayName: "Blitz.js",
        description: "Blitz.js full-stack React framework",
        fileIndicators: ["blitz.config.js", "blitz.config.ts"],
        packageIndicators: {
            dependencies: ["blitz"],
            either: ["react", "react-dom"],
        },
        lintPaths: ["app/**/*"],
        ignorePath: {
            directories: [".blitz"],
            patterns: [],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.TYPESCRIPT,
            EEslintFeature.PRETTIER,
        ],
    },
    [EFramework.FRESH]: {
        name: EFramework.FRESH,
        displayName: "Fresh (Deno)",
        description: "Fresh full-stack framework for Deno",
        fileIndicators: ["fresh.config.ts"], // оставляем только fresh.config.ts
        packageIndicators: {},
        lintPaths: ["routes/**/*", "islands/**/*"],
        ignorePath: {
            directories: [".git", ".vscode"],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.PRETTIER],
    },
    // --------------------
    // Testing frameworks
    // --------------------
    [EFramework.JEST]: {
        name: EFramework.JEST,
        displayName: "Jest",
        description: "Jest testing framework config",
        fileIndicators: ["jest.config.js", "jest.config.ts"],
        packageIndicators: {
            devDependencies: ["jest"],
        },
        lintPaths: ["tests/**/*", "__tests__/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.CYPRESS]: {
        name: EFramework.CYPRESS,
        displayName: "Cypress",
        description: "Cypress end-to-end testing framework",
        fileIndicators: ["cypress.config.js", "cypress.config.ts"],
        packageIndicators: {
            devDependencies: ["cypress"],
        },
        lintPaths: ["cypress/**/*.js", "cypress/**/*.ts"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.VITEST]: {
        name: EFramework.VITEST,
        displayName: "Vitest",
        description: "Vitest testing framework for Vite",
        fileIndicators: ["vitest.config.js", "vitest.config.ts"],
        packageIndicators: {
            devDependencies: ["vitest"],
        },
        lintPaths: ["test/**/*", "src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.MOCHA]: {
        name: EFramework.MOCHA,
        displayName: "Mocha",
        description: "Mocha testing framework",
        fileIndicators: [".mocharc.js", ".mocharc.json"],
        packageIndicators: {
            devDependencies: ["mocha"],
        },
        lintPaths: ["test/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.JASMINE]: {
        name: EFramework.JASMINE,
        displayName: "Jasmine",
        description: "Jasmine testing framework",
        fileIndicators: ["jasmine.json"],
        packageIndicators: {
            devDependencies: ["jasmine"],
        },
        lintPaths: ["spec/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.KARMA]: {
        name: EFramework.KARMA,
        displayName: "Karma",
        description: "Karma test runner",
        fileIndicators: ["karma.conf.js"],
        packageIndicators: {
            devDependencies: ["karma"],
        },
        lintPaths: ["test/**/*", "src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.PLAYWRIGHT]: {
        name: EFramework.PLAYWRIGHT,
        displayName: "Playwright",
        description: "Playwright end-to-end testing framework",
        fileIndicators: ["playwright.config.js", "playwright.config.ts"],
        packageIndicators: {
            devDependencies: ["@playwright/test"],
        },
        lintPaths: ["tests/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.PUPPETEER]: {
        name: EFramework.PUPPETEER,
        displayName: "Puppeteer",
        description: "Puppeteer testing / automation tool",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["puppeteer"],
        },
        lintPaths: ["tests/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.WEBDRIVERIO]: {
        name: EFramework.WEBDRIVERIO,
        displayName: "WebdriverIO",
        description: "WebdriverIO end-to-end testing framework",
        fileIndicators: ["wdio.conf.js"],
        packageIndicators: {
            devDependencies: ["webdriverio"],
        },
        lintPaths: ["tests/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.NIGHTWATCH]: {
        name: EFramework.NIGHTWATCH,
        displayName: "Nightwatch",
        description: "Nightwatch.js end-to-end testing framework",
        fileIndicators: ["nightwatch.conf.js"],
        packageIndicators: {
            devDependencies: ["nightwatch"],
        },
        lintPaths: ["tests/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    // -------------------------
    // UI Component Libraries
    // -------------------------
    [EFramework.MATERIAL_UI]: {
        name: EFramework.MATERIAL_UI,
        displayName: "Material-UI (MUI)",
        description: "Material-UI React UI library project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["@mui/material", "@mui/core", "@emotion/react"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.CHAKRA_UI]: {
        name: EFramework.CHAKRA_UI,
        displayName: "Chakra UI",
        description: "Chakra UI React component library",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["@chakra-ui/react"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TAILWIND]: {
        name: EFramework.TAILWIND,
        displayName: "Tailwind CSS",
        description: "Tailwind CSS setup project",
        fileIndicators: ["tailwind.config.js", "tailwind.config.ts"],
        packageIndicators: {
            devDependencies: ["tailwindcss"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TAILWIND_CSS],
    },
    [EFramework.BOOTSTRAP]: {
        name: EFramework.BOOTSTRAP,
        displayName: "Bootstrap",
        description: "Bootstrap UI library project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["bootstrap"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT],
    },
    [EFramework.ANTD]: {
        name: EFramework.ANTD,
        displayName: "Ant Design",
        description: "Ant Design React UI library project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["antd"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.STORYBOOK]: {
        name: EFramework.STORYBOOK,
        displayName: "Storybook",
        description: "Storybook UI component explorer",
        fileIndicators: [".storybook/main.js", ".storybook/main.ts"],
        packageIndicators: {
            devDependencies: [
                "@storybook/react",
                "@storybook/vue",
                "@storybook/svelte",
            ],
        },
        lintPaths: ["stories/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [
            EEslintFeature.REACT,
            EEslintFeature.JAVASCRIPT,
            EEslintFeature.TYPESCRIPT,
        ],
    },
    [EFramework.STYLED_COMPONENTS]: {
        name: EFramework.STYLED_COMPONENTS,
        displayName: "Styled Components",
        description: "Styled Components for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["styled-components"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    // ------------------
    // State Management
    // ------------------
    [EFramework.REDUX]: {
        name: EFramework.REDUX,
        displayName: "Redux",
        description: "Redux state management for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["redux"],
            either: ["react-redux"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.MOBX]: {
        name: EFramework.MOBX,
        displayName: "MobX",
        description: "MobX state management for JavaScript/React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["mobx"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.RECOIL]: {
        name: EFramework.RECOIL,
        displayName: "Recoil",
        description: "Recoil state management for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["recoil"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.ZUSTAND]: {
        name: EFramework.ZUSTAND,
        displayName: "Zustand",
        description: "Zustand state management for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["zustand"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.JOTAI]: {
        name: EFramework.JOTAI,
        displayName: "Jotai",
        description: "Jotai atomic state management for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["jotai"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.XSTATE]: {
        name: EFramework.XSTATE,
        displayName: "XState",
        description: "XState state machines for JS/TS",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["xstate"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.PINIA]: {
        name: EFramework.PINIA,
        displayName: "Pinia",
        description: "Pinia state management for Vue",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["pinia"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    // ------------------
    // Build Tools
    // ------------------
    [EFramework.WEBPACK]: {
        name: EFramework.WEBPACK,
        displayName: "Webpack",
        description: "Webpack bundler project",
        fileIndicators: ["webpack.config.js", "webpack.config.ts"],
        packageIndicators: {
            devDependencies: ["webpack", "webpack-cli"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.ROLLUP]: {
        name: EFramework.ROLLUP,
        displayName: "Rollup",
        description: "Rollup bundler project",
        fileIndicators: ["rollup.config.js", "rollup.config.ts"],
        packageIndicators: {
            devDependencies: ["rollup"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.PARCEL]: {
        name: EFramework.PARCEL,
        displayName: "Parcel",
        description: "Parcel bundler project",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["parcel"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.ESBUILD]: {
        name: EFramework.ESBUILD,
        displayName: "esbuild",
        description: "esbuild bundler project",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["esbuild"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TURBOPACK]: {
        name: EFramework.TURBOPACK,
        displayName: "Turbopack",
        description: "Turbopack (experimental bundler by Vercel)",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["@vercel/turbopack"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.SNOWPACK]: {
        name: EFramework.SNOWPACK,
        displayName: "Snowpack",
        description: "Snowpack build tool project",
        fileIndicators: ["snowpack.config.js", "snowpack.config.ts"],
        packageIndicators: {
            devDependencies: ["snowpack"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    // ------------------
    // API/GraphQL
    // ------------------
    [EFramework.APOLLO]: {
        name: EFramework.APOLLO,
        displayName: "Apollo",
        description: "Apollo GraphQL client/server project",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["@apollo/client", "apollo-server"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TRPC]: {
        name: EFramework.TRPC,
        displayName: "tRPC",
        description: "tRPC end-to-end typesafe API",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["@trpc/server", "@trpc/client"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    [EFramework.GRAPHQL]: {
        name: EFramework.GRAPHQL,
        displayName: "GraphQL",
        description: "Generic GraphQL usage (apollo, graphql.js, etc.)",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["graphql"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    [EFramework.RELAY]: {
        name: EFramework.RELAY,
        displayName: "Relay",
        description: "Relay GraphQL client for React",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["react-relay", "relay-runtime"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TANSTACK_QUERY]: {
        name: EFramework.TANSTACK_QUERY,
        displayName: "TanStack Query (React Query)",
        description: "TanStack React Query for data fetching",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["@tanstack/react-query"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.SWR]: {
        name: EFramework.SWR,
        displayName: "SWR",
        description: "SWR React hooks library for data fetching",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["swr"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.REACT, EEslintFeature.TYPESCRIPT],
    },
    // --------------------
    // Development Tools
    // --------------------
    [EFramework.PRETTIER]: {
        name: EFramework.PRETTIER,
        displayName: "Prettier",
        description: "Prettier code formatter configuration",
        fileIndicators: [".prettierrc", ".prettierrc.js", "prettier.config.js"],
        packageIndicators: {
            devDependencies: ["prettier"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.PRETTIER],
    },
    [EFramework.ESLINT]: {
        name: EFramework.ESLINT,
        displayName: "ESLint",
        description: "ESLint configuration",
        fileIndicators: [".eslintrc", ".eslintrc.js", ".eslintrc.json"],
        packageIndicators: {
            devDependencies: ["eslint"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.BABEL]: {
        name: EFramework.BABEL,
        displayName: "Babel",
        description: "Babel compiler configuration",
        fileIndicators: ["babel.config.js", ".babelrc"],
        packageIndicators: {
            devDependencies: ["@babel/core"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TYPESCRIPT]: {
        name: EFramework.TYPESCRIPT,
        displayName: "TypeScript",
        description: "TypeScript configuration project",
        fileIndicators: ["tsconfig.json"],
        packageIndicators: {
            devDependencies: ["typescript"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    [EFramework.POSTCSS]: {
        name: EFramework.POSTCSS,
        displayName: "PostCSS",
        description: "PostCSS configuration project",
        fileIndicators: ["postcss.config.js"],
        packageIndicators: {
            devDependencies: ["postcss"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [],
    },
    [EFramework.SASS]: {
        name: EFramework.SASS,
        displayName: "Sass/SCSS",
        description: "Sass/SCSS preprocessor configuration",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["sass"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [],
    },
    [EFramework.LESS]: {
        name: EFramework.LESS,
        displayName: "Less",
        description: "Less CSS preprocessor configuration",
        fileIndicators: [],
        packageIndicators: {
            devDependencies: ["less"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [],
    },
    // ----------------
    // Server Side
    // ----------------
    [EFramework.PRISMA]: {
        name: EFramework.PRISMA,
        displayName: "Prisma",
        description: "Prisma ORM configuration",
        fileIndicators: ["prisma/schema.prisma"],
        packageIndicators: {
            devDependencies: ["prisma"],
            dependencies: ["@prisma/client"],
        },
        lintPaths: [],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
    [EFramework.SEQUELIZE]: {
        name: EFramework.SEQUELIZE,
        displayName: "Sequelize",
        description: "Sequelize ORM configuration",
        fileIndicators: ["sequelize.config.js", ".sequelizerc"],
        packageIndicators: {
            dependencies: ["sequelize"],
        },
        lintPaths: ["models/**/*", "migrations/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.JAVASCRIPT, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.TYPEORM]: {
        name: EFramework.TYPEORM,
        displayName: "TypeORM",
        description: "TypeORM configuration",
        fileIndicators: ["ormconfig.json", "ormconfig.js", "ormconfig.ts"],
        packageIndicators: {
            dependencies: ["typeorm"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPEORM, EEslintFeature.TYPESCRIPT],
    },
    [EFramework.MONGOOSE]: {
        name: EFramework.MONGOOSE,
        displayName: "Mongoose",
        description: "Mongoose ODM for MongoDB",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["mongoose"],
        },
        lintPaths: ["models/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.NODE, EEslintFeature.JAVASCRIPT],
    },
    [EFramework.DRIZZLE]: {
        name: EFramework.DRIZZLE,
        displayName: "Drizzle ORM",
        description: "Drizzle ORM for TypeScript",
        fileIndicators: [],
        packageIndicators: {
            dependencies: ["drizzle-orm"],
        },
        lintPaths: ["src/**/*"],
        ignorePath: {
            directories: [],
            patterns: [],
        },
        features: [EEslintFeature.TYPESCRIPT],
    },
};

class FrameworkService {
    fileSystemService;
    packageJsonService;
    constructor(fileSystemService, packageJsonService) {
        this.fileSystemService = fileSystemService;
        this.packageJsonService = packageJsonService;
    }
    async detect() {
        const detectedFrameworks = [];
        const frameworkEntries = Object.entries(FRAMEWORK_CONFIG);
        for (const [_, config] of frameworkEntries) {
            if (await this.isFrameworkDetected(config)) {
                detectedFrameworks.push(config);
            }
        }
        return detectedFrameworks;
    }
    async isFrameworkDetected(config) {
        const [hasRequiredFiles, hasRequiredPackages] = await Promise.all([
            this.checkFileIndicators(config),
            this.checkPackageIndicators(config),
        ]);
        return hasRequiredFiles || hasRequiredPackages;
    }
    async checkFileIndicators(config) {
        if (!config.fileIndicators?.length) {
            return false;
        }
        const fileChecks = config.fileIndicators.map((file) => this.fileSystemService.isPathExists(file));
        const results = await Promise.all(fileChecks);
        return results.some((exists) => exists);
    }
    async checkPackageIndicators(config) {
        const [dependencies, devDependencies] = await Promise.all([
            this.packageJsonService.getDependencies("dependencies"),
            this.packageJsonService.getDependencies("devDependencies"),
        ]);
        const { dependencies: depIndicators = [], devDependencies: devDepIndicators = [], either = [], } = config.packageIndicators;
        return (depIndicators.some((pkg) => pkg in dependencies) ||
            devDepIndicators.some((pkg) => pkg in devDependencies) ||
            either.some((pkg) => pkg in dependencies || pkg in devDependencies));
    }
    getLintPaths(frameworks) {
        return ["./"];
        //return Array.from(new Set(frameworks.flatMap((f) => f.lintPaths)));
    }
    getIgnorePatterns(frameworks) {
        return Array.from(new Set(frameworks.flatMap((f) => [
            ...f.ignorePath.directories.map((directory) => `${directory}/**/*`),
            ...f.ignorePath.patterns,
        ])));
    }
    getFeatures(frameworks) {
        return Array.from(new Set(frameworks.flatMap((f) => f.features)));
    }
}

const ESLINT_CONFIG_ESLINT_PACKAGE_NAME = "eslint";

const ESLINT_CONFIG = {
    template: (ignores, features) => {
        const featureConfig = features
            .map((feature) => `  ${ESLINT_FEATURE_CONFIG[feature].configFlag}: true`)
            .join(",\n");
        return `import { createConfig } from '@elsikora/eslint-config';

const config = {
  ignores: ${JSON.stringify(ignores, null, 2)}
};

export default [...config,
...(await createConfig({
${featureConfig}
})]);`;
    },
};

const ESLINT_CONFIG_FILE_NAME = "eslint.config.js";

const ESLINT_CONFIG_IGNORE_PATHS = [
    "package-lock.json",
    "yarn.lock",
    "bun.lock",
    "pnpm-lock.yaml",
    "dist",
    "build",
    "out",
    "www",
    "public/build",
    "_site",
    "release",
    "node_modules",
    ".env",
    ".env.local",
    ".env.*",
    "coverage",
    ".cache",
    "public",
    "static",
    "assets",
    "uploads",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.svg",
    "*.ico",
    "*.md",
    "*.mdx",
    "tmp",
    ".temp",
    "**/*.d.ts",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.e2e-spec.ts",
    "__tests__",
    "test",
    "tests",
];

const ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION = 9;

class EslintModuleService {
    cliInterfaceService;
    fileSystemService;
    selectedFeatures = [];
    detectedFrameworks = [];
    packageJsonService;
    commandService;
    frameworkService;
    configService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
        this.frameworkService = new FrameworkService(fileSystemService, this.packageJsonService);
        this.configService = new ConfigService(fileSystemService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            if (!(await this.checkEslintVersion())) {
                return { wasInstalled: false };
            }
            await this.detectFrameworks();
            const savedConfig = await this.getSavedConfig();
            const savedFeatures = savedConfig?.features || [];
            this.selectedFeatures = await this.selectFeatures(savedFeatures);
            if (this.selectedFeatures.length === 0) {
                this.cliInterfaceService.warn("No features selected.");
                return { wasInstalled: false };
            }
            if (!(await this.validateFeatureSelection())) {
                return { wasInstalled: false };
            }
            await this.setupSelectedFeatures();
            return {
                wasInstalled: true,
                customProperties: {
                    features: this.selectedFeatures,
                },
            };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete ESLint setup", error);
            throw error;
        }
    }
    async getSavedConfig() {
        try {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                if (config[EModule.ESLINT]) {
                    return config[EModule.ESLINT];
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async detectFrameworks() {
        this.cliInterfaceService.startSpinner("Detecting frameworks...");
        try {
            this.detectedFrameworks = await this.frameworkService.detect();
            if (this.detectedFrameworks.length > 0) {
                const frameworkNames = this.detectedFrameworks.map((f) => f.displayName).join(", ");
                this.cliInterfaceService.info(`Detected frameworks: ${frameworkNames}`);
            }
            this.cliInterfaceService.stopSpinner("Framework detection completed");
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to detect frameworks");
            throw error;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to set up ESLint for your project?", true));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async setupScripts() {
        await this.packageJsonService.addScript("lint", this.generateLintCommand());
        await this.packageJsonService.addScript("lint:fix", this.generateLintFixCommand());
        if (this.detectedFrameworks.some((framework) => framework.isSupportWatch)) {
            const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
            await this.packageJsonService.addScript("lint:watch", `npx eslint-watch ${lintPaths.join(" ")}`);
        }
        if (this.detectedFrameworks.some((framework) => framework.name === EFramework.TYPESCRIPT)) {
            await this.packageJsonService.addScript("lint:types", "tsc --noEmit");
            await this.packageJsonService.addScript("lint:types:fix", "tsc --noEmit --skipLibCheck");
            await this.packageJsonService.addScript("lint:all", "npm run lint && npm run lint:types");
            await this.packageJsonService.addScript("lint:all:fix", "npm run lint:fix && npm run lint:types:fix");
        }
    }
    generateLintCommand() {
        const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
        return `eslint ${lintPaths.length ? lintPaths.join(" ") : "."}`;
    }
    generateLintFixCommand() {
        const lintPaths = this.frameworkService.getLintPaths(this.detectedFrameworks);
        return `eslint --fix ${lintPaths.length ? lintPaths.join(" ") : "."}`;
    }
    generateLintIgnorePaths() {
        const ignorePatterns = this.getIgnorePatterns();
        return ignorePatterns.length ? ignorePatterns : [];
    }
    async handleExistingSetup() {
        const hasConfig = await this.packageJsonService.isExistsDependency(ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME);
        if (hasConfig) {
            const shouldUninstall = await this.cliInterfaceService.confirm("An existing ElsiKora ESLint configuration is detected. Would you like to uninstall it?", true);
            if (!shouldUninstall) {
                this.cliInterfaceService.warn("Existing ElsiKora ESLint configuration detected. Setup aborted.");
                return false;
            }
            await this.uninstallExistingConfig();
        }
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length > 0) {
            const shouldDelete = await this.cliInterfaceService.confirm(`Existing ESLint configuration files detected:\n${existingFiles.map((f) => `- ${f}`).join("\n")}\n\nDo you want to delete them?`, true);
            if (shouldDelete) {
                await Promise.all(existingFiles.map((file) => this.fileSystemService.deleteFile(file)));
            }
            else {
                this.cliInterfaceService.warn("Existing ESLint configuration files detected. Setup aborted.");
                return false;
            }
        }
        return true;
    }
    async uninstallExistingConfig() {
        this.cliInterfaceService.startSpinner("Uninstalling existing ESLint configuration...");
        try {
            await this.packageJsonService.uninstallPackages([ESLINT_CONFIG_ELSIKORA_PACKAGE_NAME, ESLINT_CONFIG_ESLINT_PACKAGE_NAME]);
            this.cliInterfaceService.stopSpinner("Existing ESLint configuration uninstalled successfully!");
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to uninstall existing ESLint configuration");
            throw error;
        }
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const file of ESLINT_CONFIG_FILE_NAMES) {
            if (await this.fileSystemService.isPathExists(file)) {
                existingFiles.push(file);
            }
        }
        return existingFiles;
    }
    async detectInstalledFeatures() {
        const detectedFeatures = new Set();
        const deps = {
            ...(await this.packageJsonService.getDependencies("dependencies")),
            ...(await this.packageJsonService.getDependencies("devDependencies")),
        };
        const frameworkFeatures = this.frameworkService.getFeatures(this.detectedFrameworks);
        frameworkFeatures.forEach((feature) => detectedFeatures.add(feature));
        Object.entries(ESLINT_FEATURE_CONFIG).forEach(([feature, config]) => {
            if (config.required) {
                detectedFeatures.add(feature);
            }
        });
        Object.entries(ESLINT_FEATURE_CONFIG).forEach(([feature, config]) => {
            if (config.detect && config.detect.some((pkg) => pkg in deps)) {
                detectedFeatures.add(feature);
            }
        });
        return Array.from(detectedFeatures);
    }
    async selectFeatures(savedFeatures = []) {
        const detectedFeatures = await this.detectInstalledFeatures();
        let shouldUseDetected = false;
        const hasValidSavedFeatures = savedFeatures.length > 0 && savedFeatures.every((feature) => Object.values(EEslintFeature).includes(feature));
        if (!hasValidSavedFeatures && detectedFeatures.length > 1) {
            shouldUseDetected = await this.cliInterfaceService.confirm(`Detected features: ${detectedFeatures.join(", ")}. Would you like to include these features?`, true);
        }
        const groupedOptions = {};
        ESLINT_FEATURE_GROUPS.forEach((group) => {
            groupedOptions[group.name] = group.features.map((feature) => ({
                label: `${feature} - ${ESLINT_FEATURE_CONFIG[feature].description}`,
                value: feature,
            }));
        });
        const initialValues = hasValidSavedFeatures ? savedFeatures : shouldUseDetected ? detectedFeatures : [];
        return await this.cliInterfaceService.groupMultiselect("Select the features you want to enable:", groupedOptions, true, initialValues);
    }
    async validateFeatureSelection() {
        const errors = [];
        for (const feature of this.selectedFeatures) {
            const config = ESLINT_FEATURE_CONFIG[feature];
            if (config.requiresTypescript && !this.detectedFrameworks.some((framework) => framework.name === EFramework.TYPESCRIPT)) {
                errors.push(`${feature} requires TypeScript, but TypeScript is not detected in your project.`);
            }
        }
        if (errors.length > 0) {
            this.cliInterfaceService.warn("Configuration cannot proceed due to the following errors:\n" + errors.map((error) => `- ${error}`).join("\n"));
            return false;
        }
        return true;
    }
    async setupSelectedFeatures() {
        this.cliInterfaceService.startSpinner("Setting up ESLint configuration...");
        try {
            const packages = this.collectDependencies();
            await this.packageJsonService.installPackages(packages, "latest", "devDependencies");
            await this.createConfig();
            await this.setupScripts();
            this.cliInterfaceService.stopSpinner("ESLint configuration completed successfully!");
            this.displaySetupSummary();
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to setup ESLint configuration");
            throw error;
        }
    }
    async checkEslintVersion() {
        const eslintVersion = await this.packageJsonService.getInstalledDependencyVersion(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
        if (eslintVersion) {
            const majorVersion = eslintVersion.majorVersion;
            if (majorVersion < ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION) {
                this.cliInterfaceService.info(`Detected ESLint version ${majorVersion}, which is lower than required version ${ESLINT_CONFIG_ESLINT_MINIMUM_REQUIRED_VERSION}.`);
                const shouldRemove = await this.cliInterfaceService.confirm(`Do you want to remove ESLint version ${majorVersion} and install the latest version?`, true);
                if (!shouldRemove) {
                    this.cliInterfaceService.warn("ESLint update cancelled. Setup cannot proceed with the current version.");
                    return false;
                }
                this.cliInterfaceService.startSpinner("Uninstalling ESLint...");
                await this.packageJsonService.uninstallPackages(ESLINT_CONFIG_ESLINT_PACKAGE_NAME);
                this.cliInterfaceService.stopSpinner("ESLint uninstalled successfully.");
            }
        }
        return true;
    }
    collectDependencies() {
        const dependencies = new Set(ESLINT_CONFIG_CORE_DEPENDENCIES);
        for (const feature of this.selectedFeatures) {
            const config = ESLINT_FEATURE_CONFIG[feature];
            if (config.packages) {
                config.packages.forEach((pkg) => dependencies.add(pkg));
            }
        }
        return Array.from(dependencies);
    }
    async createConfig() {
        const ignores = this.generateLintIgnorePaths();
        await this.fileSystemService.writeFile(`${ESLINT_CONFIG_FILE_NAME}`, ESLINT_CONFIG.template(ignores, this.selectedFeatures), "utf8");
    }
    getIgnorePatterns() {
        return [...this.frameworkService.getIgnorePatterns(this.detectedFrameworks), ...ESLINT_CONFIG_IGNORE_PATHS];
    }
    async displaySetupSummary() {
        const packageJsonScripts = await this.packageJsonService.getProperty("scripts");
        const packageJsonScriptsKeys = packageJsonScripts ? Object.keys(packageJsonScripts) : [];
        const generatedScripts = ["lint", "lint:fix", "lint:watch", "lint:types", "lint:types:fix", "lint:all", "lint:all:fix"].filter((script) => packageJsonScriptsKeys.includes(script));
        const summary = [
            "ESLint configuration has been created.",
            "",
            "Detected Frameworks:",
            ...(this.detectedFrameworks.length > 0 ? this.detectedFrameworks.map((framework) => `- ${framework.displayName}${framework.description ? `: ${framework.description}` : ""}`) : ["No frameworks detected"]),
            "",
            "Installed features:",
            ...this.selectedFeatures.map((feature) => `- ${feature}: ${ESLINT_FEATURE_CONFIG[feature].description}`),
            "",
            "Framework-specific configurations:",
            ...(this.detectedFrameworks.length > 0 ? [`Lint Paths: ${this.frameworkService.getLintPaths(this.detectedFrameworks).join(", ")}`] : ["No framework-specific configurations"]),
            "",
            "Generated scripts:",
            ...generatedScripts.map((script) => `- npm run ${script}`),
            "",
            "You can customize the configuration in these file:",
            `- ${ESLINT_CONFIG_FILE_NAME}`,
        ];
        this.cliInterfaceService.note("ESLint Setup", summary.join("\n"));
    }
}

const PRETTIER_CONFIG_FILE_NAMES = [
    ".prettierrc",
    ".prettierrc.json",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.js",
    ".prettierrc.cjs",
    "prettier.config.js",
    "prettier.config.cjs",
    ".prettierrc.toml",
    ".prettierignore",
];

const PRETTIER_CONFIG_CORE_DEPENDENCIES = ["prettier"];

const PRETTIER_CONFIG = `export default {
  useTabs: true,
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: 'always',
  printWidth: 480,
  proseWrap: 'never',
};
`;

const PRETTIER_CONFIG_IGNORE_PATHS = [
    "node_modules",
    "dist",
    "build",
    "coverage",
];

const PRETTIER_CONFIG_IGNORE_FILE_NAME = ".prettierignore";

const PRETTIER_CONFIG_FILE_NAME = "prettier.config.js";

class PrettierModuleService {
    cliInterfaceService;
    fileSystemService;
    packageJsonService;
    commandService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            await this.setupPrettier();
            return { wasInstalled: true };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete Prettier setup", error);
            throw error;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to set up Prettier for your project?", true));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async handleExistingSetup() {
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length > 0) {
            const messageLines = ["Existing Prettier configuration files detected:"];
            messageLines.push("");
            if (existingFiles.length > 0) {
                existingFiles.forEach((file) => {
                    messageLines.push(`- ${file}`);
                });
            }
            messageLines.push("", "Do you want to delete them?");
            const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);
            if (shouldDelete) {
                await Promise.all(existingFiles.map((file) => this.fileSystemService.deleteFile(file)));
            }
            else {
                this.cliInterfaceService.warn("Existing Prettier configuration files detected. Setup aborted.");
                return false;
            }
        }
        return true;
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const file of PRETTIER_CONFIG_FILE_NAMES) {
            if (await this.fileSystemService.isPathExists(file)) {
                existingFiles.push(file);
            }
        }
        return existingFiles;
    }
    async setupPrettier() {
        this.cliInterfaceService.startSpinner("Setting up Prettier configuration...");
        try {
            await this.packageJsonService.installPackages(PRETTIER_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
            await this.createConfigs();
            await this.setupScripts();
            this.cliInterfaceService.stopSpinner("Prettier configuration completed successfully!");
            this.displaySetupSummary();
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to setup Prettier configuration");
            throw error;
        }
    }
    async createConfigs() {
        await this.fileSystemService.writeFile(PRETTIER_CONFIG_FILE_NAME, PRETTIER_CONFIG, "utf8");
        await this.fileSystemService.writeFile(PRETTIER_CONFIG_IGNORE_FILE_NAME, PRETTIER_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
    }
    async setupScripts() {
        await this.packageJsonService.addScript("format", "prettier --check .");
        await this.packageJsonService.addScript("format:fix", "prettier --write .");
    }
    displaySetupSummary() {
        const summary = ["Prettier configuration has been created.", "", "Generated scripts:", "- npm run format", "- npm run format:fix", "", "You can customize the configuration in these files:", `- ${PRETTIER_CONFIG_FILE_NAME}`, `- ${PRETTIER_CONFIG_IGNORE_FILE_NAME}`];
        this.cliInterfaceService.note("Prettier Setup", summary.join("\n"));
    }
}

const STYLELINT_CONFIG_CORE_DEPENDENCIES = ["stylelint", "stylelint-config-css-modules", "stylelint-config-rational-order", "stylelint-config-standard-scss", "stylelint-order", "stylelint-prettier"];

const STYLELINT_CONFIG_FILE_NAME = "stylelint.config.js";

const STYLELINT_CONFIG = `export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-rational-order',
    'stylelint-prettier/recommended',
    'stylelint-config-css-modules',
  ],
  plugins: [
    'stylelint-order',
    'stylelint-config-rational-order/plugin',
    'stylelint-prettier',
  ],
  defaultSeverity: 'warning',
};
`;

const STYLELINT_CONFIG_IGNORE_FILE_NAME = ".stylelintignore";

const STYLELINT_CONFIG_IGNORE_PATHS = ["node_modules", "dist", "build"];

const STYLELINT_CONFIG_FILE_NAMES = ["stylelint.config.js", ".stylelintrc", ".stylelintrc.js", ".stylelintrc.json", ".stylelintrc.yaml", ".stylelintrc.yml", ".stylelintignore"];

class StylelintModuleService {
    cliInterfaceService;
    fileSystemService;
    packageJsonService;
    commandService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            await this.setupStylelint();
            return { wasInstalled: true };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete Stylelint setup", error);
            throw error;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to set up Stylelint for your project?", true));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async handleExistingSetup() {
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length > 0) {
            const messageLines = ["Existing Stylelint configuration files detected:"];
            messageLines.push("");
            if (existingFiles.length > 0) {
                existingFiles.forEach((file) => {
                    messageLines.push(`- ${file}`);
                });
            }
            messageLines.push("", "Do you want to delete them?");
            const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);
            if (shouldDelete) {
                await Promise.all([...existingFiles.map((file) => this.fileSystemService.deleteFile(file))]);
            }
            else {
                this.cliInterfaceService.warn("Existing Stylelint configuration files detected. Setup aborted.");
                return false;
            }
        }
        return true;
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const file of STYLELINT_CONFIG_FILE_NAMES) {
            if (await this.fileSystemService.isPathExists(file)) {
                existingFiles.push(file);
            }
        }
        return existingFiles;
    }
    async setupStylelint() {
        this.cliInterfaceService.startSpinner("Setting up Stylelint configuration...");
        try {
            await this.packageJsonService.installPackages(STYLELINT_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
            await this.createConfigs();
            await this.setupScripts();
            this.cliInterfaceService.stopSpinner("Stylelint configuration completed successfully!");
            this.displaySetupSummary();
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to setup Stylelint configuration");
            throw error;
        }
    }
    async createConfigs() {
        await this.fileSystemService.writeFile(STYLELINT_CONFIG_FILE_NAME, STYLELINT_CONFIG, "utf8");
        await this.fileSystemService.writeFile(STYLELINT_CONFIG_IGNORE_FILE_NAME, STYLELINT_CONFIG_IGNORE_PATHS.join("\n"), "utf8");
    }
    async setupScripts() {
        await this.packageJsonService.addScript("lint:style", 'stylelint "**/*.{css,scss}"');
        await this.packageJsonService.addScript("lint:style:fix", 'stylelint "**/*.{css,scss}" --fix');
    }
    displaySetupSummary() {
        const summary = ["Stylelint configuration has been created.", "", "Generated scripts:", "- npm run lint:style", "- npm run lint:style:fix", "", "You can customize the configuration in these files:", `- ${STYLELINT_CONFIG_FILE_NAME}`, `- ${STYLELINT_CONFIG_IGNORE_FILE_NAME}`];
        this.cliInterfaceService.note("Stylelint Setup", summary.join("\n"));
    }
}

const COMMITLINT_CONFIG_FILE_NAMES = ["commitlint.config.js", ".commitlintrc", ".commitlintrc.js", ".commitlintrc.json"];

const COMMITLINT_CONFIG_CORE_DEPENDENCIES = ["@commitlint/cli", "@commitlint/config-conventional", "@commitlint/cz-commitlint", "commitizen", "conventional-changelog-conventionalcommits", "husky"];

const COMMITLINT_CONFIG = `const Configuration = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: 'conventional-changelog-conventionalcommits',
  formatter: '@commitlint/format',
  rules: {
    'subject-case': [
      0,
      'always',
      [
        'lower-case',
        'upper-case',
        'camel-case',
        'kebab-case',
        'pascal-case',
        'sentence-case',
        'snake-case',
        'start-case',
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
  },
  prompt: {
    settings: {
      enableMultipleScopes: true,
      scopeEnumSeparator: ',',
    },
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change that you're committing:",
        enum: {
          wip: {
            description: '⌛️ Work in progress',
            title: 'Progress',
            emoji: '⌛️',
          },
          feat: {
            description: '✨ A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: '🐛 A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: '📚 Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: '🎨 Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '🎨',
          },
          refactor: {
            description: '📦 A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: '🚀 A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: '🚨 Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: '🛠 Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: '🤖 Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '🤖',
          },
          chore: {
            description: "🔩 Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '🔩',
          },
          revert: {
            description: '🗑 Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
        },
      },
    },
  },
};

export default Configuration;
`;

const COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT = `#!/usr/bin/env sh
echo '⌛️⌛️⌛️ Running commit linter...'
npx --no -- commitlint --edit $1
`;

class CommitlintModuleService {
    cliInterfaceService;
    fileSystemService;
    packageJsonService;
    commandService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            await this.setupCommitlint();
            return { wasInstalled: true };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete Commitlint setup", error);
            throw error;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to set up Commitlint and Commitizen for your project?", true));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async handleExistingSetup() {
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length > 0) {
            const messageLines = ["Existing Commitlint/Commitizen configuration files detected:"];
            messageLines.push("");
            if (existingFiles.length > 0) {
                existingFiles.forEach((file) => {
                    messageLines.push(`- ${file}`);
                });
            }
            messageLines.push("", "Do you want to delete them?");
            const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);
            if (shouldDelete) {
                await Promise.all([...existingFiles.map((file) => this.fileSystemService.deleteFile(file))]);
            }
            else {
                this.cliInterfaceService.warn("Existing Commitlint/Commitizen configuration files detected. Setup aborted.");
                return false;
            }
        }
        return true;
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const file of COMMITLINT_CONFIG_FILE_NAMES) {
            if (await this.fileSystemService.isPathExists(file)) {
                existingFiles.push(file);
            }
        }
        // Check for husky commit-msg hook
        if (await this.fileSystemService.isPathExists(".husky/commit-msg")) {
            existingFiles.push(".husky/commit-msg");
        }
        return existingFiles;
    }
    async setupCommitlint() {
        this.cliInterfaceService.startSpinner("Setting up Commitlint and Commitizen configuration...");
        try {
            await this.packageJsonService.installPackages(COMMITLINT_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
            await this.createConfigs();
            await this.setupHusky();
            await this.setupPackageJsonConfigs();
            await this.setupScripts();
            this.cliInterfaceService.stopSpinner("Commitlint and Commitizen configuration completed successfully!");
            this.displaySetupSummary();
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to setup Commitlint and Commitizen configuration");
            throw error;
        }
    }
    async createConfigs() {
        // Create commitlint.config.js
        await this.fileSystemService.writeFile("commitlint.config.js", COMMITLINT_CONFIG, "utf8");
    }
    async setupHusky() {
        // Initialize husky
        await this.commandService.execute("npx husky install");
        // Add prepare script if it doesn't exist
        await this.packageJsonService.addScript("prepare", "husky install");
        // Create commit-msg hook
        await this.commandService.execute("mkdir -p .husky");
        await this.fileSystemService.writeFile(".husky/commit-msg", COMMITLINT_CONFIG_HUSKY_COMMIT_MSG_SCRIPT, "utf8");
        await this.commandService.execute("chmod +x .husky/commit-msg");
    }
    async setupPackageJsonConfigs() {
        const packageJson = await this.packageJsonService.get();
        if (!packageJson.config) {
            packageJson.config = {};
        }
        packageJson.config.commitizen = {
            path: "@commitlint/cz-commitlint",
        };
        await this.packageJsonService.set(packageJson);
    }
    async setupScripts() {
        await this.packageJsonService.addScript("commit", "cz");
    }
    displaySetupSummary() {
        const summary = ["Commitlint and Commitizen configuration has been created.", "", "Generated scripts:", "- npm run commit (for commitizen)", "", "Configuration files:", "- commitlint.config.js", "- .husky/commit-msg", "", "Husky git hooks have been set up to validate your commits.", "Use 'npm run commit' to create commits using the interactive commitizen interface."];
        this.cliInterfaceService.note("Commitlint Setup", summary.join("\n"));
    }
}

const SEMANTIC_RELEASE_CONFIG_FILE_NAME = "release.config.js";

const SEMANTIC_RELEASE_CONFIG = {
    template: (repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel) => {
        let branchesConfig = `  branches: [
    '${mainBranch}'`;
        if (preReleaseBranch && preReleaseChannel) {
            branchesConfig += `,
    {
      name: '${preReleaseBranch}',
      prerelease: true,
      channel: '${preReleaseChannel}',
    }`;
        }
        branchesConfig += `
  ],`;
        return `module.exports = {
${branchesConfig}
  repositoryUrl: '${repositoryUrl}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'docs/CHANGELOG.md',
      },
    ],
    '@semantic-release/github',
    [
      '@semantic-release/npm',
      {
        access: 'public',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['docs', 'package.json'],
        message: 'chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}',
      },
    ],
  ],
};`;
    },
};

const SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES = ["semantic-release", "@semantic-release/commit-analyzer", "@semantic-release/release-notes-generator", "@semantic-release/changelog", "@semantic-release/npm", "@semantic-release/github", "@semantic-release/git"];

const SEMANTIC_RELEASE_CONFIG_FILE_NAMES = ["release.config.js", ".releaserc", ".releaserc.js", ".releaserc.json", ".releaserc.yaml", ".releaserc.yml"];

class SemanticReleaseModuleService {
    cliInterfaceService;
    fileSystemService;
    packageJsonService;
    commandService;
    configService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.commandService = new NodeCommandService();
        this.packageJsonService = new PackageJsonService(fileSystemService, this.commandService);
        this.configService = new ConfigService(fileSystemService);
    }
    async install() {
        try {
            if (!(await this.shouldInstall())) {
                return { wasInstalled: false };
            }
            if (!(await this.handleExistingSetup())) {
                return { wasInstalled: false };
            }
            const setupParams = await this.setupSemanticRelease();
            return {
                wasInstalled: true,
                customProperties: setupParams,
            };
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to complete Semantic Release setup", error);
            throw error;
        }
    }
    async shouldInstall() {
        try {
            return !!(await this.cliInterfaceService.confirm("Do you want to set up Semantic Release for automated versioning and publishing?", true));
        }
        catch (error) {
            this.cliInterfaceService.handleError("Failed to get user confirmation", error);
            return false;
        }
    }
    async handleExistingSetup() {
        const existingFiles = await this.findExistingConfigFiles();
        if (existingFiles.length > 0) {
            const messageLines = ["Existing Semantic Release configuration files detected:"];
            messageLines.push("");
            if (existingFiles.length > 0) {
                existingFiles.forEach((file) => {
                    messageLines.push(`- ${file}`);
                });
            }
            messageLines.push("", "Do you want to delete them?");
            const shouldDelete = await this.cliInterfaceService.confirm(messageLines.join("\n"), true);
            if (shouldDelete) {
                await Promise.all([...existingFiles.map((file) => this.fileSystemService.deleteFile(file))]);
            }
            else {
                this.cliInterfaceService.warn("Existing Semantic Release configuration files detected. Setup aborted.");
                return false;
            }
        }
        return true;
    }
    async findExistingConfigFiles() {
        const existingFiles = [];
        for (const file of SEMANTIC_RELEASE_CONFIG_FILE_NAMES) {
            if (await this.fileSystemService.isPathExists(file)) {
                existingFiles.push(file);
            }
        }
        if (await this.fileSystemService.isPathExists("docs/CHANGELOG.md")) {
            existingFiles.push("docs/CHANGELOG.md");
        }
        return existingFiles;
    }
    async getMainBranch() {
        const savedConfig = await this.getSavedConfig();
        const initialBranch = savedConfig?.mainBranch || "main";
        return await this.cliInterfaceService.text("Enter the name of your main release branch:", "main", initialBranch, (value) => {
            if (!value) {
                return "Main branch name is required";
            }
            return undefined;
        });
    }
    async needsPreReleaseChannel() {
        const savedConfig = await this.getSavedConfig();
        const initialValue = savedConfig?.needsPreRelease === true ? true : false;
        return !!(await this.cliInterfaceService.confirm("Do you want to configure a pre-release channel for development branches?", initialValue));
    }
    async getPreReleaseBranch() {
        const savedConfig = await this.getSavedConfig();
        const initialBranch = savedConfig?.preReleaseBranch || "dev";
        return await this.cliInterfaceService.text("Enter the name of your pre-release branch:", "dev", initialBranch, (value) => {
            if (!value) {
                return "Pre-release branch name is required";
            }
            return undefined;
        });
    }
    async getPreReleaseChannel() {
        const savedConfig = await this.getSavedConfig();
        const initialChannel = savedConfig?.preReleaseChannel || "beta";
        return await this.cliInterfaceService.text("Enter the pre-release channel name (e.g., beta, alpha, next):", "beta", initialChannel, (value) => {
            if (!value) {
                return "Pre-release channel name is required";
            }
            return undefined;
        });
    }
    async getSavedConfig() {
        try {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                if (config[EModule.SEMANTIC_RELEASE]) {
                    return config[EModule.SEMANTIC_RELEASE];
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async setupSemanticRelease() {
        try {
            const params = {};
            const repositoryUrl = await this.getRepositoryUrl();
            params["repositoryUrl"] = repositoryUrl;
            const mainBranch = await this.getMainBranch();
            params["mainBranch"] = mainBranch;
            const needsPreRelease = await this.needsPreReleaseChannel();
            params["needsPreRelease"] = needsPreRelease;
            let preReleaseBranch = undefined;
            let preReleaseChannel = undefined;
            if (needsPreRelease) {
                preReleaseBranch = await this.getPreReleaseBranch();
                params["preReleaseBranch"] = preReleaseBranch;
                preReleaseChannel = await this.getPreReleaseChannel();
                params["preReleaseChannel"] = preReleaseChannel;
            }
            this.cliInterfaceService.startSpinner("Setting up Semantic Release configuration...");
            await this.packageJsonService.installPackages(SEMANTIC_RELEASE_CONFIG_CORE_DEPENDENCIES, "latest", "devDependencies");
            await this.createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel);
            await this.setupScripts();
            await this.ensureChangelogDirectory();
            this.cliInterfaceService.stopSpinner("Semantic Release configuration completed successfully!");
            this.displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel);
            return params;
        }
        catch (error) {
            this.cliInterfaceService.stopSpinner("Failed to setup Semantic Release configuration");
            throw error;
        }
    }
    async getRepositoryUrl() {
        const savedConfig = await this.getSavedConfig();
        let savedRepoUrl = savedConfig?.repositoryUrl || "";
        if (!savedRepoUrl) {
            const packageJson = await this.packageJsonService.get();
            if (packageJson.repository) {
                savedRepoUrl = typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository.url || "";
            }
            if (savedRepoUrl.startsWith("git+")) {
                savedRepoUrl = savedRepoUrl.substring(4);
            }
            if (savedRepoUrl.endsWith(".git")) {
                savedRepoUrl = savedRepoUrl.substring(0, savedRepoUrl.length - 4);
            }
        }
        if (!savedRepoUrl) {
            savedRepoUrl = await this.cliInterfaceService.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, undefined, (value) => {
                if (!value) {
                    return "Repository URL is required";
                }
                if (!value.startsWith("https://") && !value.startsWith("http://")) {
                    return "Repository URL must start with 'https://' or 'http://'";
                }
                return undefined;
            });
        }
        else {
            const confirmUrl = await this.cliInterfaceService.confirm(`Found repository URL: ${savedRepoUrl}\nIs this correct?`, true);
            if (!confirmUrl) {
                savedRepoUrl = await this.cliInterfaceService.text("Enter your repository URL (e.g., https://github.com/username/repo):", undefined, savedRepoUrl, (value) => {
                    if (!value) {
                        return "Repository URL is required";
                    }
                    if (!value.startsWith("https://") && !value.startsWith("http://")) {
                        return "Repository URL must start with 'https://' or 'http://'";
                    }
                    return undefined;
                });
            }
        }
        return savedRepoUrl;
    }
    async createConfigs(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel) {
        await this.fileSystemService.writeFile(SEMANTIC_RELEASE_CONFIG_FILE_NAME, SEMANTIC_RELEASE_CONFIG.template(repositoryUrl, mainBranch, preReleaseBranch, preReleaseChannel), "utf8");
    }
    async ensureChangelogDirectory() {
        if (!(await this.fileSystemService.isPathExists("docs"))) {
            await this.commandService.execute("mkdir -p docs");
        }
    }
    async setupScripts() {
        await this.packageJsonService.addScript("semantic-release", "semantic-release");
        await this.packageJsonService.addScript("release", "semantic-release");
        const ciScript = "npm run test && npm run build && npm run semantic-release";
        await this.packageJsonService.addScript("ci", ciScript);
    }
    displaySetupSummary(mainBranch, preReleaseBranch, preReleaseChannel) {
        const summary = ["Semantic Release configuration has been created.", "", "Release branches:", `- Main release branch: ${mainBranch}`];
        if (preReleaseBranch && preReleaseChannel) {
            summary.push(`- Pre-release branch: ${preReleaseBranch} (channel: ${preReleaseChannel})`);
        }
        summary.push("", "Generated scripts:", "- npm run semantic-release", "- npm run release (alias)", "- npm run ci (runs tests, build, and release)", "", "Configuration files:", `- ${SEMANTIC_RELEASE_CONFIG_FILE_NAME}`, "", "Changelog location:", "- docs/CHANGELOG.md", "", "Note: To use Semantic Release effectively, you should:", "1. Configure CI/CD in your repository", "2. Set up required access tokens (GITHUB_TOKEN, NPM_TOKEN)", "3. Use conventional commits (works with the Commitlint setup)");
        this.cliInterfaceService.note("Semantic Release Setup", summary.join("\n"));
    }
}

class ModuleServiceMapper {
    cliInterfaceService;
    fileSystemService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }
    getModuleService(module) {
        switch (module) {
            case EModule.LICENSE:
                return new LicenseModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.GITIGNORE:
                return new GitignoreModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.CI:
                return new CiModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.IDE:
                return new IdeModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.ESLINT:
                return new EslintModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.PRETTIER:
                return new PrettierModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.STYLELINT:
                return new StylelintModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.COMMITLINT:
                return new CommitlintModuleService(this.cliInterfaceService, this.fileSystemService);
            case EModule.SEMANTIC_RELEASE:
                return new SemanticReleaseModuleService(this.cliInterfaceService, this.fileSystemService);
            default:
                throw new Error(`Module ${module} is not supported`);
        }
    }
}

class ConfigMapper {
    static fromConfigToInitCommandProperties(config) {
        const properties = {};
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const value = config[key];
                if (typeof value === "boolean") {
                    properties[key] = value;
                }
                else if (value && typeof value === "object" && "isEnabled" in value) {
                    properties[key] = value.isEnabled;
                }
                else {
                    properties[key] = !!value;
                }
            }
        }
        return properties;
    }
    static fromSetupResultsToConfig(setupResults) {
        const config = {};
        for (const key in setupResults) {
            if (Object.prototype.hasOwnProperty.call(setupResults, key)) {
                config[key] = { isEnabled: setupResults[key]?.wasInstalled, ...setupResults[key]?.customProperties };
            }
        }
        return config;
    }
}

class InitCommand {
    properties;
    cliInterfaceService;
    fileSystemService;
    configService;
    constructor(properties, cliInterfaceService, fileSystemService) {
        this.properties = properties;
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
        this.configService = new ConfigService(fileSystemService);
    }
    async execute() {
        let properties = this.properties;
        console.log("PROPERTIES", properties);
        if (Object.values(properties).every((value) => value === false)) {
            if (await this.configService.exists()) {
                const config = await this.configService.get();
                properties = ConfigMapper.fromConfigToInitCommandProperties(config);
                if (Object.values(properties).every((value) => value === false)) {
                    this.cliInterfaceService.info(`Configuration was found but no modules were enabled.\n\nPlease edit the configuration file to enable modules or:\n- pass the --all flag to enable all modules\n- pass command flags to enable specific modules`);
                    return;
                }
            }
        }
        const moduleServiceMapper = new ModuleServiceMapper(this.cliInterfaceService, this.fileSystemService);
        this.cliInterfaceService.clear();
        const shouldInstallAll = Object.values(properties).every((value) => value === false);
        const modulesToInstall = [];
        const setupResults = {};
        if (shouldInstallAll) {
            modulesToInstall.push(...Object.values(EModule));
        }
        else {
            for (const [module, shouldInstall] of Object.entries(properties)) {
                if (shouldInstall) {
                    modulesToInstall.push(module);
                }
            }
        }
        for (const module of modulesToInstall) {
            const moduleService = moduleServiceMapper.getModuleService(module);
            const result = await moduleService.install();
            setupResults[module] = result;
        }
        await this.configService.merge(ConfigMapper.fromSetupResultsToConfig(setupResults));
    }
}

class AnalyzeCommand {
    properties;
    cliInterfaceService;
    fileSystemService;
    constructor(properties, cliInterfaceService, fileSystemService) {
        this.properties = properties;
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }
    async execute() {
        this.cliInterfaceService.clear();
        this.cliInterfaceService.confirm("ANALYTZE???");
    }
}

class CommandFactory {
    cliInterfaceService;
    fileSystemService;
    constructor(cliInterfaceService, fileSystemService) {
        this.cliInterfaceService = cliInterfaceService;
        this.fileSystemService = fileSystemService;
    }
    createCommand(name, options) {
        switch (name) {
            case ECommand.INIT:
                return new InitCommand(options, this.cliInterfaceService, this.fileSystemService);
            case ECommand.ANALYZE:
                return new AnalyzeCommand(options, this.cliInterfaceService, this.fileSystemService);
            default:
                throw new Error(`Unknown command: ${name}`);
        }
    }
}

class ClackCliInterface {
    SPINNER;
    constructor() { }
    async multiselect(message, options, required, initialValues) {
        const result = (await multiselect({
            options,
            message: `${message} (space to select)`,
            required,
            initialValues,
        }));
        if (isCancel(result)) {
            this.error("Operation cancelled by user");
            process.exit(0);
        }
        else {
            return result;
        }
    }
    async groupMultiselect(message, options, required, initialValues) {
        const result = (await groupMultiselect({
            options,
            message: `${message} (space to select)`,
            required,
            initialValues,
        }));
        if (isCancel(result)) {
            this.error("Operation cancelled by user");
            process.exit(0);
        }
        else {
            return result;
        }
    }
    async text(message, placeholder, initialValue, validate) {
        const result = (await text({
            initialValue,
            message,
            placeholder,
            validate,
        }));
        if (isCancel(result)) {
            this.error("Operation cancelled by user");
            process.exit(0);
        }
        else {
            return result;
        }
    }
    note(title, message) {
        note(message, title);
    }
    warn(message) {
        log.warn(message);
    }
    log(message) {
        log.message(message);
    }
    handleError(message, error) {
        log.error(message);
        console.log(error);
    }
    error(message) {
        log.error(message);
    }
    success(message) {
        log.success(message);
    }
    clear() {
        console.clear();
    }
    info(message) {
        log.info(message);
    }
    async confirm(message, initialValue) {
        const result = (await confirm({
            initialValue,
            message,
        }));
        if (isCancel(result)) {
            this.error("Operation cancelled by user");
            process.exit(0);
        }
        else {
            return result;
        }
    }
    startSpinner(message) {
        if (typeof this.SPINNER?.stop === "function") {
            this.SPINNER.stop();
        }
        this.SPINNER = spinner();
        this.SPINNER.start(message);
    }
    stopSpinner(message) {
        if (typeof this.SPINNER?.stop === "function") {
            this.SPINNER.stop(message);
        }
    }
    async select(message, options, initialValue) {
        const result = (await select({
            options,
            message,
            initialValue,
        }));
        if (isCancel(result)) {
            this.error("Operation cancelled by user");
            process.exit(0);
        }
        else {
            return result;
        }
    }
}

class AnalyzeCommandRegistrar {
    program;
    commandFactory;
    constructor(program, commandFactory) {
        this.program = program;
        this.commandFactory = commandFactory;
    }
    execute() {
        return this.program
            .command(ECommand.ANALYZE)
            .description(`Analyze project structure and dependencies')

This command will check is project has all instruments from Setup-Wizard.

Options:
  -e, --hasEslint    Checks for ESLint configuration
  -p, --hasPrettier     Checks for Prettier configuration`)
            .option('-e, --hasEslint', 'Checks for ESLint configuration')
            .option('-p, --hasPrettier', 'Checks for Prettier configuration')
            .action(async (options) => {
            const command = this.commandFactory.createCommand(ECommand.ANALYZE, options);
            await command.execute();
        });
    }
}

class NodeFileSystemService {
    async readFile(filePath, encoding = 'utf8') {
        return await fs.readFile(filePath, { encoding });
    }
    async writeFile(filePath, content, encoding = 'utf8') {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, { encoding });
    }
    async deleteFile(filePath) {
        await fs.unlink(filePath);
    }
    async isPathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async isOneOfPathsExists(paths) {
        let existingFilePath = undefined;
        for (const path of paths) {
            if (await this.isPathExists(path)) {
                existingFilePath = path;
                break;
            }
        }
        return existingFilePath;
    }
    async createDirectory(directoryPath, options) {
        directoryPath = path.dirname(directoryPath);
        await fs.mkdir(directoryPath, options);
    }
}

const program = new Command();
program.name("@elsikora/setup-wizard").description("Project scaffolder by ElsiKora").version("1.0.0");
const CliInterfaceService = new ClackCliInterface();
const FileSystemService = new NodeFileSystemService();
new InitCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();
new AnalyzeCommandRegistrar(program, new CommandFactory(CliInterfaceService, FileSystemService)).execute();
program.parse(process.argv);
//# sourceMappingURL=index.js.map
