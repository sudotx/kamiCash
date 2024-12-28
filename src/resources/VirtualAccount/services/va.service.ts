import { prisma } from "../../../db";
import generateAccountNumber, { CURRENCIES } from "../../../utils/generateAccountNumber";

export class VirtualAccountService {
    async createVirtualAccount(userId: string, currencyCode: keyof typeof CURRENCIES) {
        const accountNumber = generateAccountNumber(userId, currencyCode);

        try {
            return prisma.virtualAccount.create({
                data: {
                    userId,
                    accountNumber,
                    accountName: `${currencyCode} Account`,
                    currency: currencyCode + "",
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
                    user: true,
                }
            });
        } catch (error) {
            throw (error)
        }

    }

    async getAllWallets(userId: string) {
        try {
            const wallets = await prisma.virtualAccount.findMany({
                where: {
                    userId: userId,
                    status: "ACTIVE"
                },
            });
            if (!wallets) {
                throw new Error('Wallet not found for this user');
            }
            return wallets
        } catch (error) {
            throw error
        }
    }
}
