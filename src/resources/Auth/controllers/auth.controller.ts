import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../utils/handle-error";
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
        const user = await authService.createUser(email, password, firstName, lastName, phoneNumber);
        res.status(201).json({
            message: "User created successfully",
            user: authService.sanitizeUser(user),
        });
    } catch (err: any) {
        res.status(400).json({
            error: err
        })
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

        res.cookie('refreshToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "User logged in successfully",
            user: authService.sanitizeUser(user),
            accessToken
        });
    } catch (err: any) {
        res.status(400).json({
            error: err.message
        })
        next(new CustomError(err.message, 400));
    }
};

export const assignUserPoints = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { user, points } = req.body;

        const pts = authService.updateUserPoints(user, points)

        res.status(200).json({
            message: `${user} has been sent ${points} points`,
        });

    } catch (error) {
        throw (error)
    }
};
export const logoutHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

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
        res.status(400).json({
            error: error
        })
        next(new CustomError(error.message, error.statusCode || 500));
    }
};


export const forgotPasswordHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const jwtUser: JwtPayload = res.locals.user;
        const user = await authService.forgotPassword(jwtUser.id);
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({
            error: error
        })
        next(new CustomError(error.message, error.statusCode || 500));
    }
};
export const resetPasswordHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const jwtUser: JwtPayload = res.locals.user;
        const user = await authService.resetPassword(jwtUser.id);
        res.status(200).json((user));
    } catch (error: any) {
        res.status(400).json({
            error: error
        })
        next(new CustomError(error.message, error.statusCode || 500));
    }
};

export const verifyEmailHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const jwtUser: JwtPayload = res.locals.user;
        const user = await authService.getUserById(jwtUser.id);
        res.status(200).json(authService.sanitizeUser(user));
    } catch (error: any) {
        res.status(400).json({
            error: error
        })
        next(new CustomError(error.message, error.statusCode || 500));
    }
};
