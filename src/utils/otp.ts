import prisma from "../db";
import { hashData, unhashData } from "./hash";
import { sendMail } from "./sendmail";

const generateOtp = async () => {
    return Math.floor(100000 + Math.random() * 900000);
};

export const sendOtp = async (
    email: string,
    name?: string
): Promise<{
    status: boolean;
    error?: string;
    code?: string;
}> => {
    try {
        if (!email) {
            throw {
                message: "Please insert an email",
            };
        }

        // Delete the email if it exists
        const emailCheck = await prisma.otp.findFirst({
            where: {
                email,
            },
        });

        if (emailCheck) {
            await prisma.otp.delete({
                where: {
                    email,
                },
            });
        }

        const generatedOtp = await generateOtp();
        // const verifyEmailMessage = verifyEmailTemplate(
        //     generatedOtp,
        //     name || "Friend"
        // );

        sendMail(email, "Verify Your Email", "verifyEmailMessage");

        const hashedOtp = await hashData(generatedOtp.toString());

        const expiryDate = Date.now() + 60000 * 15;

        await prisma.otp.create({
            data: {
                email,
                expiresAt: expiryDate,
                code: hashedOtp,
            },
        });

        return {
            status: true,
            code: hashedOtp,
        };
    } catch (error: any) {
        return {
            status: false,
            error: error.message,
        };
    }
};

export const verifyOtp = async (
    email: string,
    code: string
) => {
    try {
        const otp = await prisma.otp.findFirst({
            where: {
                email,
            },
        });

        if (!otp) {
            throw {
                meessage: "Email not found.",
                statusCode: 404,
            };
        }

        const { expiresAt, code: dbCode } = otp;

        if (expiresAt < Date.now()) {
            // Delete the email if it exists
            await prisma.otp.delete({
                where: {
                    email,
                },
            });
            throw {
                message: "OTP code has expired. Please request a new one.",
                statusCode: 401,
            };
        }

        const isValid = await unhashData(code, dbCode);

        if (!isValid) {
            throw {
                message: "OTP code is not valid",
                errorCode: 401,
            };
        }

        return {
            status: true,
        };
    } catch (err: any) {
        return {
            status: false,
            error: err.message,
        };
    }
};
