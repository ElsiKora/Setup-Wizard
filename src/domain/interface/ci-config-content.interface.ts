export interface ICiConfigContent {
	filePath: string;
	template: (properties?: Record<string, string>) => string;
}
