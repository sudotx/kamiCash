import { Router } from "express";
import { createUserHandler } from "../Transfer/controllers/user.controller";
import validateResource from "../../middlewares/validate-resource";
import { createUserSchema } from "../Transfer/schemas/index.schema";
const userRouter = Router();

userRouter.post("/card/link", validateResource(createUserSchema), createUserHandler);

userRouter.get("/card/details", validateResource(createUserSchema), createUserHandler);

userRouter.post("/card/remove", validateResource(createUserSchema), createUserHandler);

export default userRouter;
