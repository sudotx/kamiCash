
import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const paymentRouter = express.Router();
// ## 7. Payment Services
// - `POST /payments/request` - Create payment request
// - `POST /payments/pay` - Pay a request
// - `GET /payments/bills` - List saved billers
// - `POST /payments/bills/pay` - Pay bills
// - `POST /payments/subscriptions` - Manage subscriptions
// - `GET /payments/scheduled` - View scheduled payments
// - `POST /payments/bulk` - Bulk payments
// - `POST /payments/qr` - Generate payment QR

export default paymentRouter;
