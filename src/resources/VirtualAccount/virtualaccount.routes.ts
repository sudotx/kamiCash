import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { createVirtualAccount, deactivateVirtualAccount, freezeAccount, getAllVirtualAccounts, getVirtualAccountBalance, getVirtualAccountById, transferFunds, unfreezeAccount, updateVirtualAccount } from "./controllers/va.controller";
import { createAccountSchema, getVirtualAccountSchema, transactionHistorySchema, transferFundsSchema, updateAccountSchema } from "./schemas/index.schema";
import { getTransactionHistory } from "../Transaction/controllers/transaction.controller";

const virtualAccountRouter = Router();

// Account Creation and Basic Operations
virtualAccountRouter.get("/get", requireAuth, validateResource(getVirtualAccountSchema), getAllVirtualAccounts);
virtualAccountRouter.get("/create", requireAuth, validateResource(createAccountSchema), createVirtualAccount);
virtualAccountRouter.get("/balance/:accountId", requireAuth, getVirtualAccountBalance);
virtualAccountRouter.get("/:accountId", requireAuth, getVirtualAccountById);

// Account Management
virtualAccountRouter.put("/:accountId", requireAuth, validateResource(updateAccountSchema), updateVirtualAccount);
virtualAccountRouter.delete("/:accountId", requireAuth, deactivateVirtualAccount);
virtualAccountRouter.post("/:accountId/freeze", requireAuth, freezeAccount);
virtualAccountRouter.post("/:accountId/unfreeze", requireAuth, unfreezeAccount);

// Transactions and History
virtualAccountRouter.get("/:accountId/transactions", requireAuth, validateResource(transactionHistorySchema), getTransactionHistory);
virtualAccountRouter.post("/transfer", requireAuth, validateResource(transferFundsSchema), transferFunds);

export default virtualAccountRouter;
