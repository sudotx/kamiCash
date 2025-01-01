import { TypeOf, number, object, string } from "zod";

export const registerAdminSchema = object({
    body: object({
        firstName: string({
            required_error: "First name is required",
        }),
        lastName: string({
            required_error: "Last name is required",
        }),
        email: string({
            required_error: "Email is required",
        }).email("Invalid email format"),
        password: string({
            required_error: "Password is required",
        }).min(8, "Password must be at least 8 characters long"),
        phoneNumber: string({
            required_error: "Phone number is required",
        }),
    }),
});

export const loginAdminSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Invalid email format"),
        password: string({
            required_error: "Password is required",
        }),
    }),
});

export const assignPointsSchema = object({
    body: object({
        userId: string({
            required_error: "User Id is required",
        }),
        points: number({
            required_error: "Points is required",
        }),
    }),
});
export const systemSettingsSchema = object({
    body: object({
        userId: string({
            required_error: "User Id is required",
        }),
        points: number({
            required_error: "Points is required",
        }),
    }),
});
export const roleManagementSchema = object({
    body: object({
        userId: string({
            required_error: "User Id is required",
        }),
        points: number({
            required_error: "Points is required",
        }),
    }),
});
export const bulkActionSchema = object({
    body: object({
        userId: string({
            required_error: "User Id is required",
        }),
        points: number({
            required_error: "Points is required",
        }),
    }),
});

export type RegisterAdminInput = TypeOf<typeof registerAdminSchema>;
export type LoginUserInput = TypeOf<typeof loginAdminSchema>;
export type AssignPointsInput = TypeOf<typeof assignPointsSchema>;

