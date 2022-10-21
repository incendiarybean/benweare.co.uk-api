import absolutePath from "benweare.co.uk-client";
import type { Request, Response } from "express";
import express from "express";

const router = express.Router();

/*--------------*/
/*    HANDLER   */
/*--------------*/

const index = `${absolutePath}/index.html`;

router.get("/api*", (req: Request, res: Response) =>
    res
        .status(404)
        .json({ message: `${req.method} is not defined on ${req.path}` })
);

router.get("/", (req: Request, res: Response) => res.sendFile(index));

router.get("*", (req: Request, res: Response) => res.sendFile(index));

export default router;
