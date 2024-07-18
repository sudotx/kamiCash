import { Router } from "express";
import { createUserHandler } from "./controllers/user.controller";
import validateResource from "../../middlewares/validate-resource";
import { createUserSchema } from "./schemas/index.schema";
const userRouter = Router();


userRouter.post("/transfers/external", validateResource(createUserSchema), createUserHandler);

userRouter.post("/transfers/internal", validateResource(createUserSchema), createUserHandler);


export default userRouter;
