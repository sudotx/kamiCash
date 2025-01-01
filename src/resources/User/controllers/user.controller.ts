import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { logger } from "../../../utils/logger";

const userService = new UserService()

export const getUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string;
    try {
        const result = await userService.getProfile(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}

export const getUserBalance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getBalance(userId, "USD")
        logger.info("result", result);
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}

export const getUserTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const toggleTwoFactor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const uploadKYC = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getKYCStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getBankAccounts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const addBankAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const removeBankAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getLoginHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getReferrals = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const getNotificationSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}
export const updateNotificationSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.query.userId as string
    try {
        const result = await userService.getTransactions(userId)
        return res.status(200).json(result)
    } catch (error) {
        logger.error("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}