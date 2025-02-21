import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";

import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { EPackageJsonDependencyVersionFlag } from "../../domain/enum/package-json-dependency-version-flag.enum";
import { PACKAGE_JSON_FILE_PATH } from "../constant/package-json-file-path.constant";

export class PackageJsonService {
	readonly COMMAND_SERVICE: ICommandService;

	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	constructor(
		readonly fileSystemService: IFileSystemService,
		readonly commandService: ICommandService,
	) {
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = commandService;
	}

	async addDependency(name: string, version: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<void> {
		const packageJson: IPackageJson = await this.get();

		if (type === EPackageJsonDependencyType.ANY) {
			packageJson.dependencies = packageJson.dependencies ?? {};
			packageJson.dependencies[name] = version;
		} else {
			packageJson[type] = packageJson[type] ?? {};
			packageJson[type][name] = version;
		}

		await this.set(packageJson);
	}

	async addScript(name: string, command: string): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		packageJson.scripts = packageJson.scripts ?? {};
		packageJson.scripts[name] = command;
		await this.set(packageJson);
	}

	async exists(): Promise<boolean> {
		return this.fileSystemService.isPathExists(PACKAGE_JSON_FILE_PATH);
	}

	async get(): Promise<IPackageJson> {
		const content: string = await this.fileSystemService.readFile(PACKAGE_JSON_FILE_PATH);

		return JSON.parse(content) as IPackageJson;
	}

	async getDependencies(type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<Record<string, string>> {
		const packageJson: IPackageJson = await this.get();

		return type === EPackageJsonDependencyType.ANY
			? {
					...packageJson.dependencies,
					...packageJson.devDependencies,
					...packageJson.peerDependencies,
					...packageJson.optionalDependencies,
				}
			: (packageJson[type] ?? {});
	}

	async getInstalledDependencyVersion(
		name: string,
		type: EPackageJsonDependencyType = EPackageJsonDependencyType.ANY,
	): Promise<
		| {
				flag: EPackageJsonDependencyVersionFlag;
				isPrerelease: boolean;
				majorVersion: number;
				minorVersion: number;
				patchVersion: number;
				prereleaseChannel?: string;
				version: string;
		  }
		| undefined
	> {
		const packageJson: IPackageJson = await this.get();
		const versionString: string | undefined = type === EPackageJsonDependencyType.ANY ? (packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? packageJson.peerDependencies?.[name] ?? packageJson.optionalDependencies?.[name]) : packageJson[type]?.[name];

		if (!versionString) return undefined;

		let flag: EPackageJsonDependencyVersionFlag = EPackageJsonDependencyVersionFlag.ANY;
		let version: string = versionString;

		if (versionString.startsWith(">=")) {
			flag = EPackageJsonDependencyVersionFlag.GREATER_THAN_OR_EQUAL;
			// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
			version = versionString.slice(2);
		} else if (versionString.startsWith(">")) {
			flag = EPackageJsonDependencyVersionFlag.GREATER_THAN;
			version = versionString.slice(1);
		} else if (versionString.startsWith("<=")) {
			flag = EPackageJsonDependencyVersionFlag.LESS_THAN_OR_EQUAL;
			// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
			version = versionString.slice(2);
		} else if (versionString.startsWith("<")) {
			flag = EPackageJsonDependencyVersionFlag.LESS_THAN;
			version = versionString.slice(1);
		} else if (versionString.startsWith("=")) {
			flag = EPackageJsonDependencyVersionFlag.EXACT;
			version = versionString.slice(1);
		} else if (versionString.startsWith("~")) {
			flag = EPackageJsonDependencyVersionFlag.TILDE;
			version = versionString.slice(1);
		} else if (versionString.startsWith("^")) {
			flag = EPackageJsonDependencyVersionFlag.CARET;
			version = versionString.slice(1);
		}

		const cleanVersion: string = version.trim();

		let versionOnly: string = cleanVersion;
		let prereleaseChannel: string | undefined;
		let isPrerelease: boolean = false;

		const prereleaseMatch: null | RegExpExecArray = /[-+]([a-z0-9](?:[.-][a-z0-9])*)(?:\+[a-z0-9](?:[.-][a-z0-9])*)?$/i.exec(cleanVersion);

		if (prereleaseMatch) {
			isPrerelease = true;
			prereleaseChannel = prereleaseMatch[1];

			versionOnly = cleanVersion.split(/[-+]/)[0];
		}

		const versionParts: Array<number> = versionOnly.split(".").map((part: string) => Number.parseInt(part, 10));
		const majorVersion: number = versionParts[0] || 0;
		const minorVersion: number = versionParts[1] || 0;
		// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
		const patchVersion: number = versionParts[2] || 0;

		return {
			flag,
			isPrerelease,
			majorVersion,
			minorVersion,
			patchVersion,
			prereleaseChannel,
			version: cleanVersion,
		};
	}

	async getProperty<K extends keyof IPackageJson>(property: K): Promise<IPackageJson[K]> {
		const packageJson: IPackageJson = await this.get();

		return packageJson[property];
	}

	async installPackages(packages: Array<string> | string, version?: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<void> {
		const packageList: Array<string> = Array.isArray(packages) ? packages : [packages];
		const typeFlag: string = this.getDependencyTypeFlag(type);

		if (version && !Array.isArray(packages)) {
			const packageWithVersion: string = `${packages}@${version}`;
			await this.commandService.execute(`npm install ${typeFlag} ${packageWithVersion}`);

			return;
		}

		const packageString: string = packageList.join(" ");
		await this.commandService.execute(`npm install ${typeFlag} ${packageString}`);
	}

	async isExistsDependency(name: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.ANY): Promise<boolean> {
		const packageJson: IPackageJson = await this.get();
		const dependencies: Record<string, string> = packageJson.dependencies ?? {};
		const devDependencies: Record<string, string> = packageJson.devDependencies ?? {};
		const peerDependencies: Record<string, string> = packageJson.peerDependencies ?? {};
		const optionalDependencies: Record<string, string> = packageJson.optionalDependencies ?? {};

		if (type === EPackageJsonDependencyType.ANY) {
			return !!dependencies[name] || !!devDependencies[name] || !!peerDependencies[name] || !!optionalDependencies[name];
		} else {
			return packageJson[type] ? !!packageJson[type][name] : false;
		}
	}

	async merge(partial: Partial<IPackageJson>): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		const merged: IPackageJson = { ...packageJson, ...partial };
		await this.set(merged);
	}

	async removeDependency(name: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<void> {
		const packageJson: IPackageJson = await this.get();

		if (type === EPackageJsonDependencyType.ANY) {
			if (packageJson.dependencies?.[name]) {
				// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
				delete packageJson.dependencies[name];
			}

			if (packageJson.devDependencies?.[name]) {
				// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
				delete packageJson.devDependencies[name];
			}

			if (packageJson.peerDependencies?.[name]) {
				// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
				delete packageJson.peerDependencies[name];
			}

			if (packageJson.optionalDependencies?.[name]) {
				delete packageJson.optionalDependencies;
			}
		} else if (packageJson[type]?.[name]) {
			// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
			delete packageJson[type][name];
			await this.set(packageJson);
		}
	}

	async removeScript(name: string): Promise<void> {
		const packageJson: IPackageJson = await this.get();

		if (packageJson.scripts?.[name]) {
			// eslint-disable-next-line @elsikora-typescript/no-dynamic-delete
			delete packageJson.scripts[name];
			await this.set(packageJson);
		}
	}

	async set(packageJson: IPackageJson): Promise<void> {
		// eslint-disable-next-line @elsikora-typescript/no-magic-numbers
		await this.fileSystemService.writeFile(PACKAGE_JSON_FILE_PATH, JSON.stringify(packageJson, null, 2));
	}

	async setProperty<K extends keyof IPackageJson>(property: K, value: IPackageJson[K]): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		packageJson[property] = value;
		await this.set(packageJson);
	}

	async uninstallPackages(packages: Array<string> | string): Promise<void> {
		const packageList: Array<string> = Array.isArray(packages) ? packages : [packages];
		const packageString: string = packageList.join(" ");
		await this.commandService.execute(`npm uninstall ${packageString}`);
	}

	async validate(): Promise<Array<string>> {
		const packageJson: IPackageJson = await this.get();
		const requiredFields: Array<keyof IPackageJson> = ["name", "version"];
		const missingFields: Array<keyof IPackageJson> = requiredFields.filter((field: keyof IPackageJson) => !packageJson[field]);

		return missingFields;
	}

	private getDependencyTypeFlag(type: EPackageJsonDependencyType): string {
		const flags: Record<EPackageJsonDependencyType, string> = {
			[EPackageJsonDependencyType.ANY]: "--save",
			[EPackageJsonDependencyType.DEV]: "--save-dev",
			[EPackageJsonDependencyType.OPTIONAL]: "--save-optional",
			[EPackageJsonDependencyType.PEER]: "--save-peer",
			[EPackageJsonDependencyType.PROD]: "--save",
		};

		return flags[type];
	}
}
