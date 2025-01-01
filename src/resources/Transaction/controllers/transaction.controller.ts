import { AssetType, FiatType, PaymentMethodType, PrismaClient, TransactionStatus, TransactionType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../utils/handle-error";
import { JwtPayload } from "../../../utils/interfaces";
import { logger } from "../../../utils/logger";
import { InternalTransferInput, WithdrawInput } from "../schemas/index.schema";
import { TransferService } from "../services/transaction.service";

const transactionService = new TransferService()
let prisma = new PrismaClient();

interface BaseTransactionInput {
    amount: number;
    currency: FiatType;
    paymentMethod: PaymentMethodType;
    metadata?: Record<string, any>;
}

interface DepositInput extends BaseTransactionInput {
    virtualAccountId: string;
}

interface WithdrawalInput extends BaseTransactionInput {
    virtualAccountId: string;
    bankDetails: {
        accountNumber: string;
        bankCode: string;
        accountName: string;
    };
}

interface TransferInput extends BaseTransactionInput {
    fromVirtualAccountId: string;
    toUserId: string | null;
    toAddress?: string;
    memo?: string;
    assetType: AssetType;
}

export const internalTransfer = async (
    req: Request<{}, {}, InternalTransferInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { amount, assetType, from, to, memo } = req.body;
    try {
        const result = await transactionService.executeInternalTransfer({ amount, assetType, from, to, memo });
        logger.info(result);
        res.status(200).json(result);
        // res.status(200).json({
        //     status: 'success',
        //     message: "Transfer initiated successfully",
        //     data: {
        //         transactionId: transaction.id,
        //         reference: transaction.reference,
        //         amount: transaction.amount,
        //         status: transaction.status
        //     }
        // });
    } catch (error) {
        console.error("Internal transfer failed:", error);
        res.status(500).json({ message: "Internal transfer failed", error: error });
    }
}

export const deposit = async (req: Request<{}, {}, WithdrawInput["body"]>, res: Response, next: NextFunction) => {
    const { amount, assetType, fromUserId, toAddress, memo } = req.body;
    try {
        const result = await transactionService.executeDeposit(amount, assetType, fromUserId, toAddress, memo || "none");
        logger.info(result);
        // res.status(200).json({
        //     status: 'success',
        //     message: "Deposit initiated successfully",
        //     data: {
        //         transactionId: transaction.id,
        //         reference: transaction.reference,
        //         amount: transaction.amount,
        //         status: transaction.status
        //     }
        // });
        res.status(200).json(result);
    } catch (error) {
        console.error("Deposit failed:", error);
        res.status(500).json({ message: "Deposit failed", error: error });
        // next(new CustomError(error.message, error.statusCode || 400));
    }
}
export const withdraw = async (req: Request<{}, {}, WithdrawInput["body"]>, res: Response, next: NextFunction) => {
    const { amount, assetType, fromUserId, toAddress, memo } = req.body;
    try {
        const result = transactionService.executeWithdraw(amount, assetType, fromUserId, toAddress, memo || "none");
        logger.info(result);
        res.status(200).json(result);
        // res.status(200).json({
        //     status: 'success',
        //     message: "Withdrawal initiated successfully",
        //     data: {
        //         transactionId: transaction.id,
        //         reference: transaction.reference,
        //         amount: transaction.amount,
        //         status: transaction.status
        //     }
        // });
    } catch (error) {
        console.error("Deposit failed:", error);
        res.status(500).json({ message: "Deposit failed", error: error });
    }
}

export const getTransactionStatus = async (
    req: Request<{ transactionId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { transactionId } = req.params;
        const userId = (res.locals.user as JwtPayload).id;

        const transaction = transactionService.getTransactionById(transactionId, userId);

        res.status(200).json({
            status: 'success',
            data: {
                transactionId: transaction.id,
                status: transaction.status,
                processingSteps: transaction.processingSteps,
                completedAt: transaction.completedAt
            }
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};

export const cancelTransaction = async (
    req: Request<{ transactionId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { transactionId } = req.params;
        const userId = (res.locals.user as JwtPayload).id;

        transactionService.cancelTransaction(transactionId, userId);

        res.status(200).json({
            status: 'success',
            message: "Transaction cancelled successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};

export const getTransactionHistory = async (
    req: Request<{}, {}, {}, {
        page?: number;
        limit?: number;
        type?: TransactionType;
        status?: TransactionStatus;
        startDate?: string;
        endDate?: string;
    }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (res.locals.user as JwtPayload).id;
        const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;

        const { transactions, total } = transactionService.getTransactionHistory({
            userId,
            page: Number(page),
            limit: Number(limit),
            type,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        res.status(200).json({
            status: 'success',
            data: {
                transactions,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 500));
    }
};

export const getTransactionReceipt = async (
    req: Request<{ transactionId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { transactionId } = req.params;
        const userId = (res.locals.user as JwtPayload).id;

        const receipt = transactionService.generateTransactionReceipt(transactionId, userId);

        res.status(200).json({
            status: 'success',
            data: receipt
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};

export const handleTransactionCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const initiateRefund = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const disputeTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const getBulkTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const exportTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const getTransactionAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const scheduleTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const getScheduledTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const cancelScheduledTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const getFees = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const estimateTransactionFee = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};
export const validateAccountBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const callbackData = req.body;

        transactionService.processTransactionCallback(callbackData);

        res.status(200).json({
            status: 'success',
            message: "Callback processed successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};