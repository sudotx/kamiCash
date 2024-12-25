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
    app.use("/api/auth", authRouter);
    app.use("/api/card", cardRouter);
    app.use("/api/user", userRouter);
    app.use("/api/transfer", transferRouter);
    app.use("/api/account", virtualAccountRouter);
}

export default routes;
