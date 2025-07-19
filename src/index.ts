import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { Request, Response } from "express";
import { functions as inngestFunctions, inngest } from "./inngest";
import { serve } from "inngest/express";
import { logger } from "./utils/logger";
import { connectDB } from "./utils/db";
import userRouter  from "./routes/user.route"



const app = express();

app.use(express.json())
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

app.use("/api/v1", userRouter)


app.get("/", (req: Request, res:Response) => {
    res.send("hello world")
})

app.get("/api/chat", (req: Request, res:Response) => {
    res.send("Hi, how may I help you today?")
});


// app.listen(PORT, () => {
//     console.log("app is running on PORT:" + PORT);
// })

const startServer = async () => {
    try {
        await connectDB();
        const PORT =  process.env.PORT || 3001; 
        app.listen(PORT, () => {
            logger.info(`Server is running on PORT: ${PORT}`);
            logger.info(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
