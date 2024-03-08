import { ObjectStorage } from '../../src/common/utils/storage-utils';

interface TestType {
    message: string;
    date: string;
}

describe('The Storage-Utils should allow storage of items and access to stored items', () => {
    it('should throw a 404 if no items are found in namespace', () => {
        const storage = new ObjectStorage<TestType>();

        try {
            storage.collections('TEST');
        } catch (e) {
            expect(e.message).toEqual(
                'No collections available in namespace: TEST'
            );
            expect(e.status).toEqual(404);
        }
    });

    it('should insert data successfully into a namespace', async () => {
        const storage = new ObjectStorage<TestType>();
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        // Check that storage has been written to and is in correct namespace
        const result = storage.collections('TEST_NAMESPACE_0');
        expect(result.length).toEqual(1);
        expect(result[0].description).toEqual(
            "TEST_COLLECTION_0's latest test."
        );
        expect(result[0].name).toEqual('TEST_COLLECTION_0');
        expect(result[0].updated).toBeDefined();
    });

    it('should not overwrite current namespace/collection data with duplicate items', () => {
        const storage = new ObjectStorage<TestType>();
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_1',
            "TEST_COLLECTION_1's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                {
                    message: 'overwitten test',
                    date: new Date().toISOString(),
                },
            ]
        );

        expect(storage.collections('TEST_NAMESPACE_0').length).toEqual(2);

        // Expect TEST_NAMESPACE_0 to have an extra value
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test',
                id: '4223-304-6000',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'overwitten test',
                id: '1868-390-5790',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
        ]);

        // Expect TEST_NAMESPACE_0, TEST_COLLECTION_1 to be untouched
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_1').items
        ).toEqual([
            {
                message: 'test',
                id: '4223-304-6000',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_1',
            },
        ]);
    });

    it('should be able to handle specific item expiration', () => {
        const storage = new ObjectStorage<TestType>();
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items.length
        ).toEqual(1);

        jest.runOnlyPendingTimers();

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_1',
            "TEST_COLLECTION_1's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_1').items.length
        ).toEqual(1);
    });

    it('should report a 404 if all items have expired in collection', async () => {
        const storage = new ObjectStorage<TestType>();
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        jest.runOnlyPendingTimers();

        try {
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0');
        } catch (e) {
            expect(e.message).toEqual(
                'Could not find items in collection: TEST_COLLECTION_0 in TEST_NAMESPACE_0'
            );
            expect(e.status).toEqual(404);
        }
    });

    it('should be able to search a namespace to return a collection', async () => {
        const storage = new ObjectStorage<TestType>();

        // Collection we want to find
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-3', date: new Date().toISOString() },
                { message: 'test-2', date: new Date().toISOString() },
                { message: 'test-1', date: new Date().toISOString() },
                { message: 'test-0', date: new Date().toISOString() },
            ]
        );

        // Collection within same namespace of the collection we want to find
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_1',
            "TEST_COLLECTION_1's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        // Collection in different namespace should be ignored
        storage.write(
            'TEST_NAMESPACE_1',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-0', date: new Date().toISOString() },
                { message: 'test-1', date: new Date().toISOString() },
            ]
        );

        // Check first namespace has 2 collections
        const list0Result = storage.collections('TEST_NAMESPACE_0');
        expect(list0Result.length).toEqual(2);

        // Check that collection returned is expected and has 4 items
        const result0 = storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0');
        expect(result0.items.length).toEqual(4);
        expect(result0.description).toEqual("TEST_COLLECTION_0's latest test.");
        expect(result0.updated).toBeDefined();

        // Check second namespace only has 1 collection
        const list1Result = storage.collections('TEST_NAMESPACE_1');
        expect(list1Result.length).toEqual(1);

        // Check that collection returned is expected and has 2 items
        const result1 = storage.search('TEST_NAMESPACE_1', 'TEST_COLLECTION_0');
        expect(result1.items.length).toEqual(2);
        expect(result1.items).toEqual([
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
        ]);
        expect(result1.description).toEqual("TEST_COLLECTION_0's latest test.");
        expect(result1.updated).toBeDefined();
    });

    it('should throw an error when searching if no namespace or collection is found', () => {
        const storage = new ObjectStorage<TestType>();

        // Check that error is thrown if it cannot find a namespace to search
        try {
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0');
        } catch (e) {
            expect(e.message).toEqual(
                'Could not find namespace: TEST_NAMESPACE_0'
            );
            expect(e.status).toEqual(404);
        }

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_1',
            "TEST_COLLECTION_1's latest test.",
            [{ message: 'test', date: new Date().toISOString() }]
        );

        // Check that error is thrown if it cannot find a collection to search within a namespace
        try {
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0');
        } catch (e) {
            expect(e.message).toEqual(
                'Could not find collection: TEST_COLLECTION_0 in TEST_NAMESPACE_0'
            );
            expect(e.status).toEqual(404);
        }
    });

    it('should return items in order of stored time', () => {
        const storage = new ObjectStorage<TestType>();

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test-1', date: new Date().toISOString() }]
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test-0', date: new Date().toISOString() }]
        );

        // test-1 was stored first, so should be first in the array
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
        ]);

        jest.runOnlyPendingTimers();

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test-0', date: new Date().toISOString() }]
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test-1', date: new Date().toISOString() }]
        );

        // test-0 was stored first, so should be first in the array
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
        ]);
    });

    it('should order items correctly, new values should be first in the list', async () => {
        const storage = new ObjectStorage<TestType>();

        // Create dates, 1 minute apart from eachother
        const startDate = new Date();
        const dateArray = Array.from(Array(8).keys()).map((i) =>
            new Date(
                startDate.setMinutes(startDate.getMinutes() + 1)
            ).toISOString()
        );

        // This shows that whatever order the items arrive in, they should return in order of timestamp
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-3', date: dateArray[3] },
                { message: 'test-2', date: dateArray[2] },
                { message: 'test-4', date: dateArray[4] },
                { message: 'test-0', date: dateArray[0] },
                { message: 'test-1', date: dateArray[1] },
            ]
        );

        // We should expect the newest item to be first
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: dateArray[4],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: dateArray[3],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: dateArray[2],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: dateArray[1],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: dateArray[0],
                name: 'TEST_COLLECTION_0',
            },
        ]);

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-1', date: dateArray[1] }, // <-- last item on the page
                { message: 'test-2', date: dateArray[2] },
                { message: 'test-3', date: dateArray[3] },
                { message: 'test-4', date: dateArray[4] },
                { message: 'test-5', date: dateArray[5] }, // <-- newest item on the page
            ]
        );

        // We should expect the newest item to be first
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-5',
                id: '1931-512-1900',
                date: dateArray[5],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: dateArray[4],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: dateArray[3],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: dateArray[2],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: dateArray[1],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: dateArray[0],
                name: 'TEST_COLLECTION_0',
            },
        ]);

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-3', date: dateArray[3] }, // <-- last item on the page
                { message: 'test-4', date: dateArray[4] },
                { message: 'test-5', date: dateArray[5] },
                { message: 'test-6', date: dateArray[6] },
                { message: 'test-7', date: dateArray[7] }, // <-- newest item on the page
            ]
        );

        // We should expect the newest item to be first
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-7',
                id: '1931-514-1120',
                date: dateArray[7],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-6',
                id: '1931-513-1510',
                date: dateArray[6],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-5',
                id: '1931-512-1900',
                date: dateArray[5],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: dateArray[4],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: dateArray[3],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: dateArray[2],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: dateArray[1],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: dateArray[0],
                name: 'TEST_COLLECTION_0',
            },
        ]);
    });

    it("should order items correctly, and add a date if it's missing", async () => {
        const storage = new ObjectStorage<TestType>();

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                //@ts-ignore
                { message: 'test-0' },
                { message: 'test-1', date: new Date().toISOString() },
                { message: 'test-2', date: new Date().toISOString() },
                { message: 'test-3', date: new Date().toISOString() },
                { message: 'test-4', date: new Date().toISOString() },
            ]
        );

        // We should expect the newest item to be first
        expect(
            storage.search('TEST_NAMESPACE_0', 'TEST_COLLECTION_0').items
        ).toEqual([
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: new Date().toISOString(),
                name: 'TEST_COLLECTION_0',
            },
        ]);
    });

    it('should return all items in an ordered list', () => {
        const storage = new ObjectStorage<TestType>();

        // Create dates, 1 minute apart from eachother
        const startDate = new Date();
        const dateArray = Array.from(Array(5).keys()).map((i) =>
            new Date(
                startDate.setMinutes(startDate.getMinutes() + 1)
            ).toISOString()
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-0', date: dateArray[0] },
                { message: 'test-1', date: dateArray[1] },
                { message: 'test-2', date: dateArray[2] },
            ]
        );

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_1',
            "TEST_COLLECTION_1's latest test.",
            [
                { message: 'test-3', date: dateArray[3] },
                { message: 'test-4', date: dateArray[4] },
            ]
        );

        // We should expect the newest item to be first
        expect(storage.items('TEST_NAMESPACE_0')).toEqual([
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: dateArray[4],
                name: 'TEST_COLLECTION_1',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: dateArray[3],
                name: 'TEST_COLLECTION_1',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: dateArray[2],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: dateArray[1],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: dateArray[0],
                name: 'TEST_COLLECTION_0',
            },
        ]);

        // We should expect the oldest item to be first
        expect(storage.items('TEST_NAMESPACE_0', 'ASC')).toEqual([
            {
                message: 'test-0',
                id: '1931-507-3850',
                date: dateArray[0],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-1',
                id: '1931-508-3460',
                date: dateArray[1],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-2',
                id: '1931-509-3070',
                date: dateArray[2],
                name: 'TEST_COLLECTION_0',
            },
            {
                message: 'test-3',
                id: '1931-510-2680',
                date: dateArray[3],
                name: 'TEST_COLLECTION_1',
            },
            {
                message: 'test-4',
                id: '1931-511-2290',
                date: dateArray[4],
                name: 'TEST_COLLECTION_1',
            },
        ]);
    });

    it('should report a 404 when no namespace is found when searching items', () => {
        const storage = new ObjectStorage<TestType>();

        try {
            storage.items('TEST_NAMESPACE_0');
        } catch (e) {
            expect(e.message).toEqual(
                'No items available in namespace: TEST_NAMESPACE_0'
            );
            expect(e.status).toEqual(404);
        }
    });

    it('should be able to find a specific item in a namespace by its ID', () => {
        const storage = new ObjectStorage<TestType>();

        const date = new Date();
        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [
                { message: 'test-0', date: date.toISOString() },
                { message: 'test-1', date: new Date().toISOString() },
                { message: 'test-2', date: new Date().toISOString() },
            ]
        );

        expect(storage.itemById('TEST_NAMESPACE_0', '1931-507-3850')).toEqual({
            date: date.toISOString(),
            id: '1931-507-3850',
            message: 'test-0',
            name: 'TEST_COLLECTION_0',
        });
    });

    it('should report a 404 when no namespace is found when searching an item by its ID', () => {
        const storage = new ObjectStorage<TestType>();

        try {
            storage.itemById('TEST_NAMESPACE_0', '1931-507-3850');
        } catch (e) {
            expect(e.message).toEqual(
                'Could not find namespace: TEST_NAMESPACE_0'
            );
            expect(e.status).toEqual(404);
        }
    });

    it('should report a 404 when no item is found when searching an item by its ID', () => {
        const storage = new ObjectStorage<TestType>();

        storage.write(
            'TEST_NAMESPACE_0',
            'TEST_COLLECTION_0',
            "TEST_COLLECTION_0's latest test.",
            [{ message: 'test-1', date: new Date().toISOString() }]
        );

        try {
            storage.itemById('TEST_NAMESPACE_0', '1931-507-3850');
        } catch (e) {
            expect(e.message).toEqual(
                'Could not find item with ID: 1931-507-3850'
            );
            expect(e.status).toEqual(404);
        }
    });
});
