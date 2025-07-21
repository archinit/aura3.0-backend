import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";
import { Request, Response } from "express";

export const createMood = async (req: Request, res: Response) =>{
    try {
        const { score, note } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ msg: "User not Authenticated"});
        }

        const mood = new Mood({
            userId,
            score,
            note,
            timestamp: new Date(),
        });

        await mood.save();
        logger.info(`Mood logged for user ${userId}`)

        res.status(201).json({ success: true, data: mood, });

    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error });
    };
}