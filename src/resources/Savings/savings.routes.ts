import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const savingsRouter = express.Router();
// # 6. Savings & Yield
// - `GET /savings/products` - List savings products
// - `POST /savings/deposit` - Deposit to savings
// - `POST /savings/withdraw` - Withdraw from savings
// - `GET /savings/balance` - Get savings balance
// - `GET /savings/interest-rate` - Get current rates
// - `GET /savings/earnings` - View earned interest
// - `POST /savings/auto-invest` - Set up auto-invest

export default savingsRouter;
