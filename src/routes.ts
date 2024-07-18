import { Express, Request, Response } from "express";
import authRouter from "./resources/Auth/auth.routes";
import userRouter from "./resources/User/user.routes";

function routes(app: Express) {
    app.get("/", (req: Request, res: Response) =>
        res.send({ message: "Welcome To PayMeNow" })
    );
    app.use("/api/auth/admin", userRouter);
    app.use("/api/user", userRouter);
    app.use("/api/transfer", userRouter);
    app.use("/api/card", userRouter);
    app.use("/api/wallet", userRouter);
    app.use("/api/vendor", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
}

export default routes;
