
import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const paymentRouter = express.Router();
// - `POST /payments/request` - Create payment request
paymentRouter.post("/request", requireAuth)
// - `POST /payments/pay` - Pay a request
paymentRouter.post("/pay", requireAuth)
// - `GET /payments/bills` - List saved billers
paymentRouter.get("/bills")
// - `POST /payments/bills/pay` - Pay bills
paymentRouter.post("/bills/pay", requireAuth)
// - `POST /payments/subscriptions` - Manage subscriptions
paymentRouter.post("/subscriptions")
// - `GET /payments/scheduled` - View scheduled payments
paymentRouter.get("/payments/scheduled")
// - `POST /payments/bulk` - Bulk payments
paymentRouter.post("/payments/bulk")
// - `POST /payments/qr` - Generate payment QR
paymentRouter.post("/payments/qr")

export default paymentRouter;
