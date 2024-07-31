import { NextFunction, Request, Response } from "express";
import { ExternalTransferInput, InternalTransferInput } from "../schemas/index.schema";
import { TransferService } from "../services/transfer.service";

const transferService = new TransferService()

export const externalTransfer = async (
    req: Request<{}, {}, ExternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { amount, assetType, fromUserId, toAddress, memo } = req.body;
    try {
        const result = await transferService.executeExternalTransfer({ amount, assetType, fromUserId, toAddress, memo });
        res.status(200).json(result);
    } catch (error) {
        console.error("External transfer failed:", error);
        res.status(500).json({ message: "External transfer failed", error: error });
    }
}

export const internalTransfer = async (
    req: Request<{}, {}, InternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { amount, assetType, from, to, memo } = req.body;
    try {
        const result = await transferService.executeInternalTransfer({ amount, assetType, from, to, memo });
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error("Internal transfer failed:", error);
        res.status(500).json({ message: "Internal transfer failed", error: error });
    }
}
