import { NextFunction, Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { VirtualAccountService } from "../services/va.service";
const vaService = new VirtualAccountService();

export const createVirtualAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string;
    const { currencyCode } = req.body
    try {
        const result = await vaService.createVirtualAccount(userId, currencyCode)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getAllVirtualAccounts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string;
    try {
        const result = await vaService.getAllWallets(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}