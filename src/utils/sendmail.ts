import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import { logger } from "./logger";

interface MailTemplate {
    subject: string;
    text: string;
}

const createJwtToken = () => {
    return jwt.sign({
        data: 'Token Data',
    }, 'ourSecretKey', { expiresIn: '10m' });
};

interface TemplateData {
    WELCOME: { token: string };
    PAYMENT_SUCCESS: { amount: string; currency: string };
    TRANSFER_RECEIVED: { amount: string; sender: string };
    VIRTUAL_CARD_CREATED: { lastFourDigits: string };
    ACCOUNT_ACTIVITY: { activity: string };
}

const mailTemplates = {
    WELCOME: ({ token }: TemplateData['WELCOME']): MailTemplate => ({
        subject: "Welcome to KamiCash - Verify Your Email",
        text: `Welcome to KamiCash! \n\nPlease verify your email: http://localhost:6969/verify/${token}`
    }),

    PAYMENT_SUCCESS: ({ amount, currency }: TemplateData['PAYMENT_SUCCESS']): MailTemplate => ({
        subject: "Payment Successful - KamiCash",
        text: `Your payment of ${amount} ${currency} has been processed successfully!`
    }),

    TRANSFER_RECEIVED: ({ amount, sender }: TemplateData['TRANSFER_RECEIVED']): MailTemplate => ({
        subject: "New Transfer Received - KamiCash",
        text: `You've received ${amount} from ${sender}`
    }),

    VIRTUAL_CARD_CREATED: ({ lastFourDigits }: TemplateData['VIRTUAL_CARD_CREATED']): MailTemplate => ({
        subject: "Virtual Card Created - KamiCash",
        text: `Your new virtual card ending in ${lastFourDigits} is ready`
    }),

    ACCOUNT_ACTIVITY: ({ activity }: TemplateData['ACCOUNT_ACTIVITY']): MailTemplate => ({
        subject: "Account Activity Alert - KamiCash",
        text: `New activity: ${activity}`
    })
};

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,
        secure: false,
        auth: {
            user: '1a2b3c4d5e6f7g',
            pass: process.env.RESEND_API_KEY,
        }
    });
};

export const sendMail = async <T extends keyof TemplateData>(
    email: string,
    templateType: T,
    templateData?: any
) => {
    const transporter = createTransporter();
    const token = createJwtToken();

    logger.info(`Sending ${templateType} email to: ${email}`);

    try {
        const template = mailTemplates[templateType](templateData);

        const mailOptions = {
            from: 'noreply@kamicash.com',
            to: email,
            subject: template.subject,
            text: template.text,
        };

        const result = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully: ${result.messageId}`);
        return true;
    } catch (error) {
        logger.error('Email sending failed:', error);
        return false;
    }
};


// sendMail(userEmail, 'TRANSFER_RECEIVED', { amount: '1000', sender: 'John Doe' });