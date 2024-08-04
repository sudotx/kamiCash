import { Keypair } from "@solana/web3.js";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../utils/handle-error";
import { hashData } from "../../../utils/hash";
import { JwtPayload } from "../../../utils/interfaces";
import { signJwt } from "../../../utils/jwt";
import { LoginUserInput, RegisterUserInput } from "../schema/auth.schema";

import { AuthService } from "../services/auth.service";

const authService = new AuthService()

export const registerHandler = async (
    req: Request<{}, {}, RegisterUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        const hashedPassword = await hashData(password);
        const newKeypair = Keypair.generate();
        const user = await authService.createUser(email, hashedPassword, firstName, lastName, phoneNumber, newKeypair);
        res.status(201).json({
            message: "User created successfully",
            user: authService.sanitizeUser(user),
        });
    } catch (err: any) {
        next(new CustomError(err.message, 400));
    }
};

export const loginHandler = async (
    req: Request<{}, {}, LoginUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        const user = await authService.authenticateUser(email, password);
        const accessToken = signJwt(user, { expiresIn: process.env.ACCESS_TOKEN_TIME_TTL });
        res.status(200).json({
            message: "User logged in successfully",
            user: authService.sanitizeUser(user),
            accessToken
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
    // a.clearUserCookies(res);
    res.status(200).json({
        message: "User logged out successfully",
    });
};

export const getLoggedInUserHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const jwtUser: JwtPayload = res.locals.user;
        const user = await authService.getUserById(jwtUser.id);
        res.status(200).json(authService.sanitizeUser(user));
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 500));
    }
};
