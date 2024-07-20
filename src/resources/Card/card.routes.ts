import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { getCardDetails, linkCard, removeCard } from "./controllers/card.controller";
import { getCardDetailsSchema, linkCardSchema, removeCardSchema } from "./schemas/index.schema";
const cardRouter = Router();

cardRouter.post("/card/link", validateResource(linkCardSchema), linkCard);

cardRouter.get("/card/details", validateResource(getCardDetailsSchema), getCardDetails);

cardRouter.post("/card/remove", validateResource(removeCardSchema), removeCard);

export default cardRouter;
