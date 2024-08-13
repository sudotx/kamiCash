import { AccountStatusEnum, AssetType, RoleEnum } from '@prisma/client';
import { Keypair } from '@solana/web3.js';
import { randomUUID } from 'crypto';
import { prisma } from '../../src/db';
import { AuthService } from '../../src/resources/Auth/services/auth.service';
import { CustomError } from '../../src/utils/handle-error';
import { hashData, unhashData } from '../../src/utils/hash';

jest.mock('../../../db', () => ({
    prisma: {
        user: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('../../../utils/hash', () => ({
    hashData: jest.fn(),
    unhashData: jest.fn(),
}));

jest.mock('crypto', () => ({
    randomUUID: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('validateUserPassword', () => {
        it('should return user data when the email and password are valid', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed-password',
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (unhashData as jest.Mock).mockResolvedValue(true);

            const result = await authService.validateUserPassword({
                email: 'test@example.com',
                password: 'password',
            });

            expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(unhashData).toHaveBeenCalledWith('password', 'hashed-password');
            expect(result).toEqual({ id: 'user-123', email: 'test@example.com' });
        });

        it('should return false when the user is not found', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await authService.validateUserPassword({
                email: 'test@example.com',
                password: 'password',
            });

            expect(result).toBe(false);
        });

        it('should return false when the password is invalid', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed-password',
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (unhashData as jest.Mock).mockResolvedValue(false);

            const result = await authService.validateUserPassword({
                email: 'test@example.com',
                password: 'password',
            });

            expect(result).toBe(false);
        });
    });

    describe('createUser', () => {
        it('should create a new user with hashed private key', async () => {
            const mockKeypair = Keypair.generate();
            const mockHashedPrivateKey = 'hashed-private-key';
            const mockUUID = 'uuid-123';

            (hashData as jest.Mock).mockResolvedValue(mockHashedPrivateKey);
            (randomUUID as jest.Mock).mockReturnValue(mockUUID);

            const result = await authService.createUser(
                'test@example.com',
                'hashed-password',
                'John',
                'Doe',
                '1234567890',
                mockKeypair,
            );

            expect(hashData).toHaveBeenCalledWith(mockKeypair.secretKey.toString());
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    id: mockUUID,
                    email: 'test@example.com',
                    password: 'hashed-password',
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: '1234567890',
                    role: RoleEnum.USER,
                    accountStatus: AccountStatusEnum.ACTIVE,
                    emailVerified: false,
                    solanaAddress: mockKeypair.publicKey.toString(),
                    solanaPrivateKey: mockHashedPrivateKey,
                    points: 50,
                    createdAt: expect.any(String),
                    wallets: {
                        create: [
                            { assetType: AssetType.SOL, balance: 0 },
                            { assetType: AssetType.USDC, balance: 0 },
                        ],
                    },
                },
            });
        });
    });

    describe('authenticateUser', () => {
        it('should return user data when email and password are valid', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed-password',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (unhashData as jest.Mock).mockResolvedValue(true);

            const result = await authService.authenticateUser('test@example.com', 'password');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(unhashData).toHaveBeenCalledWith('password', 'hashed-password');
            expect(result).toEqual(mockUser);
        });

        it('should throw an error when the email or password is invalid', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(authService.authenticateUser('test@example.com', 'password')).rejects.toThrow(CustomError);
        });
    });

    describe('getUserById', () => {
        it('should return user data when the user is found', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await authService.getUserById('user-123');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } });
            expect(result).toEqual(mockUser);
        });

        it('should throw an error when the user is not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(authService.getUserById('user-123')).rejects.toThrow(CustomError);
        });
    });

    describe('sanitizeUser', () => {
        it('should return sanitized user data without password and private key', () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                password: 'hashed-password',
                solanaPrivateKey: 'hashed-private-key',
            };

            const result = authService.sanitizeUser(mockUser);

            expect(result).toEqual({
                id: 'user-123',
                email: 'test@example.com',
            });
        });
    });
});
