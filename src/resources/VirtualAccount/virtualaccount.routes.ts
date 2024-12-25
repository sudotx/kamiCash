import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
// import { getUserBalance, getUserProfile, getUserTransactions } from "./controllers/user.controller.ts";
// import { getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema } from "./schemas/index.schema.ts";
import { requireAdminAuth } from "../../middlewares/auth.middleware";
import { VirtualAccountActs } from "./services/va.service";

const virtualAccountRouter = Router();
const va = new VirtualAccountActs();


virtualAccountRouter.get("/create", requireAdminAuth, va.createVirtualAccount);

export default virtualAccountRouter;
