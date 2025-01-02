import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const savingsRouter = express.Router();
// - `GET /savings/products` - List savings products
savingsRouter.get("/products")
// - `POST /savings/deposit` - Deposit to savings
savingsRouter.get("/deposit", requireAuth)
// - `POST /savings/withdraw` - Withdraw from savings
savingsRouter.get("/withdraw", requireAuth)
// - `GET /savings/balance` - Get savings balance
savingsRouter.get("/balance", requireAuth)
// - `GET /savings/interest-rate` - Get current rates
savingsRouter.get("/interest-rate", requireAuth)
// - `GET /savings/earnings` - View earned interest
savingsRouter.get("/earnings")
// - `POST /savings/auto-invest` - Set up auto-invest
savingsRouter.get("/auto-invest", requireAuth)

export default savingsRouter;
