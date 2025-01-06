import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { prisma } from "../db";
import { JwtPayload } from "../utils/interfaces";
import { AdminService } from "../resources/Admin/services/admin.service";

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

interface AuthResponse {
    success: boolean;
    error?: string;
}

const adminService = new AdminService();

const extractToken = (req: Request): string | null => {
    if (req.headers.authorization?.startsWith("Bearer")) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};

const validateToken = (token: string) => {
    const { decoded } = verifyJwt(token);
    if (!decoded) {
        throw new Error("Session Token Expired");
    }
    return decoded;
};

const createAuthResponse = (error: string): AuthResponse => ({
    success: false,
    error
});

export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json(
            createAuthResponse("Not authorized to access this route")
        );
    }

    try {
        const decoded = validateToken(token);
        res.locals.admin = decoded;
        return next();
    } catch (error) {
        return res.status(401).json(
            createAuthResponse("Session Token Expired to access this route")
        );
    }
};

export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json(
            createAuthResponse("Not authorized to access this route")
        );
    }

    try {
        const decoded = validateToken(token);
        const user = await prisma.user.findUnique({
            where: { id: (decoded as JwtPayload).id }
        });

        if (!user || !ADMIN_ROLES.includes(user.role as AdminRole)) {
            return res.status(403).json(
                createAuthResponse("Admin privileges required")
            );
        }

        res.locals.admin = decoded;
        return next();
    } catch (error) {
        return res.status(401).json(
            createAuthResponse("Authentication failed")
        );
    }
};
