import { prisma } from "../../../db";
import { CURRENCIES } from "../../../utils/generateAccountNumber";
import generateAccountNumber from "../../../utils/generateAccountNumber";

export class VirtualAccountService {
    async createVirtualAccount(userId: string, currencyCode: keyof typeof CURRENCIES) {
        const accountNumber = generateAccountNumber(userId, currencyCode);

        return prisma.virtualAccount.create({
            data: {
                userId,
                accountNumber,
                accountName: `${CURRENCIES[currencyCode].name} Account`,
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
                limits: true,
                user: true
            }
        });
    }
}
