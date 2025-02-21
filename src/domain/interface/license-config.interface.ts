export interface ILicenseConfig {
	description: string;
	name: string;
	template: (year: string, author: string) => string;
}
