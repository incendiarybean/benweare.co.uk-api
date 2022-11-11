const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

// SET TESTING PORT //
process.env.PORT = 4444;

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {},
    globals: {
        "ts-jest": {
            isolatedModules: true,
        },
    },
    fakeTimers: { enableGlobally: true },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: "<rootDir>/",
    }),
};
