import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./inngest";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your API_KEY"
);


export const processChatMessage = inngest.createFunction(
    { id: "process-chat-message", },
    { event: "therapy/session.message" },
    async ({ event, step }) => {
        try {
            const {
                message,
                history, 
                memory = {
                    userProfile: {
                        emotionalState: [],
                        riskLevel: 0,
                        preferences: {},
                    },
                    sessionContext: {
                        conversationThemes: [],
                        currentTechnique: null,
                    },
                },
                goals = [],
                systemPrompt,
            } = event.data; 

            logger.info("Processing chat message:", {
                message, 
                historyLength: history?.length,
            });

            //analyze the message using gemini
            const analysis = await step.run("analyze-message", async () => {
                try {
                    const prompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
                                    Message: ${message}
                                    Context: ${JSON.stringify({ memory, goals })}
                                    
                                    Required JSON structure:
                                    {
                                        "emotionalState": "string",
                                        "themes": ["string"],
                                        "riskLevel": number,
                                        "recommendedApproach": "string",
                                        "progressIndicators": ["string"]
                                    }`;
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });                
                    const response = await model.generateContent(prompt)
                    


                    // Clean the response text to ensure it's valid JSON
                    const text = response.response.text();
                    logger.info("Received analysis from Gemini:", {text});

                    const cleanText = text?.replace(/```json\n|\n```/g, "").trim();
                    const parsedAnalysis = JSON.parse(cleanText || "{}");

                    logger.info("Successfully parsed analysis:", parsedAnalysis);
                    return parsedAnalysis;
                } catch (error) {
                    logger.error("Error in the message analysis:", {error, message})

                    // Return a default analysis instead of throwing
                    return {
                        emotionalState: "neutral",
                        themes: [],
                        riskLevel: 0,
                        recommendedApproach: "supportive",
                        progressIndicators: [],
                    };
                }
            });

            // Update memory based on analysis
            const updatedMemory = await step.run("updated-memory", async () => {
                if (analysis.emotionalState) {
                    memory.userProfile.emotionalState.push(analysis.emotionalState);
                }
                if (analysis.themes) {
                    memory.sessionContext.conversationThemes.push(...analysis.themes);
                }
                if (analysis.riskLevel) {
                    memory.userProfile.riskLevel = analysis.riskLevel;
                }
                return memory;
            });

                //if high risk is detected, trigger an alert
                if (analysis.riskLevel > 4) {
                    await step.run("trigger-risk-alert", async () => {
                        logger.warn("High risk level detected in chat message", {
                            message,
                            riskLevel: analysis.riskLevel,
                        });
                    });
                }

                //Generate theraputic response
                const response = await step.run("generate-response", async () => {
                    try {
                        const prompt = `${systemPrompt}
                        
                        Based on the following context, generate a therapeutic response:
                        Message: ${message}
                        Analysis: ${JSON.stringify(analysis)}
                        Memory: ${JSON.stringify(memory)}
                        Goals: ${JSON.stringify(goals)}
                        
                        Provide a response that:
                        1. Addresses the immediate emotional needs
                        2. Uses appropriate therapeutic techniques
                        3. Shows empathy and understanding
                        4. Maintains professional boundaries
                        5. Considers safety and well-being`;

                        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });                
                        const response = await model.generateContent(prompt)

                        const results = response.response.text();
                        const responseText = results?.trim();

                        logger.info("Generated response:", { responseText });

                        return responseText;
                    } catch (error) {
                        logger.error("Error Error generating response:", { error, message });
                        // Return a default response instead of throwing
                        return "I'm here to support you. Could you tell me more about what's on your mind?";
                    }
                });

                // Return the response in the expected format
                return {
                    response,
                    analysis,
                    updatedMemory
                };
        } catch (error) {
            logger.error("Error in chat message processing:", {
                error,
                message: event.data.message,
            });

             // Return a default response instead of throwing
             return {
                response: "I'm here to support you. Could you tell me more about what's on your mind?",
                analysis: {
                emotionalState: "neutral",
                themes: [],
                riskLevel: 0,
                recommendedApproach: "supportive",
                progressIndicators: [],
                },
                updatedMemory: event.data.memory,
             }
        }
    }
);

// Function to analyze therapy session content
export const analyzeTherapySession = inngest.createFunction(
    { id: "analyze-therapy-session", },
    { event: "therapy/session.created" },
    async ({ event, step }) => {
        try {
            const sessionContent = await step.run("get-session-content", async () => {
                return event.data.notes || event.data.transcript;
            });

            //analyze the session using gemini
            const analysis = await step.run("analyze-with-gemini", async () => {
                const prompt = `Analyze this therapy session and provide insights:
                                Session Content: ${sessionContent}
                                
                                Please provide:
                                1. Key themes and topics discussed
                                2. Emotional state analysis
                                3. Potential areas of concern
                                4. Recommendations for follow-up
                                5. Progress indicators
                                
                                Format the response as a JSON object.`;

                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });                
                const response = await model.generateContent(prompt)

                const results = response.response.text();
                const responseText = results?.trim();

                return JSON.parse(responseText || '{}');
            });

            //store analysis
            await step.run("store-analysis", async () => {
                logger.info("Session analysis stored successfully");
                return analysis;
            });

            //if concerning indicators, trigger an alert
            if (analysis.areaOfConcern?.length > 0) {
                await step.run("trigger-concern-alert", async () => {
                    logger.warn("Concerning indicators detected in session analysis", {
                        sessionId: event.data.sessionId,
                        concerns: analysis.areaOfConcern,
                    });
                    //alert logic
                });
            }
            return {
                message: "Session analysis completed",
                analysis
            };
        } catch (error) {
            logger.error("Error in therapy session analysis:", error);
            throw error;
        }
    }
);

// Function to generate personalized activity recommendations
export const functions = [processChatMessage, analyzeTherapySession]