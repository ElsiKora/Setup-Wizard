export interface IIdeConfigContent {
	filePath: string;
	template: (properties?: Record<string, unknown>) => string;
}
