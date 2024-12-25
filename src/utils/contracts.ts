import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { ethers } from 'ethers';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { logger } from './logger';

export class BlockchainContracts {
    private solanaConnection: Connection;
    private evmProvider: ethers.Provider;
    private solanaRpcUrl: string = process.env.SOLANA_RPC_URL || '';
    private evmRpcUrl: string = process.env.EVM_RPC_URL || '';

    constructor() {
        this.solanaConnection = new Connection(this.solanaRpcUrl, 'confirmed');
        this.evmProvider = new ethers.JsonRpcProvider(this.evmRpcUrl);
    }

    // Solana Read Functions
    async getSolanaTokenBalance(walletAddress: string, tokenMintAddress: string): Promise<number> {
        const wallet = new PublicKey(walletAddress);
        const mint = new PublicKey(tokenMintAddress);
        const tokenAccounts = await this.solanaConnection.getTokenAccountsByOwner(wallet, { mint });
        return tokenAccounts.value[0]?.account.data.byteLength || 0;
    }

    async getSolanaTransactionStatus(signature: string) {
        const status = await this.solanaConnection.getSignatureStatus(signature);
        return status;
    }

    // Solana Write Functions
    async createSolanaTokenAccount(walletAddress: string, tokenMintAddress: string): Promise<string> {
        const wallet = new PublicKey(walletAddress);
        const mint = new PublicKey(tokenMintAddress);
        // Implementation for creating token account
        return "token_account_address";
    }

    // EVM Read Functions
    async getEvmTokenBalance(walletAddress: string, tokenContractAddress: string): Promise<string> {
        const contract = new ethers.Contract(
            tokenContractAddress,
            ['function balanceOf(address) view returns (uint256)'],
            this.evmProvider
        );
        const balance = await contract.balanceOf(walletAddress);
        return balance.toString();
    }

    async getEvmTransactionStatus(txHash: string) {
        const receipt = await this.evmProvider.getTransactionReceipt(txHash);
        return receipt;
    }

    // EVM Write Functions
    async sendEvmTransaction(
        fromAddress: string,
        toAddress: string,
        amount: string,
        privateKey: string
    ): Promise<string> {
        const wallet = new ethers.Wallet(privateKey, this.evmProvider);
        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amount)
        });
        return tx.hash;
    }

    // Token Transfer Functions
    async transferEvmToken(
        tokenContractAddress: string,
        fromAddress: string,
        toAddress: string,
        amount: string,
        privateKey: string
    ): Promise<string> {
        const wallet = new ethers.Wallet(privateKey, this.evmProvider);
        const contract = new ethers.Contract(
            tokenContractAddress,
            ['function transfer(address, uint256) returns (bool)'],
            wallet
        );
        const tx = await contract.transfer(toAddress, amount);
        return tx.hash;
    }

    // Utility Functions
    async getGasPrice() {
        return await this.evmProvider.getFeeData();
    }

    async getSolanaRecentBlockhash() {
        return await this.solanaConnection.getRecentBlockhash();
    }
}
