import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../src/db";
import { TransferService } from "../../src/resources/Transfer/services/transfer.service";

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


describe("TransferService", () => {
    let transferService: TransferService;

    beforeEach(() => {
        transferService = new TransferService();
    });

    afterEach(() => {
        jest.clearAllMocks();
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
