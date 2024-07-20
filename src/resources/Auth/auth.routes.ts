import express from "express";
import validateResource from "../../middlewares/validate-resource";
import {
    loginHandler,
    logoutHandler,
    registerHandler
} from "./controllers/auth.controller";
import { loginUserSchema, logoutUserSchema, registerUserSchema } from "./schema/auth.schema";

const authRouter = express.Router();

authRouter.post(
    "/register",
    validateResource(registerUserSchema),
    registerHandler
);

authRouter.post(
    "/login",
    validateResource(loginUserSchema),
    loginHandler
);

authRouter.post(
    "/logout",
    validateResource(logoutUserSchema),
    logoutHandler
);


export default authRouter;
