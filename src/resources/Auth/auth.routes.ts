import express from "express";
import { requireAdminAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    getLoggedInUserHandler,
    loginHandler,
    logoutHandler,
    registerHandler
} from "./controllers/auth.controller";
import { loginUserSchema, logoutUserSchema, registerUserSchema } from "./schema/auth.schema";

const authRouter = express.Router();

authRouter.route("/admin").get(requireAdminAuth, getLoggedInUserHandler);

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
