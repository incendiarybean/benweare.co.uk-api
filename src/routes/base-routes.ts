import absolutePath from "benweare.co.uk-client";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";

const router = express.Router();

const index = `${absolutePath}/index.html`;

router.get(
    "/api/status",
    cors({ origin: "*" }),
    (_req: Request, res: Response) => res.status(200).json({ message: "ok" })
);

router.get("/api*", (req: Request, res: Response) =>
    res
        .status(404)
        .json({ message: `${req.method} is not defined on ${req.path}` })
);

router.get("/", (_req: Request, res: Response) => res.sendFile(index));

router.get("*", (_req: Request, res: Response) => res.sendFile(index));

export default router;
