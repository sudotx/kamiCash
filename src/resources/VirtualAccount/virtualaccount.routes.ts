import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import { createVirtualAccount, getAllVirtualAccounts } from "./controllers/va.controller";
import { createAccountSchema, getVirtualAccountSchema } from "./schemas/index.schema";

const virtualAccountRouter = Router();

virtualAccountRouter.get("/create", requireAuth, validateResource(createAccountSchema), createVirtualAccount);
virtualAccountRouter.get("/get", requireAuth, validateResource(getVirtualAccountSchema), getAllVirtualAccounts);

export default virtualAccountRouter;
