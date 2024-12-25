import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendMail = async (
    email: string,
    subject: string,
    messageBody: string
) => {
    try {
        const mailOptions = {
            from: "brrrrr@vrooooom.com",
            to: email,
            sender: "no-reply@vrooooom.co",
            subject: subject,
            html: messageBody,
        };

        transporter.sendMail({ ...mailOptions }, (error: any, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                logger.info("Email sent:", info.response);
            }
        });
    } catch (err: any) {
        logger.error(err);
        return false;
    }
};
