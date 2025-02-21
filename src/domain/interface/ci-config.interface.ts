import type { ECiModuleType } from "../enum/ci-module-type.enum";
import type { ECiProvider } from "../enum/ci-provider.enum";

import type { ICiConfigContent } from "./ci-config-content.interface";

export interface ICiConfig {
	content: Record<ECiProvider, ICiConfigContent>;
	description: string;
	name: string;
	type: ECiModuleType;
}
