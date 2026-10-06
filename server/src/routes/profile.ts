import { Router, type Request, type Response } from "express";


export const profileRouter = Router();

profileRouter.post('/', async (req: Request, res: Response) => {
    
    try {
        const { userId, ...profileData } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User Id is required' })
        }

        const { goal, experience, daysPerWeek, sessionLength, equipment, injuries, preferredSplit } = profileData;

        if (!goal || !experience || !daysPerWeek || !sessionLength || !equipment || !preferredSplit) {
            res.status(400).json({ error: 'Missing required fields' })
        }
    }
    catch (error) {
        console.error("Error saving profile: ", error);
        res.status(500).json({ error: "Failed to save profile" });
    }
})