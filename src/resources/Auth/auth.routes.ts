import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    assignUserPoints,
    changePasswordHandler,
    deactivateAccountHandler,
    disable2FAHandler,
    enable2FAHandler,
    forgotPasswordHandler,
    getLoggedInUserHandler,
    loginHandler,
    loginHistoryHandler,
    logoutHandler,
    refreshTokenHandler,
    registerHandler,
    resendVerificationHandler,
    resetPasswordHandler,
    socialAuthHandler,
    validateTokenHandler,
    verify2FAHandler,
    verifyEmailHandler
} from "./controllers/auth.controller";
import { changePasswordSchema, loginUserSchema, logoutUserSchema, registerUserSchema, resetPasswordSchema, twoFactorSchema } from "./schema/auth.schema";

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

// Core auth
authRouter.post("/refresh-token", refreshTokenHandler);
authRouter.post("/validate-token", validateTokenHandler);

// Password management
authRouter.post("/forgot-password", forgotPasswordHandler);
authRouter.post("/reset-password", validateResource(resetPasswordSchema), resetPasswordHandler);
authRouter.post("/change-password", requireAuth, validateResource(changePasswordSchema), changePasswordHandler);

// Email verification
authRouter.get("/verify-email/:token", verifyEmailHandler);
authRouter.post("/resend-verification", resendVerificationHandler);

// 2FA
authRouter.post("/2fa/enable", requireAuth, validateResource(twoFactorSchema), enable2FAHandler);
authRouter.post("/2fa/verify", requireAuth, validateResource(twoFactorSchema), verify2FAHandler);
authRouter.post("/2fa/disable", requireAuth, disable2FAHandler);

// Social auth
authRouter.get("/oauth/:provider", socialAuthHandler);
authRouter.get("/oauth/:provider/callback", socialAuthHandler);

// Account management
authRouter.post("/points", assignUserPoints)
authRouter.delete("/deactivate", requireAuth, deactivateAccountHandler);
authRouter.get("/login-history", requireAuth, loginHistoryHandler);

export default authRouter;
