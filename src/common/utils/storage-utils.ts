import {
    StorageError,
    type CollectionList,
    type DataStorage,
    type Store,
} from "@common/types";

export class ObjectStorage<StorageTypes> {
    private storage: Store<StorageTypes>;

    constructor() {
        this.storage = {};
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
        if (!this.storage[namespace.toUpperCase()]) {
            throw new StorageError(`Could not find namespace: ${namespace}`, {
                status: 404,
            });
        }
        if (!this.storage[namespace.toUpperCase()][collection.toUpperCase()]) {
            throw new StorageError(
                `Could not find collection: ${collection} in ${namespace}`,
                { status: 404 }
            );
        }

        return this.storage[namespace.toUpperCase()][collection.toUpperCase()];
    };

    /**
     * Returns a list of available Collections within a namespace
     * @param {string} namespace - The namespace of the collections
     * @returns {CollectionList[]} A list of available Sub-Collections
     */
    public list = (namespace: string): CollectionList[] => {
        if (!this.storage[namespace]) {
            throw new StorageError(
                `No items available in namespace: ${namespace}`,
                { status: 404 }
            );
        }

        const items = { ...this.storage[namespace] };
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
        if (!this.storage[namespace.toUpperCase()]) {
            this.storage[namespace.toUpperCase()] = {};
        }

        // TODO: Check if item exists and replace/ignore
        // TODO: Add expiration to ensure that cleanup takes place
        this.storage[namespace.toUpperCase()][collectionName.toUpperCase()] = {
            items,
            updated: new Date(),
            description,
        };
    };
}
