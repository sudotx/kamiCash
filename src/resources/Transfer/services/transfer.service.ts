import { AssetType, TransactionStatus, TransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";
import { InternalTransferInput } from "../schemas/index.schema";
// import { sendMail } from "../../../utils/sendmail";
import axios from "axios";
import { AddressLike, ethers, JsonRpcProvider } from "ethers";
import * as multichainWallet from 'multichain-crypto-wallet';

export class OnchainService {
    private connection: JsonRpcProvider;
    private payer: AddressLike;
    constructor(rpcUrl: string) {
        this.connection = new ethers.JsonRpcProvider()
        this.payer = ethers.Wallet.createRandom()
    }
    async getBalance() {
        // Get the ETH balance of an address.
        const data = await multichainWallet.getBalance({
            address: '0x2455eC6700092991Ce0782365A89d5Cd89c8Fa22',
            network: 'ethereum',
            rpcUrl: 'https://rpc.ankr.com/eth_goerli',
        }); // NOTE - For otherEVM compatible blockchains all you have to do is change the rpcUrl.

        // Get the balance of an ERC20 token.
        const data6 = await multichainWallet.getBalance({
            address: '0x2455eC6700092991Ce0782365A89d5Cd89c8Fa22',
            network: 'ethereum',
            rpcUrl: 'https://rpc.ankr.com/eth_goerli',
            tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        }); // NOTE - For other EVM compatible blockchains all you have to do is change the rpcUrl.

        return { "ETH Balance": data, "Token Data": data6 }

    }
    async sendTransaction() {
        // Transferring ETH from one address to another.
        const transfer = await multichainWallet.transfer({
            recipientAddress: '0x2455eC6700092991Ce0782365A89d5Cd89c8Fa22',
            amount: 1,
            network: 'ethereum',
            rpcUrl: 'https://rpc.ankr.com/eth_goerli',
            privateKey:
                '0f9e5c0bee6c7d06b95204ca22dea8d7f89bb04e8527a2c59e134d185d9af8ad',
            gasPrice: '10', // Gas price is in Gwei. Leave empty to use default gas price
            data: 'Money for transportation', // Send a message
        }); // NOTE - For other EVM compatible blockchains all you have to do is change the rpcUrl.

        // Transferring a token from one address to another.
        const transfer8 = await multichainWallet.transfer({
            recipientAddress: '9DSRMyr3EfxPzxZo9wMBPku7mvcazHTHfyjhcfw5yucA',
            tokenAddress: 'DV2exYApRFWEVb9oQkedLRYeSm8ccxNReLfEksEE5FZm',
            amount: 1,
            network: 'solana',
            rpcUrl: 'https://api.devnet.solana.com',
            privateKey:
                'h5KUPKU4z8c9nhMCQsvCLq4q6Xn9XK1B1cKjC9bJVLQLgJDvknKCBtZdHKDoKBHuATnSYaHRvjJSDdBWN8P67hh',
        });

        // Calling a read smart contract function.
        const data = await multichainWallet.smartContractCall({
            rpcUrl: 'https://rpc.ankr.com/eth_goerli',
            network: 'ethereum',
            contractAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
            method: 'transfer',
            methodType: 'write',
            params: ['0x2455eC6700092991Ce0782365A89d5Cd89c8Fa22', '1000000000000000000'],
            contractAbi: [
                {
                    constant: false,
                    inputs: [
                        { name: '_to', type: 'address' },
                        { name: '_value', type: 'uint256' },
                    ],
                    name: 'transfer',
                    outputs: [{ name: '', type: 'bool' }],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'function',
                },
            ],
            privateKey:
                '0f9e5c0bee6c7d06b95204ca22dea8d7f89bb04e8527a2c59e134d185d9af8ad',
        }); // NOTE - For other EVM compatible blockchains all you have to do is change the rpcUrl.

        // calling a write smart contract function.
        const data4 = await multichainWallet.smartContractCall({
            rpcUrl: 'https://rpc.ankr.com/eth_goerli',
            network: 'ethereum',
            contractAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            method: 'factory',
            methodType: 'read',
            params: [],
            contractAbi: [
                {
                    inputs: [],
                    name: 'factory',
                    outputs: [{ internalType: 'address', name: '', type: 'address' }],
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
        }); // NOTE - For other EVM compatible blockchains all you have to do is change the rpcUrl.
    }



}
// these are for onchain transactions

// persist transfer related changes to the database
export class TransferService {
    async executeInternalTransfer(data: InternalTransferInput['body']) {
        const { from, to, amount, assetType, memo } = data;
        const amountDecimal = new Decimal(amount);


        const user = await prisma.user.findUnique({
            where: { id: from },
            include: { VirtualAccount: true },
        });

        const accountNumber = await prisma.virtualAccount.findUnique({
            where: { id: from, currency: assetType },
            select: {
                accountNumber: true
            }
        })

        if (!accountNumber) {
            throw new Error('Account not found for this user');
        }

        try {
            return await prisma.$transaction(async (prisma) => {
                const [senderUpdate, transactionRecord] = await Promise.all([
                    this.validateSenderBalance(from, assetType, amountDecimal),
                    this.updateSenderBalance(from, amountDecimal, assetType),
                    this.updateRecipientBalance(to, assetType, amountDecimal),
                    this.createTransactionRecord(from, to, amountDecimal, assetType, memo || ""),
                    prisma.ledgerEntry.createMany({
                        data: [
                            {
                                amount: amount,
                                entryType: "CREDIT",
                                description: memo || "",
                                balance: "1",
                                usdcAmount: amount,
                                userId: from,
                                virtualAccountId: "062ebe0f-be78-488a-846b-04d624d54662",
                            },
                            {
                                amount: amount,
                                entryType: "DEBIT",
                                description: memo || "",
                                balance: "1",
                                usdcAmount: amount,
                                userId: to,
                                virtualAccountId: "062ebe0f-be78-488a-846b-04d624d54662",
                            },
                        ]
                    })
                ])
                return { "senderUpdate": senderUpdate, "transaction record": transactionRecord }
            })
        } catch (error) {
            throw (error)
        }
    }

    async depositForUser(userId: string, amount: number, assetType: AssetType) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { VirtualAccount: true },
        });

        if (!user) {
            throw new CustomError("User not found", 404);
        }

        const wallet = user.VirtualAccount.find(w => w.currency === assetType);

        if (!wallet) {
            throw new CustomError(`Wallet for ${assetType} not found`, 404);
        }

        const updatedWallet = await prisma.virtualAccount.update({
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
                fiatType: 'NGN',
                netAmount: "",
                paymentMethod: "BANK_TRANSFER",
            },
        });

        return updatedWallet;
    }

    private async validateSenderBalance(from: string, assetType: AssetType, amount: Decimal) {
        // const senderWallet = await prisma.virtualAccount.findUnique({
        //     // where: { userId_assetType: { userId: from, assetType: assetType, } },
        // });
        // if (!senderWallet || new Decimal(senderWallet.balance).lessThan(amount)) {
        //     throw new Error('Insufficient balance');
        // }
        // return senderWallet;
    }

    private async updateSenderBalance(senderWallet: any, amount: Decimal, assetType: AssetType) {
        // await prisma.wallet.updateMany({
        //     where: {
        //         userId: senderWallet,
        //         assetType: assetType
        //     },
        //     data: { balance: { decrement: amount } }
        // })
    }

    async executeDeposit(amount: number, assetType: AssetType, fromUserId: string, toAddress: string, memo: string) {
        // call striga
        // get money
        // update user, ledger, wallet, transaction
        let data = `{"amount":${amount},"assetType":"${assetType}","toAddress":"${toAddress}","memo":"${memo}"}`;

        let config = {
            method: 'post',
            url: 'https://www.sandbox.striga.com/api/v1/ping',
            headers: {
                'Authorization': 'HMAC 1735526446347:46174dfa48baca125ca853c7e4c90607603df7ebae146f1a7e89fd0feaee3a41',
                'api-key': process.env.RESEND_API_KEY
            },
            data: data
        };

        axios(config).then((response) => {
            console.log(JSON.stringify(response.data));
        }).catch((error) => {
            console.log(error);
        })
    }

    executeWithdraw(amount: number, assetType: AssetType, fromUserId: string, toAddress: string, memo: string) {
        // get money
        // update user, ledger, wallet, transaction
        let data = `{"amount":${amount},"assetType":"${assetType}","toAddress":"${toAddress}","memo":"${memo}"}`;

        let config = {
            method: 'post',
            url: 'https://www.sandbox.striga.com/api/v1/ping',
            headers: {
                'Authorization': 'HMAC 1735526446347:46174dfa48baca125ca853c7e4c90607603df7ebae146f1a7e89fd0feaee3a41',
                'api-key': process.env.RESEND_API_KEY
            },
            data: data
        };

        axios(config).then((response) => {
            console.log(JSON.stringify(response.data));
        }).catch((error) => {
            console.log(error);
        })
    }

    private async updateRecipientBalance(to: string, assetType: AssetType, amount: Decimal) {
        // await prisma.virtualAccount.upsert({
        //     where: { userId_assetType: { userId: to, assetType: assetType } },
        //     update: { balance: { increment: amount } },
        //     create: { userId: to, assetType, balance: amount },
        // });
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
                fiatType: "NGN",
                netAmount: "",
                paymentMethod: "BANK_TRANSFER",
            },
        });
    }

    // Virtual account transfers
    // USDC vault operations
    // Settlement processing
    // Transaction monitoring
    // Circuit breakers
}