import { IPackageJson } from "../../domain/interface/package-json.interface";
import { IFileSystemService } from "../interface/file-system-service.interface";
import { ICommandService } from "../interface/command-service.interface";
import { EPackageJsonDependencyVersionFlag } from "../../domain/enum/package-json-dependency-version-flag.enum";

export class PackageJsonService {
	private readonly filePath = "package.json";

	constructor(
		private readonly fileSystemService: IFileSystemService,
		private readonly commandService: ICommandService,
	) {}

	async get(): Promise<IPackageJson> {
		const content = await this.fileSystemService.readFile(this.filePath);
		return JSON.parse(content);
	}

	async set(packageJson: IPackageJson): Promise<void> {
		await this.fileSystemService.writeFile(this.filePath, JSON.stringify(packageJson, null, 2));
	}

	async getProperty<K extends keyof IPackageJson>(property: K): Promise<IPackageJson[K]> {
		const packageJson = await this.get();
		return packageJson[property];
	}

	async setProperty<K extends keyof IPackageJson>(property: K, value: IPackageJson[K]): Promise<void> {
		const packageJson = await this.get();
		packageJson[property] = value;
		await this.set(packageJson);
	}

	async addDependency(name: string, version: string, type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" = "dependencies"): Promise<void> {
		const packageJson = await this.get();
		packageJson[type] = packageJson[type] || {};
		packageJson[type]![name] = version;
		await this.set(packageJson);
	}

	async removeDependency(name: string, type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" = "dependencies"): Promise<void> {
		const packageJson = await this.get();
		if (packageJson[type] && packageJson[type]![name]) {
			delete packageJson[type]![name];
			await this.set(packageJson);
		}
	}

	async addScript(name: string, command: string): Promise<void> {
		const packageJson = await this.get();
		packageJson.scripts = packageJson.scripts || {};
		packageJson.scripts[name] = command;
		await this.set(packageJson);
	}

	async removeScript(name: string): Promise<void> {
		const packageJson = await this.get();
		if (packageJson.scripts && packageJson.scripts[name]) {
			delete packageJson.scripts[name];
			await this.set(packageJson);
		}
	}

	async exists(): Promise<boolean> {
		return this.fileSystemService.isPathExists(this.filePath);
	}

	async getInstalledDependencyVersion(
		name: string,
		type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" | "any" = "any",
	): Promise<
		| {
				flag: EPackageJsonDependencyVersionFlag;
				version: string;
				majorVersion: number;
				minorVersion: number;
				patchVersion: number;
				prereleaseChannel?: string;
				isPrerelease: boolean;
		  }
		| undefined
	> {
		console.log("name", name);
		console.log("type", type);

		const packageJson = await this.get();
		let versionString: string | undefined;

		if (type === "any") {
			versionString = packageJson.dependencies?.[name] || packageJson.devDependencies?.[name] || packageJson.peerDependencies?.[name] || packageJson.optionalDependencies?.[name];
		} else {
			versionString = packageJson[type]?.[name];
		}

		if (!versionString) return undefined;

		let flag = EPackageJsonDependencyVersionFlag.ANY;
		let version = versionString;

		if (versionString.startsWith(">=")) {
			flag = EPackageJsonDependencyVersionFlag.GREATER_THAN_OR_EQUAL;
			version = versionString.substring(2);
		} else if (versionString.startsWith(">")) {
			flag = EPackageJsonDependencyVersionFlag.GREATER_THAN;
			version = versionString.substring(1);
		} else if (versionString.startsWith("<=")) {
			flag = EPackageJsonDependencyVersionFlag.LESS_THAN_OR_EQUAL;
			version = versionString.substring(2);
		} else if (versionString.startsWith("<")) {
			flag = EPackageJsonDependencyVersionFlag.LESS_THAN;
			version = versionString.substring(1);
		} else if (versionString.startsWith("=")) {
			flag = EPackageJsonDependencyVersionFlag.EXACT;
			version = versionString.substring(1);
		} else if (versionString.startsWith("~")) {
			flag = EPackageJsonDependencyVersionFlag.TILDE;
			version = versionString.substring(1);
		} else if (versionString.startsWith("^")) {
			flag = EPackageJsonDependencyVersionFlag.CARET;
			version = versionString.substring(1);
		}

		const cleanVersion = version.trim();

		let versionOnly = cleanVersion;
		let prereleaseChannel: string | undefined;
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

	async getDependencies(type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" = "dependencies"): Promise<Record<string, string>> {
		const packageJson = await this.get();
		return packageJson[type] || {};
	}

	async isExistsDependency(name: string, type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" | "any" = "any"): Promise<boolean> {
		const packageJson = await this.get();
		const dependencies = packageJson.dependencies || {};
		const devDependencies = packageJson.devDependencies || {};
		const peerDependencies = packageJson.peerDependencies || {};
		const optionalDependencies = packageJson.optionalDependencies || {};
		if (type === "any") {
			return !!dependencies[name] || !!devDependencies[name] || !!peerDependencies[name] || !!optionalDependencies[name];
		} else {
			return packageJson[type] ? !!packageJson[type]![name] : false;
		}
	}

	async merge(partial: Partial<IPackageJson>): Promise<void> {
		const packageJson = await this.get();
		const merged = { ...packageJson, ...partial };
		await this.set(merged);
	}

	async validate(): Promise<string[]> {
		const packageJson = await this.get();
		const requiredFields: (keyof IPackageJson)[] = ["name", "version"];
		const missingFields: (keyof IPackageJson)[] = requiredFields.filter((field) => !packageJson[field]);
		return missingFields;
	}

	async installPackages(packages: string | string[], version?: string, type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies" = "dependencies"): Promise<void> {
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

	async uninstallPackages(packages: string | string[]): Promise<void> {
		const packageList = Array.isArray(packages) ? packages : [packages];
		const packageString = packageList.join(" ");
		await this.commandService.execute(`npm uninstall ${packageString}`);
	}

	private getDependencyTypeFlag(type: "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies"): string {
		const flags = {
			dependencies: "--save",
			devDependencies: "--save-dev",
			peerDependencies: "--save-peer",
			optionalDependencies: "--save-optional",
		};
		return flags[type];
	}
}
