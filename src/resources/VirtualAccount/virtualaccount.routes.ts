import { Router } from "express";
// import { getUserBalanceSchema, getUserProfileSchema, getUserTransactionsSchema } from "./schemas/index.schema.ts";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createVirtualAccount, getAllVirtualAccounts } from "./controllers/va.controller";

const virtualAccountRouter = Router();

virtualAccountRouter.get("/create", requireAuth, createVirtualAccount);
virtualAccountRouter.get("/get", requireAuth, getAllVirtualAccounts);

export default virtualAccountRouter;
