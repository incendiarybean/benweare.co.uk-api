import type {
    Request, Response
} from 'express';
import OpenApiSchema from '../schema/index.ts';
import express from 'express';
import { storage } from '../index.ts';
import { errorHandler } from '../common/utils/common-utils.ts';

const router = express.Router();

router.get(
    '/api/news/:outlet/articles', (
        req: Request, res: Response
    ) => {
        try {
            const limit = req.query['limit'] as string | undefined;
            const page = req.query['page'] as string | undefined;
            const outlet = req.params['outlet'] as string;

            res.json(
                {
                    items: storage.search(
                        'NEWS', outlet, limit, page
                    ).items,
                    description:
                OpenApiSchema.paths['/api/news/{outlet}/articles']?.get?.
                    summary,
                    timestamp: new Date,
                    link: {
                        page,
                        limit,
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

router.get(
    '/api/news/articles', (
        req: Request, res: Response
    ) => {
        try {
            const sort = req.query['sort'] as 'ASC' | 'DESC' | undefined;
            const limit = req.query['limit'] as string | undefined;
            const page = req.query['page'] as string | undefined;

            res.json(
                {
                    response: storage.list(
                        'NEWS', sort, limit, page
                    ),
                    description:
                OpenApiSchema.paths['/api/news/articles']?.get?.summary,
                    timestamp: new Date,
                    link: {
                        page,
                        limit,
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

router.get(
    '/api/news/articles/:id', (
        req: Request, res: Response
    ) => {
        try {
            const id = req.params['id'] as string;

            res.json(
                {
                    response: storage.itemById(
                        'NEWS', id
                    ),
                    description:
                OpenApiSchema.paths['/api/news/articles']?.get?.summary,
                    timestamp: new Date,
                    link: {
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

router.get(
    '/api/news/:outlet', (
        req: Request, res: Response
    ) => {
        try {
            const outlet = req.params['outlet'] as string;

            res.json(
                {
                    response: storage.search(
                        'NEWS', outlet
                    ),
                    description:
                OpenApiSchema.paths['/api/news/{outlet}']?.get?.summary,
                    timestamp: new Date,
                    link: {
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

router.get(
    '/api/news', (
        req: Request, res: Response
    ) => {
        try {
            res.json(
                {
                    response: storage.collections(
                        'NEWS'
                    ),
                    description: OpenApiSchema.paths['/api/news']?.get?.summary,
                    timestamp: new Date,
                    link: {
                        action: req.method,
                        href: req.path
                    }
                }
            );

            return;
        }
        catch (error) {
            return errorHandler(
                res, error
            );
        }
    }
);

export default router;
