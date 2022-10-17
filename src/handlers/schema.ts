import { OpenAPIV3 } from "openapi-types";

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
            url: "http://localhost:8080/",
            description: "Local build",
        },
    ];
};

const OpenApiSchema: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
        title: "benweare.co.uk's base API",
        version: "0.1.0",
    },
    servers: getServers(),
    tags: [
        {
            name: "News",
            description:
                "This API allows you to get a JSON response of the news I collect.",
        },
        {
            name: "Weather",
            description:
                "This API allows you to get a JSON response of the weather data I collect.",
        },
    ],
    components: {
        securitySchemes: {
            APIKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "X-API-KEY",
            },
        },
        schemas: {
            Error: {
                required: ["message"],
                properties: {
                    message: { type: "string" },
                },
            },
            NewsOption: {
                type: "string",
                enum: ["bbc", "pcgamer", "nasa"],
            },
            Article: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    link: { type: "string" },
                    img: { type: "string" },
                    date: { type: "string" },
                    site: { type: "string" },
                },
            },
            NasaArticle: {
                type: "object",
                properties: {
                    copyright: { type: "string" },
                    date: { type: "string" },
                    explanation: { type: "string" },
                    hdurl: { type: "string" },
                    media_type: { type: "string" },
                    service_version: { type: "string" },
                    title: { type: "string" },
                    url: { type: "string" },
                },
            },
            News: {
                type: "object",
                properties: {
                    items: {
                        oneOf: [
                            {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/Article",
                                },
                            },
                            {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/NasaArticle",
                                },
                            },
                        ],
                    },
                    items_length: { type: "number" },
                    message: { type: "string" },
                },
            },
            WeatherResponse: {
                type: "object",
                properties: {
                    time: { type: "string" },
                    midnight10MWindSpeed: {
                        type: "number",
                    },
                    midnight10MWindDirection: {
                        type: "number",
                    },
                    midnight10MWindGust: { type: "number" },
                    midnightVisibility: { type: "number" },
                    midnightRelativeHumidity: {
                        type: "number",
                    },
                    midnightMslp: { type: "number" },
                    nightSignificantWeatherCode: {
                        type: "number",
                    },
                    nightMinScreenTemperature: {
                        type: "number",
                    },
                    nightUpperBoundMinTemp: {
                        type: "number",
                    },
                    nightLowerBoundMinTemp: {
                        type: "number",
                    },
                    nightMinFeelsLikeTemp: {
                        type: "number",
                    },
                    nightUpperBoundMinFeelsLikeTemp: {
                        type: "number",
                    },
                    nightLowerBoundMinFeelsLikeTemp: {
                        type: "number",
                    },
                    nightProbabilityOfPrecipitation: {
                        type: "number",
                    },
                    nightProbabilityOfSnow: {
                        type: "number",
                    },
                    nightProbabilityOfHeavySnow: {
                        type: "number",
                    },
                    nightProbabilityOfRain: {
                        type: "number",
                    },
                    nightProbabilityOfHeavyRain: {
                        type: "number",
                    },
                    nightProbabilityOfHail: {
                        type: "number",
                    },
                    nightProbabilityOfSferics: {
                        type: "number",
                    },
                },
            },
            WeatherOption: {
                type: "string",
                description: "Date in format: YYYY-MM-DD",
            },
            Weather: {
                type: "object",
                properties: {
                    location: { type: "string" },
                    items: {
                        oneOf: [
                            {
                                $ref: "#/components/schemas/WeatherResponse",
                            },
                            {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/WeatherResponse",
                                },
                            },
                        ],
                    },
                    items_length: { type: "number" },
                    message: { type: "string" },
                },
            },
        },
    },
    security: [{ APIKeyAuth: [] }],
    paths: {
        "/api/news": {
            get: {
                parameters: [
                    {
                        schema: {
                            $ref: "#/components/schemas/NewsOption",
                        },
                        in: "query",
                        name: "outlet",
                    },
                ],
                tags: ["News"],
                summary: "Returns all stored news",
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/News",
                                },
                            },
                        },
                    },
                    default: {
                        description: "Error",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/forecast": {
            get: {
                parameters: [
                    {
                        schema: {
                            $ref: "#/components/schemas/WeatherOption",
                        },
                        in: "query",
                        name: "date",
                        description: "Date in format: YYYY-MM-DD",
                    },
                ],
                tags: ["Weather"],
                summary: "Returns all stored weather",
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Weather",
                                },
                            },
                        },
                    },
                    default: {
                        description: "Error",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

export default OpenApiSchema;
