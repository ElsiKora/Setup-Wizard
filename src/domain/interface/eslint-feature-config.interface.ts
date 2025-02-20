export interface IEslintFeatureConfig {
  description: string;
  packages?: string[];
  required?: boolean;
  detect?: string[];
  requiresTypescript?: boolean;
  configFlag: string;
}
