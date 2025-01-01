import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../utils/handle-error";
import { JwtPayload } from "../../../utils/interfaces";
import { signJwt } from "../../../utils/jwt";
import { AssignPointsInput, LoginUserInput, RegisterAdminInput } from "../schema/admin.schema";
import { AdminService } from "../services/admin.service";

const adminService = new AdminService();

export const registerAdmin = async (
    req: Request<{}, {}, RegisterAdminInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminData = req.body;

        const newAdmin = await adminService.createAdmin(adminData);

        res.status(201).json({
            status: 'success',
            message: "Admin created successfully",
            data: adminService.sanitizeAdminData(newAdmin),
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};

export const loginAdmin = async (
    req: Request<{}, {}, LoginUserInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body.body;

        const admin = await adminService.authenticateAdmin(email);
        const accessToken = signJwt(admin, { expiresIn: process.env.ADMIN_TOKEN_TTL });

        // Set secure cookie for admin session
        res.cookie('adminToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            status: 'success',
            message: "Admin logged in successfully",
            data: {
                admin: admin,
                accessToken
            }
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 401));
    }
};

export const assignUserPoints = async (
    req: Request<{}, {}, AssignPointsInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, points } = req.body.body;
        const adminId = (res.locals.user as JwtPayload).id;

        const updatedUser = await adminService.assignPoints(userId, points, {
            adminId,
        });

        res.status(200).json({
            status: 'success',
            message: `Points assigned successfully`,
            data: {
                userId: updatedUser.id,
                newPoints: updatedUser.points,
                assignedBy: adminId
            }
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 400));
    }
};

export const logoutAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = (res.locals.user as JwtPayload).id;

        // Invalidate admin session

        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            status: 'success',
            message: "Admin logged out successfully"
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 500));
    }
};

export const getCurrentAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminId = (res.locals.user as JwtPayload).id;
        const admin = await adminService.getAdminById(adminId);

        if (!admin) {
            throw new CustomError('Admin not found', 404);
        }

        res.status(200).json({
            status: 'success',
            data: admin
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 500));
    }
};

// Additional admin-specific handlers
export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await adminService.getAllUsers();

        res.status(200).json({
            status: 'success',
            users: users
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 500));
    }
};

export const getUserDetails = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};

export const blockUser = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        // const user = await adminService
        // const user = await adminService.getUserDetails(userId);

        // res.status(200).json({
        //     status: 'success',
        //     data: user
        // });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const unblockUser = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const updateUserStatus = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const resetUserPassword = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getSystemMetrics = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getAuditLogs = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getAdminLogs = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getTransactionReports = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const exportUserData = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getKYCRequests = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const approveKYC = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const rejectKYC = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getSystemSettings = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const updateSystemSettings = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const manageRoles = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const getBulkOperations = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};
export const performBulkAction = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserDetails(userId);

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error: any) {
        next(new CustomError(error.message, error.statusCode || 404));
    }
};