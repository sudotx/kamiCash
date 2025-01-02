
import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const virtualCardRouter = express.Router();
// ## 8. Virtual Cards
// - `POST /cards/create` - Create virtual card
// - `GET /cards` - List all cards
// - `POST /cards/{id}/freeze` - Freeze/unfreeze card
// - `PUT /cards/{id}/limits` - Set card limits
// - `GET /cards/{id}/transactions` - Card transactions
// - `POST /cards/topup` - Top up card
// - `DELETE /cards/{id}` - Delete card
// - `POST /cards/pin` - Set/change PIN

export default virtualCardRouter;
