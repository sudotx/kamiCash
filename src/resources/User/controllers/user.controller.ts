import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";

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
        console.log("Error Getting", error);
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
        const result = await userService.getBalance(userId)
        console.log(result);
        return res.status(200).json(result)
    } catch (error) {
        console.log("Error Getting", error);
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
        console.log("Error Getting", error);
        return res.status(500).json({ json: "error" })
    }
}