import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { cancelScheduledTransaction, cancelTransaction, deposit, disputeTransaction, estimateTransactionFee, exportTransactions, getBulkTransactions, getFees, getScheduledTransactions, getTransactionAnalytics, getTransactionHistory, getTransactionReceipt, getTransactionStatus, handleTransactionCallback, initiateRefund, internalTransfer, scheduleTransaction, validateAccountBalance, withdraw } from "./controllers/transaction.controller";
import { disputeSchema, exportSchema, internalTransferSchema, refundSchema, scheduleTransactionSchema } from "./schemas/index.schema";

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

// Advanced transaction features
transactionRouter.post("/refund/:transactionId", requireAuth, validateResource(refundSchema), initiateRefund);
transactionRouter.post("/dispute/:transactionId", requireAuth, validateResource(disputeSchema), disputeTransaction);
transactionRouter.get("/bulk", requireAuth, getBulkTransactions);
transactionRouter.post("/export", requireAuth, validateResource(exportSchema), exportTransactions);
transactionRouter.get("/analytics", requireAuth, getTransactionAnalytics);

// Scheduled transactions
transactionRouter.post("/schedule", requireAuth, validateResource(scheduleTransactionSchema), scheduleTransaction);
transactionRouter.get("/schedule", requireAuth, getScheduledTransactions);
transactionRouter.delete("/schedule/:scheduleId", requireAuth, cancelScheduledTransaction);

// Fee management
transactionRouter.get("/fees", requireAuth, getFees);
transactionRouter.post("/estimate-fee", requireAuth, estimateTransactionFee);

// Pre-transaction validation
transactionRouter.post("/validate-balance", requireAuth, validateAccountBalance);

export default transactionRouter;
