import { EEslintFeature } from "../enum/eslint-feature.enum";
import { IFrameworkConfigIgnorePath } from "./framework-config-ignore-path.interface";
import { EFramework } from "../enum/framework.enum";

export interface IFrameworkConfig {
  name: EFramework;
  displayName: string;
  description?: string;
  fileIndicators?: string[];
  isSupportWatch?: boolean;
  packageIndicators: {
    dependencies?: string[];
    devDependencies?: string[];
    either?: string[];
  };
  lintPaths: string[];
  ignorePath: IFrameworkConfigIgnorePath;
  features: Array<EEslintFeature>;
}
