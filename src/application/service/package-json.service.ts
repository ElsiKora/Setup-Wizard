import type { IPackageJson } from "../../domain/interface/package-json.interface";
import type { ICommandService } from "../interface/command-service.interface";
import type { IFileSystemService } from "../interface/file-system-service.interface";

import { EPackageJsonDependencyType } from "../../domain/enum/package-json-dependency-type.enum";
import { EPackageJsonDependencyVersionFlag } from "../../domain/enum/package-json-dependency-version-flag.enum";
import { PACKAGE_JSON_FILE_PATH } from "../constant/package-json-file-path.constant";

/**
 * Service for managing package.json operations.
 * Handles reading, writing, and manipulating package.json file contents.
 */
export class PackageJsonService {
	/** Command service for executing npm commands */
	readonly COMMAND_SERVICE: ICommandService;

	/** File system service for reading and writing files */
	readonly FILE_SYSTEM_SERVICE: IFileSystemService;

	/**
	 * Initializes a new instance of the PackageJsonService.
	 * @param fileSystemService - Service for file system operations
	 * @param commandService - Service for executing commands
	 */
	constructor(
		readonly fileSystemService: IFileSystemService,
		readonly commandService: ICommandService,
	) {
		this.FILE_SYSTEM_SERVICE = fileSystemService;
		this.COMMAND_SERVICE = commandService;
	}

	/**
	 * Adds a dependency to the package.json file.
	 * @param name - The name of the dependency
	 * @param version - The version string of the dependency
	 * @param type - The type of dependency (prod, dev, peer, etc.), defaults to PROD
	 * @returns Promise that resolves when the dependency is added
	 */
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

	/**
	 * Adds a script to the package.json file.
	 * @param name - The name of the script
	 * @param command - The command to execute for the script
	 * @returns Promise that resolves when the script is added
	 */
	async addScript(name: string, command: string): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		packageJson.scripts = packageJson.scripts ?? {};
		packageJson.scripts[name] = command;
		await this.set(packageJson);
	}

	/**
	 * Checks if the package.json file exists.
	 * @returns Promise that resolves to true if the file exists, false otherwise
	 */
	async exists(): Promise<boolean> {
		return this.fileSystemService.isPathExists(PACKAGE_JSON_FILE_PATH);
	}

	/**
	 * Gets the contents of the package.json file.
	 * @returns Promise that resolves to the parsed package.json contents
	 */
	async get(): Promise<IPackageJson> {
		const content: string = await this.fileSystemService.readFile(PACKAGE_JSON_FILE_PATH);

		return JSON.parse(content) as IPackageJson;
	}

	/**
	 * Gets the dependencies of a specified type from the package.json file.
	 * @param type - The type of dependencies to get, defaults to PROD
	 * @returns Promise that resolves to a record of dependency names and versions
	 */
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

	/**
	 * Gets detailed version information for an installed dependency.
	 * Parses the version string to extract version parts and flags.
	 * @param name - The name of the dependency
	 * @param type - The type of dependency to check, defaults to ANY
	 * @returns Promise that resolves to detailed version information or undefined if not found
	 */
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
			// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
			version = versionString.slice(2);
		} else if (versionString.startsWith(">")) {
			flag = EPackageJsonDependencyVersionFlag.GREATER_THAN;
			version = versionString.slice(1);
		} else if (versionString.startsWith("<=")) {
			flag = EPackageJsonDependencyVersionFlag.LESS_THAN_OR_EQUAL;
			// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
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
		// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
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

	/**
	 * Gets a specific property from the package.json file.
	 * @param property - The property key to get
	 * @returns Promise that resolves to the property value
	 */
	async getProperty<K extends keyof IPackageJson>(property: K): Promise<IPackageJson[K]> {
		const packageJson: IPackageJson = await this.get();

		return packageJson[property];
	}

	/**
	 * Installs packages using npm.
	 * @param packages - The package(s) to install (string or array of strings)
	 * @param version - Optional version to install (only works with single package)
	 * @param type - The type of dependency to install as, defaults to PROD
	 * @returns Promise that resolves when installation is complete
	 */
	async installPackages(packages: Array<string> | string, version?: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<void> {
		const packageList: Array<string> = Array.isArray(packages) ? packages : [packages];
		const typeFlag: string = this.getDependencyTypeFlag(type);

		if (version && !Array.isArray(packages)) {
			const packageWithVersion: string = `${packages}@${version}`;
			await this.commandService.execute(`npm install ${typeFlag} ${packageWithVersion}`);

			return;
		}

		const packageString: string = packageList.join(`${version ? "@" + version : ""} `);
		await this.commandService.execute(`npm install ${typeFlag} ${packageString}`);
	}

	/**
	 * Checks if a dependency exists in the package.json file.
	 * @param name - The name of the dependency to check
	 * @param type - The type of dependency to check, defaults to ANY
	 * @returns Promise that resolves to true if the dependency exists, false otherwise
	 */
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

	/**
	 * Merges partial package.json data with the existing file.
	 * @param partial - The partial package.json data to merge
	 * @returns Promise that resolves when the merge is complete
	 */
	async merge(partial: Partial<IPackageJson>): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		const merged: IPackageJson = { ...packageJson, ...partial };
		await this.set(merged);
	}

	/**
	 * Removes a dependency from the package.json file.
	 * @param name - The name of the dependency to remove
	 * @param type - The type of dependency to remove, defaults to PROD
	 * @returns Promise that resolves when the dependency is removed
	 */
	async removeDependency(name: string, type: EPackageJsonDependencyType = EPackageJsonDependencyType.PROD): Promise<void> {
		const packageJson: IPackageJson = await this.get();

		if (type === EPackageJsonDependencyType.ANY) {
			if (packageJson.dependencies?.[name]) {
				// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
				delete packageJson.dependencies[name];
			}

			if (packageJson.devDependencies?.[name]) {
				// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
				delete packageJson.devDependencies[name];
			}

			if (packageJson.peerDependencies?.[name]) {
				// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
				delete packageJson.peerDependencies[name];
			}

			if (packageJson.optionalDependencies?.[name]) {
				delete packageJson.optionalDependencies;
			}
		} else if (packageJson[type]?.[name]) {
			// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
			delete packageJson[type][name];
			await this.set(packageJson);
		}
	}

	/**
	 * Removes a script from the package.json file.
	 * @param name - The name of the script to remove
	 * @returns Promise that resolves when the script is removed
	 */
	async removeScript(name: string): Promise<void> {
		const packageJson: IPackageJson = await this.get();

		if (packageJson.scripts?.[name]) {
			// eslint-disable-next-line @elsikora/typescript/no-dynamic-delete
			delete packageJson.scripts[name];
			await this.set(packageJson);
		}
	}

	/**
	 * Writes the package.json file with the provided content.
	 * @param packageJson - The package.json content to write
	 * @returns Promise that resolves when the file is written
	 */
	async set(packageJson: IPackageJson): Promise<void> {
		// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
		await this.fileSystemService.writeFile(PACKAGE_JSON_FILE_PATH, JSON.stringify(packageJson, null, 2));
	}

	/**
	 * Sets a specific property in the package.json file.
	 * @param property - The property key to set
	 * @param value - The value to set for the property
	 * @returns Promise that resolves when the property is set
	 */
	async setProperty<K extends keyof IPackageJson>(property: K, value: IPackageJson[K]): Promise<void> {
		const packageJson: IPackageJson = await this.get();
		packageJson[property] = value;
		await this.set(packageJson);
	}

	/**
	 * Uninstalls packages using npm.
	 * @param packages - The package(s) to uninstall (string or array of strings)
	 * @returns Promise that resolves when uninstallation is complete
	 */
	async uninstallPackages(packages: Array<string> | string): Promise<void> {
		const packageList: Array<string> = Array.isArray(packages) ? packages : [packages];
		const packageString: string = packageList.join(" ");
		await this.commandService.execute(`npm uninstall ${packageString}`);
	}

	/**
	 * Validates the package.json file for required fields.
	 * @returns Promise that resolves to an array of missing field names
	 */
	async validate(): Promise<Array<string>> {
		const packageJson: IPackageJson = await this.get();
		const requiredFields: Array<keyof IPackageJson> = ["name", "version"];
		const missingFields: Array<keyof IPackageJson> = requiredFields.filter((field: keyof IPackageJson) => !packageJson[field]);

		return missingFields;
	}

	/**
	 * Gets the npm flag for a dependency type.
	 * @param type - The type of dependency
	 * @returns The corresponding npm flag string
	 */
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
