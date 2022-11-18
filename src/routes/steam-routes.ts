import type { Request, Response } from "express";
import express from "express";
import OpenApiSchema from "@schema";
import { getGameData } from "@workers/steam-worker";

const router = express.Router();

router.get("/api/steam/achieve", async (req: Request, res: Response) => {
    try {
        return res.json({
            response: await getGameData(req),
            description:
                OpenApiSchema.paths["/api/steam/achieve"]?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(parseInt(e.code)).json({ message: e.message });
    }
});

router.get("/api/steam/status", async (req: Request, res: Response) => {
    try {
        await getGameData(req);
        res.status(200).json({ message: "ok" });
    } catch (e) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
