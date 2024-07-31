import { NextFunction, Request, Response } from "express";
import { LoginUserInput, RegisterUserInput } from "../schema/auth.schema";
import { prisma } from "../../../db";
import { hashData, unhashData } from "../../../utils/hash";

export const registerHandler = async (
    req: Request<{}, {}, RegisterUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    try {
        const hashedPassword = await hashData(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                wallets: {
                    create: [
                        {
                            assetType: "SOL",
                            balance: 0,
                        },
                        {
                            assetType: "USDC",
                            balance: 0,
                        }
                    ],
                },
            },
        });
        res.status(201).json({
            message: "User created successfully",
            user,
        });
    } catch (err: any) {
        next(err);
    }

};

export const loginHandler = async (
    req: Request<{}, {}, LoginUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await unhashData(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        res.status(200).json({
            message: "User logged in successfully",
            user,
        });
    } catch (err: any) {
        next(err);
    }
};

export const logoutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.clearCookie("userId");
    res.clearCookie("userEmail");
    res.status(200).json({
        message: "User logged out successfully",
    });
}