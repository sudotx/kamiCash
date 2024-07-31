import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { getUserBalance, getUserProfile, getUserTransactions } from "./controllers/user.controller";
import { getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema } from "./schemas/index.schema";

const userRouter = Router();

userRouter.get("/profile", validateResource(getUserProfileSchema), getUserProfile);

userRouter.get("/balance", validateResource(getUserBalanceSchema), getUserBalance);

userRouter.get("/transactions", validateResource(getUserTransactionsSchema), getUserTransactions);

export default userRouter;
