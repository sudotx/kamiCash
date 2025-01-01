import { Express, Request, Response } from "express";
import authRouter from "./resources/Auth/auth.routes";
import transactionRouter from "./resources/Transaction/transaction.routes";
import userRouter from "./resources/User/user.routes";
import adminRouter from "./resources/Admin/admin.routes";
import virtualAccountRouter from "./resources/VirtualAccount/virtualaccount.routes";
import { verifyJwt } from "./utils/jwt";

const dateFormatter = new Intl.DateTimeFormat([], {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
});

const API_VERSION = 'v1';

// Group v1 routes
const v1Routes = (app: Express) => {
    const v1BasePath = '/api/v1';

    app.use(`${v1BasePath}/auth`, authRouter);
    app.use(`${v1BasePath}/users`, userRouter);
    app.use(`${v1BasePath}/admin`, adminRouter);
    app.use(`${v1BasePath}/transactions`, transactionRouter);
    app.use(`${v1BasePath}/account`, virtualAccountRouter);

    app.use(`${v1BasePath}/wallets`, userRouter);
    app.use(`${v1BasePath}/exchange`, userRouter);
    app.use(`${v1BasePath}/savings`, userRouter);
    app.use(`${v1BasePath}/payments`, userRouter);
    app.use(`${v1BasePath}/cards`, userRouter);
    app.use(`${v1BasePath}/analytics`, userRouter);
    app.use(`${v1BasePath}/reports`, userRouter);
    app.use(`${v1BasePath}/partners`, userRouter);
    app.use(`${v1BasePath}/webhooks`, userRouter);
    app.use(`${v1BasePath}/contracts`, userRouter);
    app.use(`${v1BasePath}/market`, userRouter);
    app.use(`${v1BasePath}/security`, userRouter);
    app.use(`${v1BasePath}/risk`, userRouter);
    app.use(`${v1BasePath}/notifications`, userRouter);
    app.use(`${v1BasePath}/transfer`, transactionRouter);
};

// Group v2 routes (when needed)
const v2Routes = (app: Express) => {
    const v2BasePath = '/api/v2';

    app.all(`${v2BasePath}/*`, (req: Request, res: Response) => {
        res.status(200).json({
            success: false,
            message: "V2 API coming soon! Stay tuned for exciting new features.",
            currentVersion: API_VERSION
        });
    });
};

function routes(app: Express) {
    // Base route
    app.get("/", (req: Request, res: Response) =>
        res.send({
            success: true,
            message: "Welcome To Kemba Bank",
            timestamp: dateFormatter.format(new Date())
        })
    );

    // Email verification route
    app.use("/verify/:token", (req, res) => {
        const { token } = req.params;
        try {
            verifyJwt(token)
            res.status(200).json({ message: "Email verified successfully" })
        } catch (error) {
            res.status(400).json({ error: "Email verification failed" })
        }
    });

    // Initialize versioned routes
    v1Routes(app);
    v2Routes(app);
}

export default routes;
