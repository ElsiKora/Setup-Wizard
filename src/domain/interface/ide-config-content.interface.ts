export interface IIdeConfigContent {
	filePath: string;
	template: (properties?: Record<string, any>) => string;
}
