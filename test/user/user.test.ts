import { UserService } from '../../src/resources/User/services/user.service';
import { prisma } from "../../src/db";

// Mock prisma
jest.mock("../../src/db", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        wallet: {
            findMany: jest.fn(),
        },
    },
}));

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const mockUser = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '1234567890',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getProfile('user-123');

            expect(result.data).toEqual(mockUser);
            expect(result.id).toMatch(/^user-\d+-\d+-user-123$/);
        });

        it('should throw an error if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(userService.getProfile('non-existent')).rejects.toThrow('User not found');
        });
    });

    describe('updateUser', () => {
        it('should update user details', async () => {
            const mockUser = {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '1234567890',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updateData = {
                firstName: 'Jane',
                email: 'jane@example.com',
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, ...updateData });

            const result = await userService.updateUser('user-123', updateData);

            expect(result).toEqual({ ...mockUser, ...updateData });
        });

        it('should throw an error if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(userService.updateUser('non-existent', {})).rejects.toThrow('User not found');
        });
    });

    describe('getBalance', () => {
        it('should return user balances', async () => {
            const mockWallets = [
                { assetType: 'SOL', balance: 100 },
                { assetType: 'USDC', balance: 500 },
            ];

            (prisma.wallet.findMany as jest.Mock).mockResolvedValue(mockWallets);

            const result = await userService.getBalance('user-123');

            expect(result).toEqual({
                sol_balance: '100',
                usdc_balance: '500',
            });
        });

        it('should return zero balances if no wallets found', async () => {
            (prisma.wallet.findMany as jest.Mock).mockResolvedValue([]);

            const result = await userService.getBalance('user-123');

            expect(result).toEqual({
                sol_balance: '0',
                usdc_balance: '0',
            });
        });
    });
});