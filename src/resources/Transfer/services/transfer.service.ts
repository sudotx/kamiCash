import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../../db";
import { ExternalTransferInput, InternalTransferInput } from "../schemas/index.schema";
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { sendMail } from "../../../utils/sendmail";

export class SolanaService {
    private connection: Connection;
    private payer: Keypair;

    constructor(rpcUrl: string, payerKeypair: Keypair) {
        this.connection = new Connection(rpcUrl, "confirmed");
        this.payer = payerKeypair;
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
        const rpcUrl = "https://api.mainnet-beta.solana.com"; // or your specific network
        const keypairPath = path.resolve(__dirname, "keypair.json"); // Adjust the path as needed
        const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
        this.solanaService = new SolanaService(rpcUrl, secretKey);
        this.notificationService = new notificationService();
    }
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

                const txHash = await this.solanaService.transfer(fromUserId, toAddress, new Decimal(amount), assetType);

                const transactionRecord = await prisma.transaction.create({
                    data: {
                        fromUserId,
                        toAddress,
                        amount,
                        assetType,
                        txHash,
                        type: 'EXTERNAL',
                        status: 'COMPLETED',
                        memo,
                    },
                });

                const user = await prisma.user.findUnique({
                    where: { id: fromUserId },
                    select: { email: true },
                });

                if (user && user.email) {
                    // Send email notification
                    this.notificationService.sendMail(user.email, "External Transfer Completed", 'Your external transfer has been completed successfully.')
                } else {
                    console.error('User not found or email not available.');
                }

                return transactionRecord;
            });

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

                return transactionRecord;
            });

            const [sender, recipient] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: fromUserId },
                    select: { email: true },
                }),
                prisma.user.findUnique({
                    where: { id: toUserId },
                    select: { email: true },
                }),
            ]);

            await this.notificationService.sendMail(sender?.email!, "", 'Internal transfer sent');
            await this.notificationService.sendMail(recipient?.email!, "", 'Internal transfer received');

            return { transactionId: transaction.id };

        } catch (error) {
            // Rollback the database transaction if any error occurs
            // Prisma automatically rolls back on error in $transaction
            throw error;
        }
    }
}