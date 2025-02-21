import type { EPackageJsonDependencyType } from "../enum/package-json-dependency-type.enum";
import type { TPackageJsonScripts } from "../type/package-json-scripts.type";

import type { IPackageJsonAuthor } from "./package-json-author.interface";
import type { IPackageJsonBugs } from "./package-json-bugs.interface";
import type { IPackageJsonRepository } from "./package-json-repository.interface";

export interface IPackageJson {
	[EPackageJsonDependencyType.DEV]?: Record<string, string>;
	[EPackageJsonDependencyType.OPTIONAL]?: Record<string, string>;
	[EPackageJsonDependencyType.PEER]?: Record<string, string>;
	[EPackageJsonDependencyType.PROD]?: Record<string, string>;
	author?: IPackageJsonAuthor | string;
	bugs?: IPackageJsonBugs | string;
	config?: Record<string, any>;
	contributors?: Array<IPackageJsonAuthor | string>;
	description?: string;
	engines?: Record<string, string>;
	eslintConfig?: Record<string, any>;
	homepage?: string;
	keywords?: Array<string>;
	license?: string;
	"lint-staged"?: Record<string, string>;
	main?: string;
	name: string;
	prettier?: Record<string, any>;
	// eslint-disable-next-line @elsikora-typescript/naming-convention
	private?: boolean;
	repository?: IPackageJsonRepository | string;
	scripts?: TPackageJsonScripts;
	stylelint?: Record<string, any>;
	type?: "commonjs" | "module";
	version: string;
	workspaces?: { packages: Array<string> } | Array<string>;
}
