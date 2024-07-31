import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { externalTransfer, internalTransfer } from "./controllers/user.controller";
import { externalTransferSchema, internalTransferSchema } from "./schemas/index.schema";

const transferRouter = Router();

transferRouter.post("/external", validateResource(externalTransferSchema), externalTransfer);

transferRouter.post("/internal", validateResource(internalTransferSchema), internalTransfer);

export default transferRouter;
