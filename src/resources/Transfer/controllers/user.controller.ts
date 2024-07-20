import { NextFunction, Request, Response } from "express";
import { ExternalTransferInput, InternalTransferInput } from "../schemas/index.schema";
import { TransferService } from "../services/transfer.service";

const transferService = new TransferService()

export const externalTransfer = async (
    req: Request<{}, {}, ExternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    transferService.executeExternalTransfer()
}

export const internalTransfer = async (
    req: Request<{}, {}, InternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    transferService.executeInternalTransfer()
}
