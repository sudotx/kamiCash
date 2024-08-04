import { Router } from "express";
import validateResource from "../../middlewares/validate-resource";
import { externalTransfer, internalTransfer } from "./controllers/user.controller";
import { internalTransferSchema, withdrawSchema } from "./schemas/index.schema";

const transferRouter = Router();

transferRouter.post("/external", validateResource(withdrawSchema), externalTransfer);

transferRouter.post("/internal", validateResource(internalTransferSchema), internalTransfer);

export default transferRouter;
