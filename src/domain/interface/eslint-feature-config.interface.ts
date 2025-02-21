export interface IEslintFeatureConfig {
	configFlag: string;
	description: string;
	detect?: Array<string>;
	isRequired?: boolean;
	isRequiresTypescript?: boolean;
	packages?: Array<string>;
}
