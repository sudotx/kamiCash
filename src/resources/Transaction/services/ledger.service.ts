import { EntryType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../../db";

export class LedgerService {
    async createEntry(
        userId: any,
        virtualAccountId: string,
        entryType: EntryType,
        amount: Decimal.Value,
        usdcAmount: any,
        description: any,
        transactionId: any,
        metadata: any
    ) {
        return prisma.$transaction(async (tx) => {
            const currentBalance = await this.getCurrentBalance(virtualAccountId);

            const virtualAccount = await tx.virtualAccount.findUnique({
                where: { id: virtualAccountId }
            });

            if (!virtualAccount) {
                throw new Error('Virtual account not found');
            }

            // Calculate new balances
            const newVirtualBalance = entryType === 'CREDIT'
                ? virtualAccount.balance.plus(amount)
                : virtualAccount.balance.minus(amount);

            // Create ledger entry
            const ledgerEntry = await tx.ledgerEntry.create({
                data: {
                    userId,
                    virtualAccountId,
                    entryType,
                    amount,
                    usdcAmount,
                    balance: newVirtualBalance,
                    description,
                    transactionId,
                    metadata
                }
            });

            await tx.virtualAccount.update({
                where: { id: virtualAccountId },
                data: {
                    balance: newVirtualBalance,
                    updatedAt: new Date()
                }
            });

            // Update virtual account balance
            // await tx.virtualAccount.update({
            //     where: {
            //         userId_assetType: {
            //             userId,
            //             assetType: 'USDC'
            //         }
            //     },
            //     data: {
            //         balance: entryType === 'CREDIT'
            //             ? { increment: usdcAmount }
            //             : { decrement: usdcAmount }
            //     }
            // });

            return ledgerEntry;
        });
    }

    async getCurrentBalance(virtualAccountId: string) {
        const virtualAccount = await prisma.virtualAccount.findUnique({
            where: { id: virtualAccountId },
            select: { balance: true }
        });
        return virtualAccount?.balance || new Decimal(0);
    }

    async getAccountEntries(virtualAccountId: string) {
        return prisma.ledgerEntry.findMany({
            where: { virtualAccountId },
            orderBy: { createdAt: 'desc' },
            include: {
                transaction: true
            }
        });
    }
}
