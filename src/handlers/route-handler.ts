import express from "express";
import {
    baseRoutes,
    discordRoutes,
    newsRoutes,
    weatherRoutes,
} from "@routes/index";

const router = express.Router();

discordRoutes();

router.use(newsRoutes);
router.use(weatherRoutes);
router.use(baseRoutes);

export default router;
