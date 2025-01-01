import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { addBankAccount, changePassword, getBankAccounts, getKYCStatus, getLoginHistory, getNotificationSettings, getReferrals, getUserBalance, getUserProfile, getUserTransactions, removeBankAccount, toggleTwoFactor, updateNotificationSettings, uploadKYC } from "./controllers/user.controller";
import { bankAccountSchema, changePasswordSchema, getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema, notificationSettingsSchema } from "./schemas/index.schema";

const userRouter = Router();

userRouter.get("/profile", validateResource(getUserProfileSchema), requireAuth, getUserProfile);
userRouter.put("/profile", validateResource(getUserProfileSchema), requireAuth, getUserProfile);

userRouter.get("/balance", validateResource(getUserBalanceSchema), getUserBalance);

// - `GET /users/limits` - Get account limits
userRouter.get("/limits", validateResource(getUserBalanceSchema), getUserBalance);
// - `POST /users/beneficiaries` - Add beneficiaries
userRouter.post("/beneficiaries", validateResource(getUserBalanceSchema), getUserBalance);
// - `GET /users/activity-log` - Get account activity
userRouter.get("/activity-log", validateResource(getUserBalanceSchema), getUserBalance);
// - `POST /users/preferences` - Set account preferences
userRouter.post("/preferences", validateResource(getUserBalanceSchema), getUserBalance);

userRouter.get("/transactions", validateResource(getUserTransactionsSchema), getUserTransactions);

// Profile management
userRouter.post("/change-password", requireAuth, validateResource(changePasswordSchema), changePassword);
userRouter.post("/2fa/toggle", requireAuth, toggleTwoFactor);

// KYC
// - `POST /users/kyc` - Submit KYC documents
userRouter.post("/kyc/upload", requireAuth, uploadKYC);
// - `GET /users/kyc/status` - Check KYC status
userRouter.get("/kyc/status", requireAuth, getKYCStatus);

// Bank accounts
userRouter.get("/bank-accounts", requireAuth, getBankAccounts);
userRouter.post("/bank-accounts", requireAuth, validateResource(bankAccountSchema), addBankAccount);
userRouter.delete("/bank-accounts/:id", requireAuth, removeBankAccount);

// Additional features
userRouter.get("/login-history", requireAuth, getLoginHistory);
userRouter.get("/referrals", requireAuth, getReferrals);
userRouter.put("/notifications/settings", requireAuth, validateResource(notificationSettingsSchema), updateNotificationSettings);
userRouter.get("/notifications/settings", requireAuth, getNotificationSettings);

export default userRouter;
