import { Express, Request, Response } from "express";

import authRouter from "./resources/Auth/auth.routes";
import cardRouter from "./resources/Card/card.routes";
import transferRouter from "./resources/Transfer/transfer.routes";
import userRouter from "./resources/User/user.routes";

function routes(app: Express) {
    app.get("/", (req: Request, res: Response) =>
        res.send({ message: "Welcome To PayMeNow" })
    );
    app.use("/api/auth", authRouter);
    app.use("/api/card", cardRouter);
    app.use("/api/user", userRouter);
    app.use("/api/transfer", transferRouter);
}

export default routes;
