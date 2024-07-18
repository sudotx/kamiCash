import { TypeOf, object, string, z } from "zod";

export const loginAdminSessionSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email({
            message: "Please use a valid email",
        }),
        password: string({
            required_error: "Password is required",
        }),
    }),
});

export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Not a valid email"),
        password: string({
            required_error: "Password is required",
        }).min(8, "Password must be more than 8 characters"),
        role: z.enum(["client", "property_owner"], {
            required_error: "Role is required",
        }),
    }),
});

export const verifyOtpSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Not a valid email"),
        code: string({
            required_error: "Code is required",
        }),
    }),
});

export type VerifyUserInput = TypeOf<typeof verifyOtpSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type LoginAdminSessionInput = TypeOf<typeof loginAdminSessionSchema>;
