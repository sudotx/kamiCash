import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const exchangeRouter = express.Router();
// Get exchange rates
exchangeRouter.get("/rates")
// Convert between stablecoins
exchangeRouter.post("/convert")
// Get trading pairs
exchangeRouter.get("/pairs")
// Instant swap
exchangeRouter.post("/swap", requireAuth)
// Get trading limits
exchangeRouter.get("/limits", requireAuth)
// Place limit orders
exchangeRouter.post("/orders", requireAuth)
// View order book
exchangeRouter.get("/order-book")


export default exchangeRouter;
