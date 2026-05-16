import { defineConfig } from 'vitest/config';

export default defineConfig(
    {
        test: {
            setupFiles: ['./tests/setupTests.ts'],
            fileParallelism: false,
            alias: {
                '@server': './src/server/index.ts',
                '@schema': './src/schema/index.ts',
                '@handlers/*': './src/handlers/*',
                '@routes/*': './src/routes/*',
                '@workers/*': './src/workers/*',
                '@common/*': './src/common/*',
                '@utils/*': './src/common/utils/*'
            },
            retry: 0,
            maxConcurrency: 1,
            maxWorkers: 1
        }
    }
);
