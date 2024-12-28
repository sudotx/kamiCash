import { NextFunction, Request, Response } from "express";
import { InternalTransferInput, WithdrawInput } from "../schemas/index.schema";
import { TransferService } from "../services/transfer.service";
import { logger } from "../../../utils/logger";

const transferService = new TransferService()

export const internalTransfer = async (
    req: Request<{}, {}, InternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { amount, assetType, from, to, memo } = req.body;
    try {
        const result = await transferService.executeInternalTransfer({ amount, assetType, from, to, memo });
        logger.info(result);
        res.status(200).json(result);
    } catch (error) {
        console.error("Internal transfer failed:", error);
        res.status(500).json({ message: "Internal transfer failed", error: error });
    }
}