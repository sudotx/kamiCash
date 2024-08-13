import { Decimal } from "@prisma/client/runtime/library";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { prisma } from "../../src/db";
import { SolanaService, TransferService } from "../../src/resources/Transfer/services/transfer.service";

// Mock Prisma
jest.mock("../../src/db", () => ({
    prisma: {
        wallet: {
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            upsert: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    },
}));

// Mock Solana connection and Keypair
jest.mock("@solana/web3.js", () => {
    const originalModule = jest.requireActual("@solana/web3.js");
    return {
        ...originalModule,
        Connection: jest.fn().mockImplementation(() => ({
            getBalance: jest.fn().mockResolvedValue(1000000000), // Mock balance in lamports
            getTokenAccountBalance: jest.fn().mockResolvedValue({ value: { amount: "1000" } }),
            sendTransaction: jest.fn().mockResolvedValue("mockTransactionSignature"),
            confirmTransaction: jest.fn().mockResolvedValue(true),
        })),
        Keypair: {
            generate: jest.fn().mockReturnValue({
                publicKey: "mockPublicKey",
            }),
        },
        PublicKey: jest.fn().mockImplementation((key) => key),
        Transaction: jest.fn().mockImplementation(() => ({
            add: jest.fn().mockReturnThis(),
        })),
    };
});

// Mock sendMail
jest.mock("../../src/utils/sendmail", () => ({
    sendMail: jest.fn(),
}));

describe("SolanaService", () => {
    let solanaService: SolanaService;

    beforeEach(() => {
        solanaService = new SolanaService("http://127.0.0.1:8899");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should transfer SOL", async () => {
        const signature = await solanaService.transfer("mockFromUserId", "mockToAddress", new Decimal(1), "SOL");

        expect(signature).toBe("mockTransactionSignature");
        expect(Connection.prototype.sendTransaction).toHaveBeenCalled();
        expect(Connection.prototype.confirmTransaction).toHaveBeenCalled();
    });

    it("should get balance", async () => {
        const balance = await solanaService.getBalance(new PublicKey("mockPublicKey"));

        expect(balance).toBe(1000000000); // Balance in lamports
        expect(Connection.prototype.getBalance).toHaveBeenCalledWith(new PublicKey("mockPublicKey"));
    });

    it("should get SPL token balance", async () => {
        const balance = await solanaService.getSPLTokenBalance(new PublicKey("mockTokenAccount"));

        expect(balance).toBe(1000); // Balance in tokens
        expect(Connection.prototype.getTokenAccountBalance).toHaveBeenCalledWith(new PublicKey("mockTokenAccount"));
    });
});

describe("TransferService", () => {
    let transferService: TransferService;

    beforeEach(() => {
        transferService = new TransferService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should execute external transfer", async () => {
        (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ balance: new Decimal(10) });
        (prisma.wallet.update as jest.Mock).mockResolvedValue({});
        (prisma.transaction.create as jest.Mock).mockResolvedValue({ id: "mockTransactionId" });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: "test@example.com" });

        const result = await transferService.executeExternalTransfer({
            fromUserId: "mockFromUserId",
            toAddress: "mockToAddress",
            amount: 1,
            assetType: "SOL",
            memo: "Test memo",
        });

        expect(result).toEqual({ transactionId: "mockTransactionId" });
        expect(prisma.wallet.update).toHaveBeenCalled();
        expect(prisma.transaction.create).toHaveBeenCalled();
        expect(prisma.user.findUnique).toHaveBeenCalled();
    });

    it("should throw an error if the external transfer balance is insufficient", async () => {
        (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ balance: new Decimal(0.1) });

        await expect(
            transferService.executeExternalTransfer({
                fromUserId: "mockFromUserId",
                toAddress: "mockToAddress",
                amount: 1,
                assetType: "SOL",
                memo: "Test memo",
            })
        ).rejects.toThrow("Insufficient balance");
    });

    it("should execute internal transfer", async () => {
        (prisma.wallet.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
        (prisma.wallet.upsert as jest.Mock).mockResolvedValue({});
        (prisma.transaction.create as jest.Mock).mockResolvedValue({ id: "mockTransactionId" });

        const result = await transferService.executeInternalTransfer({
            from: "mockFromUserId",
            to: "mockToUserId",
            amount: 1,
            assetType: "SOL",
            memo: "Test memo",
        });

        expect(result).toEqual({ transactionId: "mockTransactionId" });
        expect(prisma.wallet.updateMany).toHaveBeenCalled();
        expect(prisma.wallet.upsert).toHaveBeenCalled();
        expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it("should throw an error if the internal transfer balance is insufficient", async () => {
        (prisma.wallet.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

        await expect(
            transferService.executeInternalTransfer({
                from: "mockFromUserId",
                to: "mockToUserId",
                amount: 1,
                assetType: "SOL",
                memo: "Test memo",
            })
        ).rejects.toThrow("Insufficient balance");
    });

    it("should deposit for a user", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: "mockUserId",
            wallets: [{ id: "mockWalletId", assetType: "SOL", balance: new Decimal(0) }],
        });
        (prisma.wallet.update as jest.Mock).mockResolvedValue({});
        (prisma.transaction.create as jest.Mock).mockResolvedValue({});

        await transferService.depositForUser("mockUserId", 1, "SOL");

        expect(prisma.wallet.update).toHaveBeenCalledWith({
            where: { id: "mockWalletId" },
            data: { balance: { increment: 1 } },
        });
        expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it("should throw an error if user is not found on deposit", async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(transferService.depositForUser("mockUserId", 1, "SOL")).rejects.toThrow("User not found");
    });
});
