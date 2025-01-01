import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { createVirtualAccount, deactivateVirtualAccount, freezeAccount, getAllVirtualAccounts, getVirtualAccountBalance, getVirtualAccountById, transferFunds, unfreezeAccount, updateVirtualAccount } from "./controllers/va.controller";
import { createAccountSchema, getVirtualAccountSchema, transactionHistorySchema, transferFundsSchema, updateAccountSchema } from "./schemas/index.schema";
import { getTransactionHistory } from "../Transaction/controllers/transaction.controller";

const virtualAccountRouter = Router();

// Account Creation and Basic Operations
virtualAccountRouter.get("/get", requireAuth, validateResource(getVirtualAccountSchema), getAllVirtualAccounts);
virtualAccountRouter.post("/create", requireAuth, validateResource(createAccountSchema), createVirtualAccount);
virtualAccountRouter.get("/balance/:accountId", requireAuth, getVirtualAccountBalance);
// ## 3. Wallet Operations
virtualAccountRouter.get("/:accountId", requireAuth, getVirtualAccountById);
virtualAccountRouter.get("/:address", requireAuth, getVirtualAccountById); // get deposit address
virtualAccountRouter.get("/sweep", requireAuth, getVirtualAccountById); // sweep small balances
virtualAccountRouter.get("/supported-coins", requireAuth, getVirtualAccountById); // list supported stableCoins
virtualAccountRouter.get("/set-primary", requireAuth, getVirtualAccountById); // set primary wallet

// Account Management
virtualAccountRouter.put("/:accountId", requireAuth, validateResource(updateAccountSchema), updateVirtualAccount);
virtualAccountRouter.delete("/:accountId", requireAuth, deactivateVirtualAccount);
virtualAccountRouter.post("/:accountId/freeze", requireAuth, freezeAccount);
virtualAccountRouter.post("/:accountId/unfreeze", requireAuth, unfreezeAccount);

// Transactions and History
virtualAccountRouter.get("/:accountId/transactions", requireAuth, validateResource(transactionHistorySchema), getTransactionHistory);
virtualAccountRouter.post("/transfer", requireAuth, validateResource(transferFundsSchema), transferFunds);


export default virtualAccountRouter;
