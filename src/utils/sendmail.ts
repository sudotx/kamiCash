import nodemailer from "nodemailer";
import { logger } from "./logger";
const jwt = require('jsonwebtoken');

const token = jwt.sign({
    data: 'Token Data',
}, 'ourSecretKey', { expiresIn: '10m' }
);

export const sendMail = async (
    email: string,
    subject: string,
) => {
    const transporter = nodemailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,
        secure: false, // use SSL
        auth: {
            user: '1a2b3c4d5e6f7g',
            pass: '1a2b3c4d5e6f7g',
        }
    });

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
            ,

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
