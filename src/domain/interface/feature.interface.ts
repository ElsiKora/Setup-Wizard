export interface IFeature {
    name: string;
    description: string;
    required?: boolean;
    requiresTypescript?: boolean;
    packages: string[];
    detect?: string[];
}
