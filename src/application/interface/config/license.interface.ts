import type { ELicense } from "../../../domain/enum/license.enum";

export interface IConfigLicense {
	author?: string;
	isEnabled?: boolean;
	license?: ELicense;
	year?: number;
}
