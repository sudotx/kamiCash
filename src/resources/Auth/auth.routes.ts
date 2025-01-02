import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    assignUserPoints,
    forgotPasswordHandler,
    getLoggedInUserHandler,
    loginHandler,
    logoutHandler,
    registerHandler,
    resetPasswordHandler,
    verifyEmailHandler
} from "./controllers/auth.controller";
import { loginUserSchema, logoutUserSchema, registerUserSchema, resetPasswordSchema } from "./schema/auth.schema";

const authRouter = express.Router();

authRouter.route("").get(requireAuth, getLoggedInUserHandler);

authRouter.post(
    "/register",
    validateResource(registerUserSchema),
    registerHandler
);

authRouter.post(
    "/login",
    validateResource(loginUserSchema),
    loginHandler
);

authRouter.post(
    "/logout",
    validateResource(logoutUserSchema),
    logoutHandler
);

authRouter.post("/points", assignUserPoints)


// Password management
authRouter.post("/forgot-password", forgotPasswordHandler);
authRouter.post("/reset-password", validateResource(resetPasswordSchema), resetPasswordHandler);

// Email verification
authRouter.get("/verify-email/:token", verifyEmailHandler);


// Account management
authRouter.post("/points", assignUserPoints)

export default authRouter;
