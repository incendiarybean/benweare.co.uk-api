import { OpenAPIV3 } from "openapi-types";
import * as SchemaJSON from "./schema.json";

const getServers = () => {
    if (process.env.NODE_ENV === "production") {
        return [
            {
                url: "https://www.benweare.co.uk/",
                description: "Production Build",
            },
        ];
    }
    return [
        {
            url: "https://benweare-dev.herokuapp.com/",
            description: "Heroku-Dev",
        },
        {
            url: "http://dev.benweare.co.uk/",
            description: "Heroku-Dev",
        },
        {
            url: process.env.hostname
                ? `${process.env.HOSTNAME}:${process.env.PORT}`
                : "http://localhost/",
            description: "Local build",
        },
    ];
};

const OpenApiSchema = SchemaJSON as OpenAPIV3.Document;
OpenApiSchema.servers = getServers();

export default OpenApiSchema;
