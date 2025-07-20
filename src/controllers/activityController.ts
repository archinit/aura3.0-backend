import { Activity } from "../models/Activity";
import { logger } from "../utils/logger";
import { Request, Response } from "express";

export const logActivity = async (req: Request, res: Response) => {
    try {
        const { type, name, description, duration } = req.body;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({
                msg: "User not Authenticated"
            });
        }

        const activity = new Activity({
            type,
            name,
            description,
            duration,
            timestamp: new Date(),
        });

        await activity.save();
        logger.info(`Activity logged for user ${userId}`);

        res.status(201).json({
            success: true,
            data: activity,
        });

    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error });
    };
} 