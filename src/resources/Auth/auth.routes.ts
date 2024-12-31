import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    assignUserPoints,
    getLoggedInUserHandler,
    loginHandler,
    logoutHandler,
    registerHandler
} from "./controllers/auth.controller";
import { loginUserSchema, logoutUserSchema, registerUserSchema } from "./schema/auth.schema";

const authRouter = express.Router();

authRouter.route("").get(requireAuth, getLoggedInUserHandler);

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

authRouter.post("/points", assignUserPoints)


export default authRouter;
