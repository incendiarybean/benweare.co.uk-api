import absolutePath from "benweare.com-client";
import type { Request, Response } from "express";
import express from "express";

const router = express.Router();

/*--------------*/
/*    HANDLER   */
/*--------------*/

const index = `${absolutePath}/index.html`;

router
    .route("/")
    .get((req: Request, res: Response) => {
        return res.sendFile(index);
    })
    .post((req: Request, res: Response) => {
        return res.json({
            code: 400,
            message: `${req.method} is not defined on ${req.path}`,
        });
    });

router
    .route("*")
    .get((req: Request, res: Response) => {
        return res.sendFile(index);
    })
    .post((req: Request, res: Response) => {
        return res.json({
            code: 400,
            message: `${req.method} is not defined on ${req.path}`,
        });
    });

export default router;
