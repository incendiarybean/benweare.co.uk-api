import type { Request, Response } from "express";
import express from "express";
import OpenApiSchema from "@schema";
import { storage } from "@workers/news-worker";

const router = express.Router();

router.get("/api/news/:outlet/articles", (req: Request, res: Response) =>
    res.json({
        response: storage.findByName(req.params.outlet).items || [],
        description: OpenApiSchema.paths["/api/news/{outlet}"]?.get?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

router.get("/api/news/:outlet", (req: Request, res: Response) =>
    res.json({
        response: storage.findByName(req.params.outlet),
        description: OpenApiSchema.paths["/api/news/{outlet}"]?.get?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

router.get("/api/news", (req: Request, res: Response) =>
    res.json({
        response: storage.read(["items"]),
        description: OpenApiSchema.paths["/api/news"]?.get?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

export default router;
