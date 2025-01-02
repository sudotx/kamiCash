import { $Enums, RoleEnum } from "@prisma/client"
import { prisma } from "../../../db"
import { CustomError } from "../../../utils/handle-error"
export class AdminService {
    createAdmin = async (data: any) => {
        try {
            return prisma.user.create({
                data: {
                    id: data.id,
                    dateOfBirth: data.dateOfBirth,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    nationality: data.nationality,
                    password: data.password,
                    phoneNumber: data.phoneNumber,
                    role: RoleEnum.ADMIN
                }
            })
        } catch (error) {
            throw (error)
        }
    }

    sanitizeAdminData = (user: { [x: string]: any; id?: string; email?: string; password: any; firstName?: string; lastName?: string; phoneNumber?: string; role?: $Enums.RoleEnum; accountStatus?: $Enums.AccountStatusEnum; emailVerified?: boolean; solanaAddress?: string | null; solanaPrivateKey: any; points?: number; createdAt?: Date; updatedAt?: Date; lastLogin?: Date | null; }) => {
        const { password, solanaPrivateKey, evmPrivateKey, ...sanitizedUser } = user;
        return sanitizedUser;
    };
    authenticateAdmin = async (email: string) => {
        const user = await prisma.user.findUnique({
            where: { id: email, role: RoleEnum.ADMIN }
        })
        if (!user) {
            return new CustomError("Invalid Admin", 400)
        }
        return user
    }
    assignPoints = async (userId: string, points: number, data: any) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            }, data: {
                points: { increment: points }
            }
        })
        if (!user) {
            throw new CustomError("User not found", 404)
        }
        return { id: user.id, points: user.points }
    }

    getAdminById = async (data: any) => {
        const admin = await prisma.user.findUnique({
            where: {
                id: data.id,
                role: RoleEnum.ADMIN
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                accountStatus: true,
                emailVerified: true,
                isKyc: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        if (!admin) {
            throw new CustomError("User not found", 404)
        }
        return admin
    }
    getAllAdmins = async () => {
        const admins = await prisma.user.findMany({
            where: {
                role: RoleEnum.ADMIN
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                accountStatus: true,
                emailVerified: true,
                isKyc: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return admins
    }
    getAllUsers = async () => {
        const admins = await prisma.user.findMany({
            where: {
                role: RoleEnum.USER
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                accountStatus: true,
                emailVerified: true,
                isKyc: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return admins
    }
    getUserDetails = async (userId: string) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                role: true,
                accountStatus: true,
                emailVerified: true,
                isKyc: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        if (!user) {
            throw new CustomError("User not found", 404)
        }
        return user
    }

    blockUser = async (userId: string) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            }, data: {
                accountStatus: "BANNED"
            }
        })
        if (!user) {
            throw new CustomError("User not found", 404)
        }
        return user
    }

    unblockUser = async (userId: string) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            }, data: {
                accountStatus: "ACTIVE"
            }
        })
        if (!user) {
            throw new CustomError("User not found", 404)
        }
        return user
    }

    resetUserPassword = async (userId: string, newPassword: string) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            }, data: {
                password: newPassword
            }
        })
        return user
    }

    getTransactionReport = async (transactionId: string) => {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            }
        })
        return transaction
    }

    exportUserData = async (userId: string) => {
        const user = await prisma.user.findMany({
            where: {
                role: "USER",
                id: userId
            }, select: {
                _count: true,
            }
        })
        return user
    }

    submitKYC = async () => {
        // submit kyc to necessary External API
    }

    manageRoles = async (userId: string, role: RoleEnum) => {
        const user = await prisma.user.update({
            where: {
                id: userId
            }, data: {
                role: role
            }
        })
        return user
    }
}