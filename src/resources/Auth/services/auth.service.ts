import { $Enums, AccountStatusEnum, AssetType, RoleEnum } from "@prisma/client";
import { Keypair } from "@solana/web3.js";
import { randomUUID } from "crypto";
import { ethers } from "ethers";
import { prisma } from "../../../db";
import { CustomError } from "../../../utils/handle-error";
import { hashData, unhashData } from "../../../utils/hash";
import { sendMail } from "../../../utils/sendmail";

export class AuthService {
    constructor() { }

    async validateUserPassword({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                },
            });

            if (!user) {
                return false;
            }

            const isValid = await unhashData(password, user.password);

            if (!isValid) {
                return false;
            }

            const { password: _, ...rest } = user;

            return rest;

        } catch (error) {
            console.error("Error validating admin password:", error);
            throw new Error("An error occurred while validating the admin password.");
        }
    }

    createUser = async (email: string, password: string, firstName: string, lastName: string, phoneNumber: string) => {
        const ethWallet = ethers.Wallet.createRandom();
        const hashedPassword = await hashData(password);
        const hashedPrivateKeyEth = await hashData(ethWallet.privateKey.toString());
        const keypair = Keypair.generate();
        const hashedPrivateKey = await hashData(keypair.secretKey.toString());
        let userId = randomUUID();

        try {
            await sendMail(email, "WELCOME")
            // expand AML/KYC checks
            // add compliance verification

            return prisma.user.create({
                data: {
                    id: userId,
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    phoneNumber,
                    role: RoleEnum.USER,
                    accountStatus: AccountStatusEnum.ACTIVE,
                    emailVerified: false,
                    isKyc: false,
                    solanaAddress: keypair.publicKey.toString(),
                    solanaPrivateKey: hashedPrivateKey,
                    evmAddress: ethWallet.address.toString(),
                    evmPrivateKey: hashedPrivateKeyEth,
                    points: 50,
                },
            });
        } catch (error) {
            throw (error)
        }

    };

    authenticateUser = async (email: string, password: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await unhashData(password, user.password))) {
            throw new CustomError("Invalid email or password", 401);
        }
        return user;
    };

    clearUserCookies = (res: Response) => {
        const cookiesToClear = ["token", "refreshToken", "userId", "userEmail"];
        // cookiesToClear.forEach(cookie => res.clearCookie(cookie));
    };

    getUserById = async (id: string) => {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new CustomError("User not found", 404);
        }
        return user;
    };

    sanitizeUser = (user: { [x: string]: any; id?: string; email?: string; password: any; firstName?: string; lastName?: string; phoneNumber?: string; role?: $Enums.RoleEnum; accountStatus?: $Enums.AccountStatusEnum; emailVerified?: boolean; solanaAddress?: string | null; solanaPrivateKey: any; points?: number; createdAt?: Date; updatedAt?: Date; lastLogin?: Date | null; }) => {
        const { password, solanaPrivateKey, evmPrivateKey, ...sanitizedUser } = user;
        return sanitizedUser;
    };


    updateUserPoints = (id: string, amount: number) => {
        const user = prisma.user.findUnique({ where: { id } })

        if (!user) {
            throw new CustomError("", 400)
        }

        prisma.user.update({
            where: {
                id
            },
            data: { points: { increment: amount } }
        })

        return user
    }

}