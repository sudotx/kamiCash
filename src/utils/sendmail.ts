import nodemailer from "nodemailer";
import { logger } from "./logger";
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

const token = jwt.sign({
    data: 'Token Data',
}, 'ourSecretKey', { expiresIn: '10m' }
);

export const sendMail = async (
    email: string,
    subject: string,
    messageBody: string
) => {
    try {
        const mailOptions = {

            // It should be a string of sender/server email 
            from: 'agbadilawa78@gmail.com',

            to: email,

            // Subject of Email 
            subject: subject,

            // This would be the text of email body 
            text: `Hi there, you have recently entered your 
                email on our website. 
        
                Please follow the given link to verify your email 
                http://localhost:6969/verify/${token} 
        
                Thanks`

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
