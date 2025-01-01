import express from "express";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";
import validateResource from "../../middlewares/validate-resource";
import {
    approveKYC,
    assignUserPoints,
    blockUser,
    exportUserData,
    getAdminLogs,
    getAllUsers,
    getAuditLogs,
    getBulkOperations,
    getCurrentAdmin,
    getKYCRequests,
    getSystemMetrics,
    getSystemSettings,
    getTransactionReports,
    getUserDetails,
    loginAdmin,
    logoutAdmin,
    manageRoles,
    performBulkAction,
    registerAdmin,
    rejectKYC,
    resetUserPassword,
    unblockUser,
    updateSystemSettings,
    updateUserStatus
} from "./controllers/admin.controller";
import { assignPointsSchema, bulkActionSchema, loginAdminSchema, registerAdminSchema, roleManagementSchema, systemSettingsSchema } from "./schema/admin.schema";

const adminRouter = express.Router();

adminRouter.route("/").get(requireAuth, getUserDetails);

adminRouter.route("/all").get(requireAuth, getAllUsers);

adminRouter.route("/current").get(requireAuth, getCurrentAdmin);

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

adminRouter.post("/points", validateResource(assignPointsSchema), assignUserPoints)

// User management
adminRouter.post("/users/:userId/block", requireAuth, blockUser);
adminRouter.post("/users/:userId/unblock", requireAuth, unblockUser);
adminRouter.put("/users/:userId/status", requireAuth, updateUserStatus);
adminRouter.post("/users/:userId/reset-password", requireAuth, resetUserPassword);

// System monitoring
adminRouter.get("/metrics", requireAuth, getSystemMetrics);
adminRouter.get("/audit-logs", requireAuth, getAuditLogs);
adminRouter.get("/admin-logs", requireAuth, getAdminLogs);

// Reports and exports
adminRouter.get("/reports/transactions", requireAuth, getTransactionReports);
adminRouter.post("/export/users", requireAuth, exportUserData);

// KYC management
adminRouter.get("/kyc/requests", requireAuth, getKYCRequests);
adminRouter.post("/kyc/:userId/approve", requireAuth, approveKYC);
adminRouter.post("/kyc/:userId/reject", requireAuth, rejectKYC);

// System configuration
adminRouter.get("/settings", requireAdmin, getSystemSettings);
adminRouter.put("/settings", requireAdmin, validateResource(systemSettingsSchema), updateSystemSettings);
adminRouter.put("/roles", requireAdmin, validateResource(roleManagementSchema), manageRoles);

// Bulk operations
adminRouter.get("/bulk-operations", requireAuth, getBulkOperations);
adminRouter.post("/bulk-action", requireAuth, validateResource(bulkActionSchema), performBulkAction);


export default adminRouter;
