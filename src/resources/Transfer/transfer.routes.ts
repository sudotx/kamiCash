import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { externalTransfer, internalTransfer } from "./controllers/user.controller";
import { externalTransferSchema, internalTransferSchema } from "./schemas/index.schema";

const transferRouter = Router();

transferRouter.post("/transfers/external", validateResource(externalTransferSchema), externalTransfer);

transferRouter.post("/transfers/internal", validateResource(internalTransferSchema), internalTransfer);

export default transferRouter;
