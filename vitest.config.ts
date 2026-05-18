import { defineConfig } from 'vitest/config';

export default defineConfig(
    {
        test: {
            setupFiles: ['./tests/setupTests.ts'],
            fileParallelism: false,
            retry: 0,
            maxConcurrency: 1,
            maxWorkers: 1,
            coverage: {
                enabled: true,
                reportsDirectory: 'coverage',
                reporter: [
                    'text',
                    'html',
                    'clover',
                    'json'
                ]
            }
        }
    }
);
