import { AssetType, TransactionStatus, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";
import { InternalTransferInput, WithdrawInput } from "../schemas/index.schema";
import { sendMail } from "../../../utils/sendmail";
import { logger } from "../../../utils/logger";
import { Key } from "readline";
import { AddressLike, ethers, JsonRpcProvider } from "ethers";

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

export class EVMService {
    private connection: JsonRpcProvider;
    private payer: AddressLike;

    constructor(rpcUrl: string) {
        this.connection = new ethers.JsonRpcProvider()
        this.payer = ethers.Wallet.createRandom()
    }

    async getBalance() { }
    async sendTransaction() { }
}

export class StellarService {
    constructor(rpcUrl: string) {
    }
    async getBalance() { }
    async sendTransaction() { }

}
// these are for onchain transactions

// persist transfer related changes to the database
export class TransferService {
    private solanaService: SolanaService;
    private evmService: EVMService;

    constructor() {
        this.solanaService = new SolanaService("http://127.0.0.1:8899");
        this.evmService = new EVMService("")
    }

    async executeInternalTransfer(data: InternalTransferInput['body']) {
        const { from, to, amount, assetType, memo } = data;
        const amountDecimal = new Decimal(amount);

        const user = await prisma.user.findUnique({
            where: { id: from },
            include: { wallets: true },
        });


        try {
            return await prisma.$transaction(async (prisma) => {
                const [senderUpdate, transactionRecord] = await Promise.all([
                    prisma.wallet.updateMany({
                        where: {
                            userId: from,
                            assetType: assetType
                        },
                        data: { balance: { decrement: amount } }
                    }),
                    prisma.wallet.upsert({
                        where: { userId_assetType: { userId: to, assetType: assetType } },
                        update: { balance: { increment: amount } },
                        create: { userId: to, assetType, balance: amount }
                    }),
                    prisma.transaction.createMany({
                        data: [
                            {
                                amount: amount,
                                assetType: assetType,
                                fromUserId: from,
                                status: "PENDING",
                                type: "INTERNAL",
                            },
                        ]
                    }),
                    prisma.ledgerEntry.createMany({
                        data: [
                            {
                                amount: amount,
                                entryType: "CREDIT",
                                description: memo || "",
                                balance: "1",
                                usdcAmount: "1",
                                userId: from,
                                virtualAccountId: "",
                            },
                            {
                                amount: amount,
                                entryType: "DEBIT",
                                description: memo || "",
                                balance: "1",
                                usdcAmount: "1",
                                userId: to,
                                virtualAccountId: "",
                            },
                        ]
                    })
                ])
                if (senderUpdate.count === 0) {
                    throw new Error("Insufficient Balance")
                }
                return { "senderUpdate": senderUpdate, "transaction record": transactionRecord }
            })
        } catch (error) {
            throw (error)

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

    // Virtual account transfers
    // USDC vault operations
    // Settlement processing
    // Transaction monitoring
    // Circuit breakers

}