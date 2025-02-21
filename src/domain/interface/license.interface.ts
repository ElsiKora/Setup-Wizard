export interface ILicense {
	description: string;
	name: string;
	template: (year: string, author: string) => string;
}
