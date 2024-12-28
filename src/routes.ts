import { Express, Request, Response } from "express";
const jwt = require('jsonwebtoken');

import authRouter from "./resources/Auth/auth.routes";
import cardRouter from "./resources/Card/card.routes";
import transferRouter from "./resources/Transfer/transfer.routes";
import virtualAccountRouter from "./resources/VirtualAccount/virtualaccount.routes";
import userRouter from "./resources/User/user.routes";
import { verifyJwt } from "./utils/jwt";

function routes(app: Express) {

    let date = new Intl.DateTimeFormat([], {
        timeZone: 'Africa/Lagos',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    });
    app.get("/", (req: Request, res: Response) =>
        res.send({ success: true, message: "Welcome To SendMeFunds", timestamp: date.format(new Date()) })
    );
    app.use("/auth", authRouter);
    app.use("/card", cardRouter);
    app.use("/user", userRouter);
    app.use("/transfer", transferRouter);
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
