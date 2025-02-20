import { IPackageJsonBugs } from "./package-json-bugs.interface";
import { IPackageJsonRepository } from "./package-json-repository.interface";
import { IPackageJsonAuthor } from "./package-json-author.interface";
import { IPackageJsonScripts } from "./package-json-scripts.interface";

export interface IPackageJson {
	name: string;
	version: string;
	description?: string;
	main?: string;
	config?: Record<string, any>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
	scripts?: IPackageJsonScripts;
	author?: string | IPackageJsonAuthor;
	contributors?: Array<string | IPackageJsonAuthor>;
	homepage?: string;
	repository?: string | IPackageJsonRepository;
	bugs?: string | IPackageJsonBugs;
	license?: string;
	private?: boolean;
	workspaces?: string[] | { packages: string[] };
	eslintConfig?: Record<string, any>;
	prettier?: Record<string, any>;
	stylelint?: Record<string, any>;
	type?: "module" | "commonjs";
	engines?: Record<string, string>;
	keywords?: string[];
}
