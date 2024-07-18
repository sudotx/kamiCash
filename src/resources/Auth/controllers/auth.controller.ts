import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../utils/handle-error";
import { signJwt } from "../../../utils/jwt";
import { LoginAdminSessionInput, LoginUserInput, VerifyUserInput } from "../schema/auth.schema";
import { validateAdminPassword } from "../services/auth.service";
import { JwtPayload } from "../../../utils/interfaces";
import prisma from "../../../db";
// import { sendOtp, verifyOtp } from "../../../utils/otp";
import { unhashData } from "../../../utils/hash";

/**
 * Handles the login process for an admin user.
 *
 * @param req - The Express request object containing the admin login credentials in the request body.
 * @param res - The Express response object to send the login response.
 * @param next - The Express next middleware function to handle any errors.
 * @returns The admin user data with an access token if the login is successful.
 * @throws {CustomError} If the admin ID or password is invalid.
 */
export async function loginAdminHandler(
    req: Request<{}, {}, LoginAdminSessionInput["body"]>,
    res: Response,
    next: NextFunction
) {
    try {
        let admin = await validateAdminPassword(req.body);

        if (!admin) {
            throw {
                message: "Invalid admin Id or password. Please try again",
            };
        }

        // Create an access token
        const accessToken = signJwt(
            admin,
            { expiresIn: process.env.ACCESS_TOKEN_TIME_TTL } //15 minutes
        );

        // Return access & refresh token
        console.log("Access token:", accessToken);
        return res.send({
            ...admin,
            accessToken,
        });
    } catch (err: any) {
        console.log("[LOGIN_ADMIN_ERROR]:", err);
        next(new CustomError(err.message, err.statusCode));
    }
}

export const getLoggedInAdminHander = async (
    _: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const jwtAdmin: JwtPayload = await res.locals.admin;

        const admin = await prisma.admin.findUnique({
            where: {
                id: jwtAdmin.id,
            },
        });

        if (!admin) {
            throw {
                message: "Admin not found",
            };
        }

        const { password: pass, ...remainingAdmin } = admin;
        // console.log("Remaining user:", remainingUser);
        return res.status(200).json({
            ...remainingAdmin,
        });
    } catch (error: any) {
        console.log("[GET_LOGGEDIN_USER_ERROR]:", error);
        next(new CustomError(error.message, error.statusCode));
    }
};

export const verifyAccountHander = async (
    req: Request<{}, {}, VerifyUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            throw {
                message: "Please provide the email and OTP code",
            };
        }

        // const verifyStatus = await verifyOtp(email, code);

        // if (!verifyStatus.status) {
        //     throw {
        //         message: verifyStatus.error,
        //         statusCode: 400,
        //     };
        // }

        // const user = await prisma.user.findUnique({
        //     where: {
        //         email,
        //     },
        //     include: {
        //         client: true,
        //         propertyOwner: true,
        //     },
        // });

        // if (!user)
        //     throw {
        //         message: "An errror occurred",
        //     };

        // await prisma.user.update({
        //     where: {
        //         id: user.id,
        //     },
        //     data: {
        //         emailVerified: true,
        //     },
        // });

        // if (!user) {
        //     throw {
        //         message: "An error occurred. Please try again later",
        //     };
        // }
        // const accessToken = signJwt(
        //     {
        //         id: user.id,
        //         email,
        //         firstName: user.firstName,
        //         lastName: user.lastName,
        //         phoneNumber: user.phoneNumber,
        //         accountStatus: user.accountStatus,
        //     },
        //     {
        //         expiresIn: "30d",
        //     }
        // );

        // const { password: p, ...remainingUser } = user;

        // return res.status(200).json({
        //     success: true,
        //     message: "Email Verified successfully",
        //     user: { ...remainingUser, accessToken },
        // });
    } catch (err: any) {
        console.log("[VERIFY_OTP_ERROR]:", err);
        next(new CustomError(err.message, err.statusCode));
    }
};

export const loginHandler = async (
    req: Request<{}, {}, LoginUserInput["body"]>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        // const user = await prisma.user.findFirst({
        //     where: {
        //         email: {
        //             contains: email.toLowerCase(),
        //             mode: "insensitive",
        //         },
        //     },
        //     include: {
        //         client: true,
        //         propertyOwner: true,
        //     },
        // });

        // if (!user) {
        //     throw {
        //         message: "User not found",
        //     };
        // }

        // const isCorrectPassword = await unhashData(password, user.password);

        // if (!isCorrectPassword) {
        //     throw {
        //         message: "Invalid Credentials",
        //     };
        // }

        // if (!user.emailVerified) {
        //     const hasSentOtp = await sendOtp(user.email, user.firstName);

        //     if (!hasSentOtp.status) {
        //         throw {
        //             message: "OTP not sent. Please try again.",
        //         };
        //     }

        //     return res.status(400).json({ user, status: false });
        // }
        // if (user.accountStatus === "SUSPENDED") {
        //     throw {
        //         message: "Account Suspended. Please contact support.",
        //     };
        // }
        // if (user.accountStatus === "DELETED") {
        //     throw {
        //         message:
        //             "Your account has been deleted. Please contact support for more information to recover your account. ",
        //     };
        // }
        // if (user.accountStatus === "BANNED") {
        //     throw {
        //         message:
        //             "Your account has been banned. Please contact support for more information to recover your account. ",
        //     };
        // }
        // const accessToken = signJwt(
        //     {
        //         id: user.id,
        //         email,
        //         firstName: user.firstName,
        //         lastName: user.lastName,
        //         phoneNumber: user.phoneNumber,
        //         accountStatus: user.accountStatus,
        //     },
        //     {
        //         expiresIn: "30d",
        //     }
        // );

        // const { password: p, ...remainingUser } = user;

        // return res.status(200).json({ ...remainingUser, accessToken });
    } catch (error: any) {
        console.log("[LOGIN_ERROR]:", error);
        next(new CustomError(error.message, error.statusCode));
    }
};