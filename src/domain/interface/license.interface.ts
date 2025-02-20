export interface ILicense {
    name: string;
    description: string;
    template: (year: string, author: string) => string;
}
