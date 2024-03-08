import type {
    CollectionList,
    DataStorage,
    MapStorage,
    StorageErrorOptions,
    Store,
    TTLValue,
} from '@common/types';

export class StorageError extends Error {
    public status: number | undefined;
    constructor(message: string, options?: StorageErrorOptions) {
        super(message);
        this.status = options?.status;
    }
}

export class ObjectStorage<
    StorageTypes extends {
        date: string;
        img?: string;
        id?: string;
        name?: string;
    }
> {
    private storage: Store<StorageTypes>;
    private expiration: number;

    constructor(expiration?: number) {
        this.storage = {};
        // Default expiration to 36 hours if not provided
        this.expiration = expiration ?? 129600 * 1000;
    }

    /**
     * Used to generate an ID to use for finding duplicate stored items
     * @param {string} value - String value of the Object to create an ID for
     * @returns {string} - The ID of the object
     */
    private createId = (value: any): string => {
        let id = 0;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            id = (id << 5) - id + char;
            id |= 0;
        }

        // Force Id to be positive
        id = id + 2147483647;

        // Create an simple connected ID
        const stringifiedId = id.toString().split('');
        stringifiedId.splice(4, 0, '-');
        stringifiedId.splice(8, 0, '-');
        return stringifiedId.join('').padEnd(13, '0');
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

        // Return stored collection data, items organised by timestamp
        return {
            ...storedData,
            items: Array.from(storedData.items.values())
                .sort(
                    (x, y) =>
                        new Date(y.timestamp).valueOf() -
                        new Date(x.timestamp).valueOf()
                )
                .map(({ value }) => value),
        };
    };

    /**
     * Returns a list of available Collections within a namespace
     * @param {string} namespaceName - The Name of the Namespace to find the collections
     * @returns {CollectionList[]} A list of available Sub-Collections
     */
    public collections = (namespaceName: string): CollectionList[] => {
        const namespace = namespaceName.toUpperCase();

        if (!this.storage[namespace]) {
            throw new StorageError(
                `No collections available in namespace: ${namespace}`,
                { status: 404 }
            );
        }

        // Get all entries in Map and return them formatted with the Key as the name
        const collections = Array.from(this.storage[namespace].entries());
        return collections.map(([key, { description, updated }]) => ({
            name: key,
            description,
            updated,
        }));
    };

    /**
     * Returns a list of available items within a collection in a desired namespace
     * @param {string} namespaceName - The Name of the Namespace to find the collections
     * @returns {StorageTypes[]} A list of items from all available collections in a namespace
     */
    public items = (
        namespaceName: string,
        sort?: 'ASC' | 'DESC'
    ): StorageTypes[] => {
        const namespace = namespaceName.toUpperCase();

        if (!this.storage[namespace]) {
            throw new StorageError(
                `No items available in namespace: ${namespace}`,
                { status: 404 }
            );
        }

        // Get all values in each Map and return them formatted into a single array
        const collections = Array.from(this.storage[namespace].values());
        let items = collections
            .map(({ items }) => Array.from(items.values()))
            .flat();

        if (sort?.toUpperCase() === 'DESC') {
            items = items.sort(
                (x, y) =>
                    new Date(y.timestamp).valueOf() -
                    new Date(x.timestamp).valueOf()
            );
        }

        if (sort?.toUpperCase() === 'ASC') {
            items = items.sort(
                (x, y) =>
                    new Date(x.timestamp).valueOf() -
                    new Date(y.timestamp).valueOf()
            );
        }

        return items.map(({ value }) => value);
    };

    /**
     * Searches the given namespace for a matching Item ID
     * @param {string} namespaceName - Name of Namespace to find collection
     * @param {string} id - ID of item to find in the namespace
     * @returns {DataStorage} - The returned item matching the provided ID from the namespace
     */
    public itemById = (namespaceName: string, id: string): StorageTypes => {
        const namespace = namespaceName.toUpperCase();

        if (!this.storage[namespace]) {
            throw new StorageError(`Could not find namespace: ${namespace}`, {
                status: 404,
            });
        }

        const item = this.items(namespace).find((value) => value.id === id);
        if (!item) {
            throw new StorageError(`Could not find item with ID: ${id}`, {
                status: 404,
            });
        }

        return item;
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
                items: new Map<string, TTLValue<StorageTypes>>(),
                updated: new Date(),
                description,
            });
        }

        // For each collected item, check if it exists in the cache
        // If it does not exist, add it to the cache and configure the TTL
        // If it exists, restart the timer
        items.forEach(({ date, ...item }) => {
            // Remove image as image can change, but content might not
            let key: string;
            if (item.img) {
                key = this.createId(
                    JSON.stringify({ ...item, img: undefined })
                );
            } else {
                key = this.createId(JSON.stringify(item));
            }

            const storedCollection = this.storage[namespace].get(collection);
            if (storedCollection) {
                // We need to clear existing timeouts to stop the items expiring if they already exist
                // We will simply clear the timeout and reallocate the value in the Map
                const itemExists = storedCollection.items.has(key);
                if (itemExists) {
                    clearTimeout(
                        this.storage[namespace].get(collection)?.items.get(key)
                            ?.timer
                    );
                }

                // Ensure there's some form of date
                if (!date) {
                    date = new Date().toISOString();
                }

                const value = {
                    ...item,
                    name: collection,
                    date,
                    id: key,
                } as StorageTypes;

                // Finally, set the key & value
                this.storage[namespace].get(collection)?.items.set(key, {
                    id: key,
                    value,
                    timestamp: new Date(date),
                    timer: setTimeout(
                        () => storedCollection.items.delete(key),
                        this.expiration
                    ),
                });
            }
        });
    };
}
