import { Express, Request, Response } from "express";
import adminRouter from "./resources/Admin/admin.routes";
import authRouter from "./resources/Auth/auth.routes";
import transactionRouter from "./resources/Transaction/transaction.routes";
import userRouter from "./resources/User/user.routes";
import virtualAccountRouter from "./resources/VirtualAccount/virtualaccount.routes";
import virtualCardRouter from "./resources/VirtualCard/vc.routes";
import { verifyJwt } from "./utils/jwt";

// Constants
const API_VERSIONS = {
    V1: 'v1',
    V2: 'v2'
} as const;

const dateFormatter = new Intl.DateTimeFormat([], {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
});

// Route handlers
const handleEmailVerification = (req: Request, res: Response) => {
    const { token } = req.params;
    try {
        verifyJwt(token);
        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(400).json({ error: "Email verification failed" });
    }
};

const handleBaseRoute = (_req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Welcome To Kemba Bank",
        timestamp: dateFormatter.format(new Date())
    });
};

const handleV2Routes = (_req: Request, res: Response) => {
    return res.status(200).json({
        success: false,
        message: "V2 API coming soon! Stay tuned for exciting new features.",
        currentVersion: API_VERSIONS.V1
    });
};

// Route configuration
const configureV1Routes = (app: Express) => {
    const v1BasePath = '/api/v1';
    const routes = [
        { path: '/auth', router: authRouter },
        { path: '/users', router: userRouter },
        { path: '/admin', router: adminRouter },
        { path: '/transactions', router: transactionRouter },
        { path: '/account', router: virtualAccountRouter },
        { path: '/cards', router: virtualCardRouter }
    ];

    routes.forEach(({ path, router }) => {
        app.use(`${v1BasePath}${path}`, router);
    });
};

const configureV2Routes = (app: Express) => {
    const v2BasePath = '/api/v2';
    app.all(`${v2BasePath}/*`, handleV2Routes);
};

// Main routes configuration
function routes(app: Express) {
    // Base routes
    app.get("/", handleBaseRoute);
    app.use("/verify/:token", handleEmailVerification);

    // API version routes
    configureV1Routes(app);
    configureV2Routes(app);
}

export default routes;
