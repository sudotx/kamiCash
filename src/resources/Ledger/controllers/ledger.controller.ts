import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";

export const verify = async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        // const cardData = req.body;
        // const result = await card.linkCard(cardData, cardData.userId);
        // return res.status(201).json(result);
    } catch (error) {
        logger.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}
export const reconcile = async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        // const cardData = req.body;
        // const result = await card.linkCard(cardData, cardData.userId);
        // return res.status(201).json(result);
    } catch (error) {
        logger.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}
export const getUserAccountDetails = async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        // const cardData = req.body;
        // const result = await card.linkCard(cardData, cardData.userId);
        // return res.status(201).json(result);
    } catch (error) {
        logger.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}
export const getTransactions = async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        // const cardData = req.body;
        // const result = await card.linkCard(cardData, cardData.userId);
        // return res.status(201).json(result);
    } catch (error) {
        logger.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}
export const getBalance = async (
    req: Request<{}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        // const cardData = req.body;
        // const result = await card.linkCard(cardData, cardData.userId);
        // return res.status(201).json(result);
    } catch (error) {
        logger.error('Error linking card:', error);
        return res.status(500).json({ error: 'Failed to link card' });
    }
}

