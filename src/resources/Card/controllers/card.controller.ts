import { NextFunction, Request, Response } from "express";
import { GetCardDetailsInput, LinkCardInput, RemoveCardInput } from "../schemas/index.schema";
import { CardService } from "../services/card.service";


const card = new CardService()

export const linkCard = async (
    req: Request<{}, {}, LinkCardInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const cardData = req.body;
        const result = await card.linkCard(cardData, cardData.userId);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}

export const getCardDetails = async (
    req: Request<{}, {}, GetCardDetailsInput["query"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.query;
        const cardDetails = await card.getCardDetails("userId");
        return res.status(200).json(cardDetails);
    } catch (error) {
        console.error('Error getting card details:', error);
        return res.status(500).json({ error: 'Failed to get card details' });
    }
}

export const removeCard = async (
    req: Request<{}, {}, RemoveCardInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, cardId } = req.body;
        await card.removeCard(userId, cardId);
        return res.status(200).json({ message: 'Card removed successfully' });
    } catch (error) {
        console.error('Error removing card:', error);
        return res.status(500).json({ error: 'Failed to remove card' });
    }
}
