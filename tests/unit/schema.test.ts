describe("documentation/schema should be provided the correct servers dependant on environment", () => {
    it("should provide dev domains on development environment", () => {
        const { getServers } = require("../../src/schema");
        process.env.HOSTNAME = "http://localhost";

        expect(getServers()).toEqual([
            {
                url: `${process.env.HOSTNAME}:${process.env.PORT}`,
                description: "Local build",
            },
            {
                url: "https://benweare-dev.herokuapp.com/",
                description: "Heroku-Dev",
            },
            {
                url: "http://dev.benweare.co.uk/",
                description: "Heroku-Dev",
            },
        ]);
    });

    it("should provide a default domain in development if not provided by the environment", () => {
        const HOSTNAME = process.env.HOSTNAME;
        const PORT = process.env.PORT;

        // Remove env variables to use fallback value
        delete process.env.HOSTNAME;
        delete process.env.PORT;

        const { getServers } = require("../../src/schema");

        expect(getServers()).toEqual([
            {
                url: "http://localhost/",
                description: "Local build",
            },
            {
                url: "https://benweare-dev.herokuapp.com/",
                description: "Heroku-Dev",
            },
            {
                url: "http://dev.benweare.co.uk/",
                description: "Heroku-Dev",
            },
        ]);

        // Re-add env variables for future tests
        process.env.HOSTNAME = HOSTNAME;
        process.env.PORT = PORT;
    });

    it("should provide production domains on production environment", () => {
        process.env.NODE_ENV = "production";

        const { getServers } = require("../../src/schema");

        expect(getServers()).toEqual([
            {
                url: "https://www.benweare.co.uk/",
                description: "Production Build",
            },
        ]);
    });
});
