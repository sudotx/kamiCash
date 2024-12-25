import { Router } from "express";
import { getBalance, getTransactions, getUserAccountDetails, reconcile, verify } from "./controllers/ledger.controller";

const ledgerRouter = Router();

ledgerRouter.get("/balance", getBalance);

ledgerRouter.get("/transactions", getTransactions);

ledgerRouter.get("/account/:userid", getUserAccountDetails);

ledgerRouter.get("/reconciliation", reconcile);

ledgerRouter.post("/verify", verify);

export default ledgerRouter;
