import type { Request, Response } from "express";
import express from "express";
import OpenApiSchema from "@schema";
import { storage } from "@workers/news-worker";

const router = express.Router();

router.get("/api/news/:outlet/articles", (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.findByName(req.params.outlet).items || [],
            description:
                OpenApiSchema.paths["/api/news/{outlet}"]?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(502).json({ message: e.message });
    }
});

router.get("/api/news/:outlet", (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.findByName(req.params.outlet),
            description:
                OpenApiSchema.paths["/api/news/{outlet}"]?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(502).json({ message: e.message });
    }
});

router.get("/api/news", (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.read(["items"]),
            description: OpenApiSchema.paths["/api/news"]?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(502).json({ message: e.message });
    }
});

export default router;
