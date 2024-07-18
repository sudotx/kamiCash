import nodemailer from "nodemailer";

// Create a Nodemailer transporter using SMTP
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
        // Define email options
        const mailOptions = {
            from: "rootlex@tenaciti.com",
            to: email,
            sender: "no-reply@tenaciti.co",
            subject: subject,
            html: messageBody,
        };

        // Send the email
        transporter.sendMail({ ...mailOptions }, (error: any, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });
    } catch (err: any) {
        console.log("Failed to send email:", err);
        return false;
    }
};
