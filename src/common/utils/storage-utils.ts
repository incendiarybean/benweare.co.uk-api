import type {
    CollectionList,
    DataStorage,
    MapStorage,
    StorageErrorOptions,
    Store,
    TTLValue,
} from '@common/types';

import { v5 as uuidv5 } from 'uuid';

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
    },
> {
    private storage: Store<StorageTypes>;
    private expiration: number;
    private uuid_namespace: string;

    constructor(expiration?: number) {
        this.storage = {};
        // Default expiration to 36 hours if not provided
        this.expiration = expiration ?? 129600 * 1000;
        this.uuid_namespace = '9e3a3f45-caf8-4e89-8a00-865dac767f42';
    }

    /**
     * Used to generate an ID to use for finding duplicate stored items
     * @param {string} value - String value of the Object to create an ID for
     * @returns {string} - The ID of the object
     */
    private createId = (value: string): string =>
        uuidv5(value, this.uuid_namespace);

    /**
     * A function to reduce a response into an array of chunked values
     * @param {any[]} arr - An array to chunk
     * @param {number} chunkSize - The size of the chunk
     * @returns {Array<any[]>} - An array of chunked arrays
     */
    public chunkResponse = (arr: any[], chunkSize: number): Array<any[]> =>
        arr.reduce((result: any, value: any, index: number) => {
            const chunkPosition = Math.floor(index / chunkSize);

            if (!result[chunkPosition]) {
                result[chunkPosition] = [];
            }

            result[chunkPosition].push(value);

            return result;
        }, []);

    /**
     * Searches the given namespace for a matching collection name
     * @param {string} namespaceName - Name of Namespace to find collection
     * @param {string} collectionName - Name of collection to return
     * @param {string} pageLimit - The page size limit
     * @param {string} pageNumber - The number of the page to return
     * @returns {DataStorage} - The returned collection from the namespace
     */
    public search = (
        namespaceName: string,
        collectionName: string,
        pageLimit?: string,
        pageNumber?: string
    ): DataStorage<StorageTypes> => {
        const namespace = namespaceName.toUpperCase();
        const collection = collectionName.toUpperCase();
        const page = parseInt(pageNumber ?? '0');
        const limit = parseInt(pageLimit ?? '0');

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

        let items = Array.from(storedData.items.values()).sort(
            (x, y) =>
                new Date(y.timestamp).valueOf() -
                new Date(x.timestamp).valueOf()
        );

        if (limit) {
            items = this.chunkResponse(items, limit)[page];
            if (!items) {
                throw new StorageError(`No items found on page: ${page}`, {
                    status: 404,
                });
            }
        }

        // Return stored collection data, items organised by timestamp
        return {
            ...storedData,
            items: items.map(({ value }) => value),
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
        let collections = Array.from(this.storage[namespace].entries());
        return collections.map(([key, { description, updated }]) => ({
            name: key,
            description,
            updated,
        }));
    };

    /**
     * Returns an object containing all of the available items within a collection in a desired namespace
     * @param {string} namespaceName - The Name of the Namespace to find the collections
     * @param {'ASC' | 'DESC' | undefined} sort - The direction to sort by
     * @param {string} pageLimit - The page size limit
     * @param {string} pageNumber - The number of the page to return
     * @returns {DataStorage<StorageTypes>} An object containing list of items from all available collections in a namespace
     */
    public list = (
        namespaceName: string,
        sort: 'ASC' | 'DESC' = 'DESC',
        pageLimit?: string,
        pageNumber?: string
    ): DataStorage<StorageTypes> => {
        const namespace = namespaceName.toUpperCase();
        const page = parseInt(pageNumber ?? '0');
        const limit = parseInt(pageLimit ?? '0');

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

        if (limit) {
            items = this.chunkResponse(items, limit)[page];
            if (!items) {
                throw new StorageError(`No items found on page: ${page}`, {
                    status: 404,
                });
            }
        }

        return {
            items: items.map(({ value }) => value),
            description: `All items available in namespace: ${namespace}`,
        };
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

        const item = this.list(namespace).items.find(
            (value) => value.id === id
        );
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
            // Create a new collection
            this.storage[namespace].set(collection, {
                items: new Map<string, TTLValue<StorageTypes>>(),
                updated: new Date(),
                description,
            });
        } else {
            // Update the existing collection's timestamp
            this.storage[namespace].set(collection, {
                ...storedData,
                updated: new Date(),
            });
        }

        // For each collected item, check if it exists in the cache
        // If it does not exist, add it to the cache and configure the TTL
        // If it exists, restart the timer
        items.forEach(({ date, ...item }) => {
            // Remove image as image can change, but content might not
            let key: string = this.createId(
                JSON.stringify({ ...item, img: undefined })
            );

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
