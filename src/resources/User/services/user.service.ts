import { FiatType } from "@prisma/client";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";

export class UserService {
    private async generateUserId(userId: string) {
        let date = new Intl.DateTimeFormat([], {
            timeZone: 'Africa/Lagos',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
        const random = Math.floor(Math.random() * 10000);
        const timestamp = date;
        const uniqueId = `${random}-${timestamp}-${userId}`;
        const newUserId = `user-${uniqueId}`;
        return newUserId;
    }

    protected async deleteUser(userId: string) { }

    async getProfile(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const newUserId = this.generateUserId(userId);

            return {
                id: newUserId,
                data: user,
            };
        } catch (error) {
            throw error;
        }
    }

    async getUser(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) {
            return new CustomError("User does not exist", 400);
        }

        return user
    }

    async updateUser(userId: string, data: any) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                throw new Error('User not found');
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: data.firstName || user.firstName,
                    lastName: data.lastName || user.lastName,
                    email: data.email || user.email,
                    phoneNumber: data.phoneNumber || user.phoneNumber,
                    role: data.role || user.role,
                },
            });
            return updatedUser;

        } catch (error) {
            throw error;
        }
    }

    async requestDeleteUser(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                throw new Error('User not found');
            }

            const deletedUser = await prisma.user.delete({
                where: { id: userId },
            });
            return deletedUser;
        } catch (error) {
            throw error;
        }
    }

    async getBalance(userId: string, currency: FiatType) {
        // track USDC and local currency balances
        // assuming all onramp and offRamp are accounted for in the ledger. 
        // get user ledger balance from here
        try {
            const wallets = await prisma.virtualAccount.findMany({
                where: {
                    userId: userId,
                    currency: {
                        in: [currency]
                    }
                },
            });

            if (!wallets) {
                throw new Error('Wallet not found for this user');
            }

            return wallets;
        } catch (error) {
            throw error;
        }
    }

    async getTransactions(userId: string) {
        try {
            const transactions = await prisma.transaction.findMany({
                where: {
                    OR: [
                        { fromUserId: userId },
                        { toUserId: userId },
                    ],
                },
                select: {
                    id: true,
                    fromUserId: true,
                    toUserId: true,
                    amount: true,
                    assetType: true,
                    type: true,
                    status: true,
                    createdAt: true,
                    memo: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (transactions.length == 0) {
                return { userTransaction: [] }
            }

            return {
                userTransactions: transactions,
            };
        } catch (error) {
            throw error;
        }
    }

    async createVirtualAccount(userId: string, currency: FiatType) {
        const accountNumber = `VA${Date.now()}${Math.floor(Math.random() * 10000)}`;

        return prisma.virtualAccount.create({
            data: {
                userId,
                accountNumber,
                accountName: `${currency} Virtual Account`,
                currency,
                balance: 0,
                status: 'ACTIVE',
                limits: {
                    create: {
                        dailyLimit: 10000,
                        monthlyLimit: 50000,
                        transactionLimit: 5000
                    }
                }
            },
            include: {
                limits: true
            }
        });
    }

    async getVirtualAccountDetails(userId: string, currency: FiatType) {
        return await prisma.virtualAccount.findUnique({
            where: {
                id: userId, currency: currency
            }
        })
    }
    async getBalanceHistory() {
    }

    async generateAccountStatement() { }

    async checkTransactionLimits(id: string) {
        return await prisma.virtualAccountLimits.findFirst({
            where: {
                id: id
            },
        })
    }
}
