import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { cancelTransaction, deposit, getTransactionHistory, getTransactionReceipt, getTransactionStatus, handleTransactionCallback, internalTransfer, withdraw } from "./controllers/transaction.controller";
import { internalTransferSchema } from "./schemas/index.schema";

const transactionRouter = Router();

transactionRouter.post("/internal", validateResource(internalTransferSchema), requireAuth, internalTransfer);
transactionRouter.post("/deposit", validateResource(internalTransferSchema), requireAuth, internalTransfer);
transactionRouter.post("/withdrawal", validateResource(internalTransferSchema), requireAuth, internalTransfer);
// Deposit routes
transactionRouter.post(
    '/deposit',
    deposit
);

// Withdrawal routes
transactionRouter.post(
    '/withdraw',
    withdraw
);

// Transfer routes
transactionRouter.post(
    '/transfer',
    internalTransfer
);

// Transaction management routes
transactionRouter.get(
    '/status/:transactionId',
    getTransactionStatus
);

transactionRouter.get(
    '/history',
    getTransactionHistory
);

transactionRouter.post(
    '/cancel/:transactionId',
    cancelTransaction
);

transactionRouter.get(
    '/receipt/:transactionId',
    getTransactionReceipt
);

// Webhook/Callback route (usually needs different authentication)
transactionRouter.post(
    '/webhook',
    // validateWebhookSecret,
    handleTransactionCallback
);

export default transactionRouter;
