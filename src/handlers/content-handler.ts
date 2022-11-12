import path from "path";
import absolutePath from "benweare.co.uk-client";
import cors from "cors";
import express from "express";
import * as swaggerUi from "swagger-ui-slim";
import OpenApiSchema from "@schema";

const router = express.Router();

router.use(
    cors({
        origin:
            process.env.NODE_ENV !== "development"
                ? "https://benweare.co.uk"
                : "*",
        methods: "GET,HEAD",
    })
);
router.use(express.json());
router.use(express.static(absolutePath));
router.use(
    "/favicon.ico",
    express.static(path.join(__dirname, `${absolutePath}/favicon.ico`))
);
router.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.build(OpenApiSchema, {
        customSiteTitle: "Ben's API Docs",
        faviconUrl: `/favicon.ico`,
    })
);

export default router;
