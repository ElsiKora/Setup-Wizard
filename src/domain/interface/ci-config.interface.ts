import {ECiProvider} from "../enum/ci-provider.enum";
import {ICiConfigContent} from "./ci-config-content.interface";
import {ECiModuleType} from "../enum/ci-module-type.enum";

export interface ICiConfig {
    type: ECiModuleType;
    name: string;
    description: string;
    content: Record<ECiProvider, ICiConfigContent>;
}
