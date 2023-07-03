import type { DataStorage, NewsArticle, WeatherRecord } from "@common/types";

export class ObjectStorage {
    private storage: DataStorage[];

    constructor() {
        this.storage = [];
    }

    private getStorage = (omit?: string[]) => {
        if (!omit) {
            return this.storage;
        }
        return this.storage.map((item: any) => {
            const itemReturn: any = {};
            Object.keys(item).forEach((key) => {
                omit.forEach((omitValue) => {
                    if (key !== omitValue) {
                        itemReturn[key] = item[key];
                    }
                });
            });
            return itemReturn;
        });
    };

    /**
     * Filters storage object by name.
     * @param omit string[] - Array of keys to omit from return.
     * @returns DataStorage - Object of stored data.
     */
    public findByName = (query: string, omit?: string[]): DataStorage =>
        this.getStorage(omit).filter(
            (item: DataStorage) =>
                item.name.toLowerCase() === query.toLowerCase()
        )[0] || {};

    /**
     * Reads storage object.
     * @param omit string[] - Array of keys to omit from return.
     * @returns DataStorage - Object of stored data.
     */
    public read = (omit?: string[]): DataStorage[] => this.getStorage(omit);

    /**
     * @param name string - Name of service
     * @param items WeatherRecord[] | NewsArticle[] - Formatted data object
     * @param description string - Service description
     */
    public write = (
        name: string,
        items: WeatherRecord[] | NewsArticle[],
        description: string
    ): void => {
        const dataKeys = Object.keys(items);
        if (!dataKeys.length) {
            throw new Error("No data to write!");
        }

        const template: DataStorage = {
            name,
            items,
            updated: new Date(),
            description,
        };

        this.storage = [
            ...this.storage.filter(({ name }) => name !== template.name),
            template,
        ];
    };
}
