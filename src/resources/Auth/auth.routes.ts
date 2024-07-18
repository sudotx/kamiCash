import express from "express";
import validateResource from "../../middlewares/validate-resource";
import {
    verifyAccountHander
} from "./controllers/auth.controller";
import { verifyOtpSchema } from "./schema/auth.schema";

const authRouter = express.Router();

authRouter.post(
    "/register",
    validateResource(verifyOtpSchema),
    verifyAccountHander
);

authRouter.post(
    "/login",
    validateResource(verifyOtpSchema),
    verifyAccountHander
);

authRouter.post(
    "/logout",
    validateResource(verifyOtpSchema),
    verifyAccountHander
);


export default authRouter;
