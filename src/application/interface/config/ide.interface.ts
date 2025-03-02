import type { EIde } from "../../../domain/enum/ide.enum";

export interface IConfigIde {
	ides?: Array<EIde>;
	isEnabled?: boolean;
}
