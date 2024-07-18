import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export const requireAdminAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Not authorized to access this route",
        });
    }
    const { decoded } = verifyJwt(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: "Session Token Expired to access this route",
        });
    }

    res.locals.admin = decoded;
    return next();
};
