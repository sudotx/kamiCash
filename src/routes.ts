import { Express, Request, Response } from "express";
import authRouter from "./resources/Auth/auth.routes";
import transactionRouter from "./resources/Transaction/transaction.routes";
import userRouter from "./resources/User/user.routes";
import virtualAccountRouter from "./resources/VirtualAccount/virtualaccount.routes";
import { verifyJwt } from "./utils/jwt";

let date = new Intl.DateTimeFormat([], {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

function routes(app: Express) {
    app.get("/", (req: Request, res: Response) =>
        res.send({ success: true, message: "Welcome To Kemba Bank", timestamp: date.format(new Date()) })
    );
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/transfer", transactionRouter);
    app.use("/account", virtualAccountRouter);
    app.use("/verify/:token", (req, res) => {
        const { token } = req.params;
        try {
            verifyJwt(token)
            res.status(200).json({ message: "Email verified successfully" })
        } catch (error) {
            res.status(400).json({ error: "Email verification failed" })
        }
    });
}

export default routes;
