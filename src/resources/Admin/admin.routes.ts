import express from "express";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    assignUserPoints,
    blockUser,
    exportUserData,
    getAllUsers,
    getCurrentAdmin,
    getUserDetails,
    loginAdmin,
    logoutAdmin,
    manageRoles,
    registerAdmin,
    resetUserPassword,
    unblockUser,
} from "./controllers/admin.controller";
import { assignPointsSchema, bulkActionSchema, loginAdminSchema, registerAdminSchema, roleManagementSchema, systemSettingsSchema } from "./schema/admin.schema";

const adminRouter = express.Router();

adminRouter.post(
    "/register",
    validateResource(registerAdminSchema),
    registerAdmin
);

adminRouter.post(
    "/login",
    validateResource(loginAdminSchema),
    loginAdmin
);

adminRouter.post(
    "/logout",
    logoutAdmin
);

adminRouter.get("", requireAuth, getCurrentAdmin);
adminRouter.get("/users", requireAuth, getAllUsers);
adminRouter.get("/users/:userId", requireAuth, getUserDetails);

adminRouter.post("/points", validateResource(assignPointsSchema), assignUserPoints)

// User management
adminRouter.put("/users/:userId/block", requireAuth, blockUser);
adminRouter.post("/users/:userId/unblock", requireAuth, unblockUser);
adminRouter.post("/users/:userId/reset-password", requireAuth, resetUserPassword);


// Reports and exports
adminRouter.post("/export/users", requireAuth, exportUserData);


// System configuration
adminRouter.put("/roles", requireAdmin, validateResource(roleManagementSchema), manageRoles);

export default adminRouter;
