import {EIde} from "../enum/ide.enum";
import {IIdeConfigContent} from "./ide-config-content.interface";

export interface IIdeConfig {
    name: string;
    description: string;
    content: IIdeConfigContent[];
}
