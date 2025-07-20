import { User } from "../models/User";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}




export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(400).json({
                msg: "Authentication required"
            });
        };

        const decode = jwt.verify(token, process.env.JWT_SECRET || "your secret key") as any;
        
        const user = await User.findById(decode.userId);
        if (!user) {
            return res.status(401).json({msg: "User Not found"});
        }

        req.user = user
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid authentication token" });
    }
}