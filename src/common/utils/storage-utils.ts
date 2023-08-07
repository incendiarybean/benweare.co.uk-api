import {
    StorageError,
    type CollectionList,
    type DataStorage,
    type Store,
} from "@common/types";

export class DataStore<StorageTypes> {
    private store: Store<StorageTypes>;

    constructor() {
        this.store = {};
    }

    /**
     * Searches the given namespace for a matching collection name
     * @param {string} namespace - Namespace of collection
     * @param {string} collection - Name of collection to return
     * @returns {DataStorage} - The returned collection from the namespace
     */
    public search = (
        namespace: string,
        collection: string
    ): DataStorage<StorageTypes> => {
        if (!this.store[namespace.toUpperCase()]) {
            throw new StorageError(`Could not find namespace: ${namespace}`, {
                status: 404,
            });
        }
        if (!this.store[namespace.toUpperCase()][collection.toUpperCase()]) {
            throw new StorageError(
                `Could not find collection: ${collection} in ${namespace}`,
                { status: 404 }
            );
        }

        return this.store[namespace.toUpperCase()][collection.toUpperCase()];
    };

    /**
     * Returns a list of available Collections within a namespace
     * @param {string} namespace - The namespace of the collections
     * @returns {CollectionList[]} A list of available Sub-Collections
     */
    public list = (namespace: string): CollectionList[] => {
        if (!this.store[namespace]) {
            throw new StorageError(
                `No items available in namespace: ${namespace}`,
                { status: 404 }
            );
        }

        const items = { ...this.store[namespace] };
        return Object.entries(items).map(([key, { description, updated }]) => ({
            name: key,
            description,
            updated,
        }));
    };

    /**
     * Writes a collection of data to the given namespace
     * @param {string} namespace - Namespace for collection to be stored in
     * @param {string} collectionName - Name of Collection
     * @param {string} description - Service description
     * @param {StorageTypes[]} items - Formatted data object
     */
    public write = (
        namespace: string,
        collectionName: string,
        description: string,
        items: StorageTypes[]
    ): void => {
        if (!this.store[namespace.toUpperCase()]) {
            this.store[namespace.toUpperCase()] = {};
        }

        // TODO: Check if item exists and replace/ignore
        // TODO: Add expiration to ensure that cleanup takes place
        this.store[namespace.toUpperCase()][collectionName.toUpperCase()] = {
            items,
            updated: new Date(),
            description,
        };
    };
}
