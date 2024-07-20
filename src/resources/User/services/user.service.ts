import { prisma } from "../../../db";

export class UserService {
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

    private generateUserId(userId: string) {
        const random = Math.floor(Math.random() * 10000);
        const timestamp = Date.now();
        const uniqueId = `${random}-${timestamp}-${userId}`;
        const newUserId = `user-${uniqueId}`;
        return newUserId;
    }

    async getBalance(userId: string) {
        try {
            const wallet = await prisma.wallet.findUnique({
                where: {
                    userId_assetType: {
                        userId: userId,
                        assetType: 'SOL', // Default or a specific asset type
                    },
                },
            });

            if (!wallet) {
                throw new Error('Wallet not found for this user');
            }

            return {
                balance: wallet.balance.toNumber(), // Convert Decimal to number if necessary
            };
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

            return {
                userTransactions: transactions,
            };
        } catch (error) {
            throw error;
        }
    }
}
