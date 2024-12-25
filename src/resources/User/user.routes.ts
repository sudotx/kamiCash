import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { getUserBalance, getUserProfile, getUserTransactions } from "./controllers/user.controller";
import { getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema } from "./schemas/index.schema";
import { requireAdminAuth } from "../../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/profile", validateResource(getUserProfileSchema), requireAdminAuth, getUserProfile);

userRouter.get("/balance", validateResource(getUserBalanceSchema), getUserBalance);

userRouter.get("/transactions", validateResource(getUserTransactionsSchema), getUserTransactions);

export default userRouter;
