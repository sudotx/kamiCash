import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    assignUserPoints,
    getAllUsers,
    getCurrentAdmin,
    getUserDetails,
    loginAdmin,
    logoutAdmin,
    registerAdmin
} from "./controllers/admin.controller";
import { loginUserSchema, logoutUserSchema, registerUserSchema } from "./schema/admin.schema";

const authRouter = express.Router();

authRouter.route("").get(requireAuth, getUserDetails);

authRouter.route("/all").get(requireAuth, getAllUsers);

authRouter.route("/current").get(requireAuth, getCurrentAdmin);

authRouter.post(
    "/register",
    validateResource(registerUserSchema),
    registerAdmin
);

authRouter.post(
    "/login",
    validateResource(loginUserSchema),
    loginAdmin
);

authRouter.post(
    "/logout",
    validateResource(logoutUserSchema),
    logoutAdmin
);

authRouter.post("/points", assignUserPoints)


export default authRouter;
