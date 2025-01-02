
import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";

const virtualCardRouter = express.Router();
// - `POST /cards/create` - Create virtual card
virtualCardRouter.post("/create", requireAuth)
// - `GET /cards` - List all cards
virtualCardRouter.get("/cards", requireAuth)
// - `POST /cards/{id}/freeze` - Freeze/unfreeze card
virtualCardRouter.post("/freeze", requireAuth)
// - `PUT /cards/{id}/limits` - Set card limits
virtualCardRouter.put("/limits", requireAuth)
// - `GET /cards/{id}/transactions` - Card transactions
virtualCardRouter.get("/transactions", requireAuth)
// - `POST /cards/topup` - Top up card
virtualCardRouter.post("/cards/topup", requireAuth)
// - `DELETE /cards/{id}` - Delete card
virtualCardRouter.delete("/cards/:id", requireAuth)
// - `POST /cards/pin` - Set/change PIN
virtualCardRouter.post("/cards/pin", requireAuth)

export default virtualCardRouter;
