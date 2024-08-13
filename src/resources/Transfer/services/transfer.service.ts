import { AssetType, TransactionStatus, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";
import { InternalTransferInput, WithdrawInput } from "../schemas/index.schema";
import { sendMail } from "../../../utils/sendmail";

export class SolanaService {
    private connection: Connection;
    private payer: Keypair;

    constructor(rpcUrl: string) {
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

    async transferSPLToken(
        tokenMintAddress: string,
        fromTokenAccount: PublicKey,
        toTokenAccount: PublicKey,
        fromWallet: Keypair,
        amount: number
    ): Promise<string> {
        const mintPublicKey = new PublicKey(tokenMintAddress);

        const transaction = new Transaction().add(
            // Token.createTransferInstruction(
            //     TOKEN_PROGRAM_ID,
            //     fromTokenAccount,
            //     toTokenAccount,
            //     fromWallet.publicKey,
            //     [],
            //     amount
            // )
        );

        const signature = await this.connection.sendTransaction(transaction, [fromWallet, this.payer], { skipPreflight: false });

        await this.connection.confirmTransaction(signature);

        return signature;
    }

    async getBalance(publicKey: PublicKey): Promise<number> {
        return this.connection.getBalance(publicKey);
    }

    async getSPLTokenBalance(tokenAccount: PublicKey): Promise<number> {
        const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
        return parseFloat(accountInfo.value.amount);
    }

}

export class TransferService {
    private solanaService: SolanaService;

    constructor() {
        const rpcUrl = "http://127.0.0.1:8899";
        // const rpcUrl = "https://api.mainnet-beta.solana.com";
        this.solanaService = new SolanaService(rpcUrl);
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

                const txHash = await this.solanaService.transfer(fromUserId, toAddress, new Decimal(amount), assetType);

                const transactionRecord = await prisma.transaction.create({
                    data: {
                        fromUserId,
                        toAddress,
                        amount,
                        assetType,
                        txHash: txHash,
                        type: 'EXTERNAL',
                        status: 'COMPLETED',
                        memo,
                    },
                });

                const user = await prisma.user.findUnique({
                    where: { id: fromUserId },
                    select: { email: true },
                });

                if (user) {
                    sendMail(user.email, "External Transfer Completed", 'Your external transfer has been completed successfully.')
                }

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

}