import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { addBankAccount, changePassword, getBankAccounts, getKYCStatus, getLoginHistory, getNotificationSettings, getReferrals, getUserBalance, getUserProfile, getUserTransactions, removeBankAccount, toggleTwoFactor, updateNotificationSettings, uploadKYC } from "./controllers/user.controller";
import { bankAccountSchema, changePasswordSchema, getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema, notificationSettingsSchema } from "./schemas/index.schema";
import { requireAuth } from "../../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/profile", validateResource(getUserProfileSchema), requireAuth, getUserProfile);

userRouter.get("/balance", validateResource(getUserBalanceSchema), getUserBalance);

userRouter.get("/transactions", validateResource(getUserTransactionsSchema), getUserTransactions);

// Profile management
userRouter.post("/change-password", requireAuth, validateResource(changePasswordSchema), changePassword);
userRouter.post("/2fa/toggle", requireAuth, toggleTwoFactor);

// KYC
userRouter.post("/kyc/upload", requireAuth, uploadKYC);
userRouter.get("/kyc/status", requireAuth, getKYCStatus);

// Bank accounts
userRouter.get("/bank-accounts", requireAuth, getBankAccounts);
userRouter.post("/bank-accounts", requireAuth, validateResource(bankAccountSchema), addBankAccount);
userRouter.delete("/bank-accounts/:id", requireAuth, removeBankAccount);

// Additional features
userRouter.get("/login-history", requireAuth, getLoginHistory);
userRouter.get("/referrals", requireAuth, getReferrals);
userRouter.get("/notifications/settings", requireAuth, getNotificationSettings);
userRouter.put("/notifications/settings", requireAuth, validateResource(notificationSettingsSchema), updateNotificationSettings);

export default userRouter;
