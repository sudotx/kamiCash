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
            const wallets = await prisma.wallet.findMany({
                where: {
                    userId: userId,
                    assetType: {
                        in: ['SOL', 'USDC']
                    }
                },
            });

            if (!wallets) {
                throw new Error('Wallet not found for this user');
            }

            const balances = {
                sol_balance: '0',
                usdc_balance: '0'
            };

            for (const wallet of wallets) {
                if (wallet.assetType === 'SOL') {
                    balances.sol_balance = wallet.balance.toString();
                } else if (wallet.assetType === 'USDC') {
                    balances.usdc_balance = wallet.balance.toString();
                }
            }

            return balances;
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
}
