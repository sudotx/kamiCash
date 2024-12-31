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
import { assignPointsSchema, loginAdminSchema, registerAdminSchema } from "./schema/admin.schema";

const authRouter = express.Router();

authRouter.route("").get(requireAuth, getUserDetails);

authRouter.route("/all").get(requireAuth, getAllUsers);

authRouter.route("/current").get(requireAuth, getCurrentAdmin);

authRouter.post(
    "/register",
    validateResource(registerAdminSchema),
    registerAdmin
);

authRouter.post(
    "/login",
    validateResource(loginAdminSchema),
    loginAdmin
);

authRouter.post(
    "/logout",
    logoutAdmin
);

authRouter.post("/points", validateResource(assignPointsSchema), assignUserPoints)


export default authRouter;
