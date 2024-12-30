import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { internalTransfer } from "./controllers/user.controller";
import { internalTransferSchema } from "./schemas/index.schema";

const transferRouter = Router();

transferRouter.post("/internal", validateResource(internalTransferSchema), requireAuth, internalTransfer);
transferRouter.post("/deposit", validateResource(internalTransferSchema), requireAuth, internalTransfer);
transferRouter.post("/withdrawal", validateResource(internalTransferSchema), requireAuth, internalTransfer);

export default transferRouter;
