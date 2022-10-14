import type { NextFunction, Request, Response } from "express";
import express from "express";

const router = express.Router();

/**
 * This is to block requests to pages that don't exist, stop API abuse
 * @param app Application - Express app to send response
 */
router.use((req: Request, res: Response, next: NextFunction) => {
    // TODO: There is definitely a better way of doing this.
    const routes = ["/", "/api/news", "/api/forecast", "/info", "/favicon.ico"];

    if (routes.includes(req.path)) {
        return next();
    }

    if (req.path.includes("/api/")) {
        return res.status(404).json({
            message: `${req.method} is not defined on ${req.path}`,
        });
    }
    return next();
});

export default router;
