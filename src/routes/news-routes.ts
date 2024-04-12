import type { Request, Response } from 'express';

import OpenApiSchema from '@schema';
import express from 'express';
import { storage } from '..';

const router = express.Router();

router.get('/api/news/:outlet/articles', (req: Request, res: Response) => {
    try {
        return res.json({
            items: storage.search('NEWS', req.params.outlet).items,
            description:
                OpenApiSchema.paths['/api/news/{outlet}/articles']?.get
                    ?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(e.status ?? 502).json({ message: e.message });
    }
});

router.get('/api/news/articles', (req: Request, res: Response) => {
    try {
        const sort: 'ASC' | 'DESC' | undefined = req.query.sort as
            | 'ASC'
            | 'DESC'
            | undefined;

        return res.json({
            response: storage.list('NEWS', sort),
            description:
                OpenApiSchema.paths['/api/news/articles']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(e.status ?? 502).json({ message: e.message });
    }
});

router.get('/api/news/articles/:id', (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.itemById('NEWS', req.params.id),
            description:
                OpenApiSchema.paths['/api/news/articles']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(e.status ?? 502).json({ message: e.message });
    }
});

router.get('/api/news/:outlet', (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.search('NEWS', req.params.outlet),
            description:
                OpenApiSchema.paths['/api/news/{outlet}']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(e.status ?? 502).json({ message: e.message });
    }
});

router.get('/api/news', (req: Request, res: Response) => {
    try {
        return res.json({
            response: storage.collections('NEWS'),
            description: OpenApiSchema.paths['/api/news']?.get?.summary,
            timestamp: new Date(),
            link: {
                action: req.method,
                href: req.path,
            },
        });
    } catch (e: any) {
        return res.status(e.status ?? 502).json({ message: e.message });
    }
});

export default router;
