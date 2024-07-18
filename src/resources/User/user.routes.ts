import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { getUserBalance, getUserProfile, getUserTransactions } from "./controllers/user.controller";
import { getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema } from "./schemas/index.schema";

const userRouter = Router();

userRouter.get("/user/profile", validateResource(getUserProfileSchema), getUserProfile);

userRouter.get("/user/balance", validateResource(getUserBalanceSchema), getUserBalance);

userRouter.get("/users/transactions", validateResource(getUserTransactionsSchema), getUserTransactions);

export default userRouter;
