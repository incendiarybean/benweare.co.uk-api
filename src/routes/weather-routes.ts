import type { Request, Response } from "express";
import express from "express";
import OpenApiSchema from "@schema";
import { storage } from "@workers/weather-worker";

const router = express.Router();

/*--------------*/
/*    HANDLER   */
/*--------------*/

router.get("/api/forecasts/:outlet/timeseries", (req: Request, res: Response) =>
    res.json({
        response: storage.findByName(req.params.outlet).items || [],
        description:
            OpenApiSchema.paths["/api/forecasts/{outlet}/timeseries"]?.get
                ?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

router.get("/api/forecasts/:outlet", (req: Request, res: Response) =>
    res.json({
        response: storage.findByName(req.params.outlet),
        description:
            OpenApiSchema.paths["/api/forecasts/{outlet}"]?.get?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

router.get("/api/forecasts", (req: Request, res: Response) =>
    res.json({
        response: storage.read(["items"]),
        description: OpenApiSchema.paths["/api/forecasts"]?.get?.summary,
        timestamp: new Date(),
        link: {
            action: req.method,
            href: req.path,
        },
    })
);

export default router;
