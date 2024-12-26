import { Express, Request, Response } from "express";

import authRouter from "./resources/Auth/auth.routes";
import cardRouter from "./resources/Card/card.routes";
import transferRouter from "./resources/Transfer/transfer.routes";
import virtualAccountRouter from "./resources/VirtualAccount/virtualaccount.routes";
import userRouter from "./resources/User/user.routes";

function routes(app: Express) {
    let date = new Date();
    app.get("/", (req: Request, res: Response) =>
        res.send({ success: true, message: "Welcome To SendMeFunds", timestamp: date.toLocaleString() })
    );
    app.use("/auth", authRouter);
    app.use("/card", cardRouter);
    app.use("/user", userRouter);
    app.use("/transfer", transferRouter);
    app.use("/account", virtualAccountRouter);
}

export default routes;
