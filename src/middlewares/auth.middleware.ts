import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { prisma } from "../db";
import { JwtPayload } from "../utils/interfaces";
import { AdminService } from "../resources/Admin/services/admin.service";

const adminService = new AdminService();

export const requireAuth = async (
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
export const requireAdmin = async (
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

    const user = await prisma.user.findUnique({
        where: {
            id: (decoded as JwtPayload).id,
        }
    })

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return res.status(403).json({
            success: false,
            error: "Admin privileges required"
        });
    }

    res.locals.admin = decoded;
    return next();
};
