import type {
    CollectionList,
    DataStorage,
    MapStorage,
    StorageErrorOptions,
    Store,
    TTLValue,
} from "@common/types";

export class StorageError extends Error {
    public status: number | undefined;
    constructor(message: string, options?: StorageErrorOptions) {
        super(message);
        this.status = options?.status;
    }
}

export class ObjectStorage<StorageTypes> {
    private storage: Store<StorageTypes>;
    private expiration: number;

    constructor(expiration?: number) {
        this.storage = {};
        // Default expiration to 36 hours if not provided
        this.expiration = expiration ?? 129600 * 1000;
    }

    private createId = (value: string): number => {
        let id = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            id = (id << 5) - id + char;
            id = id & id;
        }
        return id;
    };

    /**
     * Searches the given namespace for a matching collection name
     * @param {string} namespaceName - Name of Namespace to find collection
     * @param {string} collectionName - Name of collection to return
     * @returns {DataStorage} - The returned collection from the namespace
     */
    public search = (
        namespaceName: string,
        collectionName: string
    ): DataStorage<StorageTypes> => {
        const namespace = namespaceName.toUpperCase();
        const collection = collectionName.toUpperCase();

        if (!this.storage[namespace]) {
            throw new StorageError(`Could not find namespace: ${namespace}`, {
                status: 404,
            });
        }

        const storedData = this.storage[namespace].get(collection);
        if (!storedData) {
            throw new StorageError(
                `Could not find collection: ${collection} in ${namespace}`,
                { status: 404 }
            );
        }

        if (storedData.items.size === 0) {
            throw new StorageError(
                `Could not find items in collection: ${collection} in ${namespace}`,
                { status: 404 }
            );
        }

        // Return stored collection data, items organised by timestamp stored
        return {
            ...storedData,
            items: Array.from(storedData.items.values())
                .sort((x, y) => x.timestamp.valueOf() - y.timestamp.valueOf())
                .map(({ value }) => value),
        };
    };

    /**
     * Returns a list of available Collections within a namespace
     * @param {string} namespaceName - The Name of the Namespace to find the collections
     * @returns {CollectionList[]} A list of available Sub-Collections
     */
    public list = (namespaceName: string): CollectionList[] => {
        const namespace = namespaceName.toUpperCase();

        if (!this.storage[namespace]) {
            throw new StorageError(
                `No items available in namespace: ${namespace}`,
                { status: 404 }
            );
        }

        // Get all entries in Map and return them formatted with the Key as the name
        const items = Array.from(this.storage[namespace].entries());
        return items.map(([key, { description, updated }]) => ({
            name: key,
            description,
            updated,
        }));
    };

    /**
     * Writes a collection of data to the given namespace
     * @param {string} namespaceName - Name of Namespace for collection to be stored in
     * @param {string} collectionName - Name of Collection
     * @param {string} description - Service description
     * @param {StorageTypes[]} items - Formatted data object
     */
    public write = (
        namespaceName: string,
        collectionName: string,
        description: string,
        items: StorageTypes[]
    ): void => {
        const namespace = namespaceName.toUpperCase();
        const collection = collectionName.toUpperCase();

        if (!this.storage[namespace]) {
            this.storage[namespace] = new Map<
                string,
                MapStorage<StorageTypes>
            >();
        }

        const storedData = this.storage[namespace].get(collection);
        if (!storedData) {
            this.storage[namespace].set(collection, {
                items: new Map<number, TTLValue<StorageTypes>>(),
                updated: new Date(),
                description,
            });
        }

        // For each collected item, check if it exists in the cache
        // If it does not exist, add it to the cache and configure the TTL
        items.forEach((item) => {
            const key = this.createId(JSON.stringify(item));
            const storedCollection = this.storage[namespace].get(collection);
            if (storedCollection && !storedCollection.items.has(key)) {
                this.storage[namespace].get(collection)?.items.set(key, {
                    id: key,
                    value: item,
                    timestamp: new Date(),
                    timer: setTimeout(
                        () => storedCollection.items.delete(key),
                        this.expiration
                    ),
                });
            }
        });
    };
}
