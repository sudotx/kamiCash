import { AssetType, TransactionStatus, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";
import { sendMail } from "../../../utils/sendmail";
import { InternalTransferInput, WithdrawInput } from "../schemas/index.schema";

export class SolanaService {
    private connection: Connection;
    private payer: Keypair;

    constructor(rpcUrl: string, /*payerKeypair: Keypair*/) {
        this.connection = new Connection(rpcUrl, "confirmed");
        this.payer = Keypair.generate()
    }

    async transfer(fromUserId: string, toAddress: string, amount: Decimal, assetType: string): Promise<string> {
        const amountLamports = amount.mul(Decimal.pow(10, 9)).toNumber(); // Assuming SOL has 9 decimal places

        const fromPublicKey = new PublicKey(fromUserId); // Your logic might be different for the public key
        const toPublicKey = new PublicKey(toAddress);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromPublicKey,
                toPubkey: toPublicKey,
                lamports: amountLamports,
            })
        );

        const signature = await this.connection.sendTransaction(transaction, [this.payer], { skipPreflight: false });

        await this.connection.confirmTransaction(signature);

        return signature;
    }
}

export class notificationService {
    async sendMail(email: string, subject: string, msgBody: string) {
        const success = await sendMail(email, subject, msgBody);
        if (success) {
            console.log("Email was sent successfully.");
        } else {
            console.log("Failed to send email.");
        }
    }
}

export class TransferService {
    private solanaService: SolanaService;
    private notificationService: notificationService;

    constructor() {
        // Initialize SolanaService with RPC URL and payer Keypair
        const rpcUrl = "https://api.mainnet-beta.solana.com";
        this.solanaService = new SolanaService(rpcUrl,);
        this.notificationService = new notificationService();
    }
    async executeExternalTransfer(data: WithdrawInput['body']) {
        const { fromUserId, toAddress, amount, assetType, memo } = data;
        try {
            const transaction = await prisma.$transaction(async (prisma) => {
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

                // const txHash = await this.solanaService.transfer(fromUserId, toAddress, new Decimal(amount), assetType);

                const transactionRecord = await prisma.transaction.create({
                    data: {
                        fromUserId,
                        toAddress,
                        amount,
                        assetType,
                        txHash: "",
                        type: 'EXTERNAL',
                        status: 'COMPLETED',
                        memo,
                    },
                });

                // const user = await prisma.user.findUnique({
                //     where: { id: fromUserId },
                //     select: { email: true },
                // });

                // if (user && user.email) {
                //     // Send email notification
                //     this.notificationService.sendMail(user.email, "External Transfer Completed", 'Your external transfer has been completed successfully.')
                // } else {
                //     console.error('User not found or email not available.');
                // }

                return transactionRecord;
            });

            return { transactionId: transaction.id };

        } catch (error) {
            throw error;
        }
    }

    async executeInternalTransfer(data: InternalTransferInput['body']) {
        const { from, to, amount, assetType, memo } = data;
        const amountDecimal = new Decimal(amount);

        try {
            return await prisma.$transaction(async (prisma) => {
                const [senderUpdate, recipientWallet, transactionRecord] = await Promise.all([
                    prisma.wallet.updateMany({
                        where: {
                            userId: from,
                            assetType: assetType,
                            balance: { gte: amount }
                        },
                        data: { balance: { decrement: amount.toString() } }
                    }),
                    prisma.wallet.upsert({
                        where: { userId_assetType: { userId: to, assetType: assetType } },
                        update: { balance: { increment: amount.toString() } },
                        create: { userId: to, assetType, balance: amount }
                    }),
                    prisma.transaction.create({
                        data: {
                            fromUserId: from,
                            toUserId: to,
                            amount,
                            assetType,
                            type: 'INTERNAL',
                            status: 'COMPLETED',
                            memo: memo || ''
                        }
                    })
                ]);

                if (senderUpdate.count === 0) {
                    throw new Error('Insufficient balance');
                }

                return { transactionId: transactionRecord.id };
            });

        } catch (error) {
            throw error;
        }
    }

    depositForUser = async (userId: string, amount: number, assetType: AssetType) => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { wallets: true },
        });

        if (!user) {
            throw new CustomError("User not found", 404);
        }

        const wallet = user.wallets.find(w => w.assetType === assetType);

        if (!wallet) {
            throw new CustomError(`Wallet for ${assetType} not found`, 404);
        }

        const updatedWallet = await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: amount } },
        });

        await prisma.transaction.create({
            data: {
                fromUserId: userId,
                toUserId: userId,
                amount,
                assetType,
                type: TransactionType.INTERNAL,
                status: TransactionStatus.COMPLETED,
                memo: "Deposit",
            },
        });

        return updatedWallet;
    }

    private async validateSenderBalance(from: string, assetType: AssetType, amount: Decimal) {
        const senderWallet = await prisma.wallet.findUnique({
            where: { userId_assetType: { userId: from, assetType: assetType, } },
        });
        if (!senderWallet || new Decimal(senderWallet.balance).lessThan(amount)) {
            throw new Error('Insufficient balance');
        }
        return senderWallet;
    }

    private async updateSenderBalance(senderWallet: any, amount: Decimal) {
        await prisma.wallet.update({
            where: { id: senderWallet.id },
            data: { balance: { decrement: amount.toString() } },
        });
    }

    private async updateRecipientBalance(to: string, assetType: AssetType, amount: Decimal) {
        await prisma.wallet.upsert({
            where: { userId_assetType: { userId: to, assetType: assetType } },
            update: { balance: { increment: amount.toString() } },
            create: { userId: to, assetType, balance: amount },
        });
    }

    private async createTransactionRecord(from: string, to: string, amount: Decimal, assetType: AssetType, memo: string) {
        return await prisma.transaction.create({
            data: {
                fromUserId: from,
                toUserId: to,
                amount,
                assetType: assetType,
                type: 'INTERNAL',
                status: 'COMPLETED',
                memo,
            },
        });
    }

    private async sendNotifications(from: string, to: string) {
        const [sender, recipient] = await Promise.all([
            prisma.user.findUnique({ where: { id: from }, select: { email: true } }),
            prisma.user.findUnique({ where: { id: to }, select: { email: true } }),
        ]);
        await this.notificationService.sendMail(sender?.email!, "", 'Internal transfer sent');
        await this.notificationService.sendMail(recipient?.email!, "", 'Internal transfer received');
    }
}