import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../../db";
import { ExternalTransferInput, InternalTransferInput } from "../schemas/index.schema";

export class TransferService {
    async executeExternalTransfer(data: ExternalTransferInput['body']) {
        const { fromUserId, toAddress, amount, assetType, memo } = data;
        try {
            const transaction = await prisma.$transaction(async (prisma) => {
                // Check if user has sufficient balance
                const userBalance = await prisma.wallet.findUnique({
                    where: {
                        userId_assetType: {
                            userId: fromUserId,
                            assetType: assetType,
                        },
                    },
                });

                let amt = new Decimal(amount)
                console.log(amt);

                if (!userBalance || userBalance.balance < amt) {
                    throw new Error('Insufficient balance');
                }

                // Deduct amount from user's balance
                await prisma.wallet.update({
                    where: {
                        userId_assetType: {
                            userId: fromUserId,
                            assetType: assetType,
                        },
                    },
                    data: {
                        balance: {
                            decrement: amount,
                        },
                    },
                });

                // const txHash = await this.solanaService.transfer(fromUserId, toAddress, amount, assetType);

                const transactionRecord = await prisma.transaction.create({
                    data: {
                        fromUserId,
                        toAddress,
                        amount,
                        assetType,
                        // txHash,
                        type: 'EXTERNAL',
                        status: 'COMPLETED',
                        memo,
                    },
                });

                return transactionRecord;
            });

            // await this.notificationService.notifyUser(fromUserId, 'External transfer completed');

            return { transactionId: transaction.id };

        } catch (error) {
            throw error;
        }
    }

    async executeInternalTransfer(data: InternalTransferInput['body']) {
        const { fromUserId, toUserId, amount, assetType, memo } = data;
        const amountDecimal = new Decimal(amount);

        try {
            const transaction = await prisma.$transaction(async (prisma) => {
                // Check if sender has sufficient balance
                const senderWallet = await prisma.wallet.findUnique({
                    where: {
                        userId_assetType: {
                            userId: fromUserId,
                            assetType: assetType,
                        },
                    },
                });

                if (!senderWallet || new Decimal(senderWallet.balance).lessThan(amountDecimal)) {
                    throw new Error('Insufficient balance');
                }

                // Deduct amount from sender's balance
                await prisma.wallet.update({
                    where: {
                        userId_assetType: {
                            userId: fromUserId,
                            assetType: assetType,
                        },
                    },
                    data: {
                        balance: {
                            decrement: amountDecimal.toString(),
                        },
                    },
                });

                // Add amount to recipient's balance
                const recipientWallet = await prisma.wallet.upsert({
                    where: {
                        userId_assetType: {
                            userId: toUserId,
                            assetType: assetType,
                        },
                    },
                    update: {
                        balance: {
                            increment: amountDecimal.toString(),
                        },
                    },
                    create: {
                        userId: toUserId,
                        assetType: assetType,
                        balance: amountDecimal,
                    },
                });

                const transactionRecord = await prisma.transaction.create({
                    data: {
                        fromUserId,
                        toUserId,
                        amount: amountDecimal,
                        assetType,
                        type: 'INTERNAL',
                        status: 'COMPLETED',
                        memo,
                    },
                });

                // Return the transaction record
                return transactionRecord;
            });

            // Send notifications to both users
            // await this.notificationService.notifyUser(fromUserId, 'Internal transfer sent');
            // await this.notificationService.notifyUser(toUserId, 'Internal transfer received');

            return { transactionId: transaction.id };

        } catch (error) {
            // Rollback the database transaction if any error occurs
            // Prisma automatically rolls back on error in $transaction
            throw error;
        }
    }
}