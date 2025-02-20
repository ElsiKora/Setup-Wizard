import { IFileSystemService } from "../interface/file-system-service.interface";
import { IConfig } from "../interface/config.interface";

export class ConfigService {
	private readonly filePath = "elsikora-sw.config.js";

	constructor(private readonly fileSystemService: IFileSystemService) {}

	async get(): Promise<IConfig> {
		try {
			if (!(await this.exists())) {
				return {} as IConfig;
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
				} catch (evalError) {
					console.error("Failed to parse config:", evalError);
					return {} as IConfig;
				}
			}

			return JSON.parse(content);
		} catch (error) {
			console.error("Error reading config:", error);
			return {} as IConfig;
		}
	}

	async set(config: IConfig): Promise<void> {
		const configContent = `export default ${this.objectToJsString(config)};`;
		await this.fileSystemService.writeFile(this.filePath, configContent);
	}

	private objectToJsString(obj: any, indent = 0): string {
		if (obj === null) return "null";
		if (obj === undefined) return "undefined";

		const indentStr = " ".repeat(indent);
		const nextIndentStr = " ".repeat(indent + 2);

		if (Array.isArray(obj)) {
			if (obj.length === 0) return "[]";

			const items = obj.map((item) => `${nextIndentStr}${this.objectToJsString(item, indent + 2)}`).join(",\n");

			return `[\n${items}\n${indentStr}]`;
		}

		if (typeof obj === "object") {
			if (Object.keys(obj).length === 0) return "{}";

			const entries = Object.entries(obj)
				.map(([key, value]) => {
					const formattedKey = this.needsQuotes(key) ? `"${key}"` : key;

					return `${nextIndentStr}${formattedKey}: ${this.objectToJsString(value, indent + 2)}`;
				})
				.join(",\n");

			return `{\n${entries}\n${indentStr}}`;
		}

		if (typeof obj === "string") return `'${obj.replace(/'/g, "\\'")}'`;
		if (typeof obj === "function") return obj.toString();

		return String(obj);
	}

	private needsQuotes(key: string): boolean {
		const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
		const reservedWords = new Set(["break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with", "yield"]);

		return !validIdentifier.test(key) || reservedWords.has(key) || key.includes("-");
	}

	async getProperty<K extends keyof IConfig>(property: K): Promise<IConfig[K]> {
		const config = await this.get();
		return config[property];
	}

	async setProperty<K extends keyof IConfig>(property: K, value: IConfig[K]): Promise<void> {
		const config = await this.get();
		config[property] = value;
		await this.set(config);
	}

	async exists(): Promise<boolean> {
		return this.fileSystemService.isPathExists(this.filePath);
	}

	async merge(partial: Partial<IConfig>): Promise<void> {
		try {
			// Если partial пустой, просто возвращаемся без изменений
			if (Object.keys(partial).length === 0) {
				return;
			}

			const config = (await this.exists()) ? await this.get() : ({} as IConfig);

			const deepMerge = (target: any, source: any): any => {
				const result = { ...target };

				for (const key in source) {
					if (source[key] instanceof Object && key in target && target[key] instanceof Object && !(source[key] instanceof Array) && !(target[key] instanceof Array)) {
						result[key] = deepMerge(target[key], source[key]);
					} else {
						result[key] = source[key];
					}
				}

				return result;
			};

			const merged = deepMerge(config, partial);
			await this.set(merged);
		} catch (error) {
			console.error("Error merging config:", error);
			await this.set(partial as IConfig);
		}
	}
}
