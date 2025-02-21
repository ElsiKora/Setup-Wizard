import type { IIdeConfigContent } from "./ide-config-content.interface";

export interface IIdeConfig {
	content: Array<IIdeConfigContent>;
	description: string;
	name: string;
}
