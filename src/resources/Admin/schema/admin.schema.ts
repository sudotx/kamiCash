import { TypeOf, object, string } from "zod";

export const registerUserSchema = object({
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

export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: "Email is required",
        }).email("Invalid email format"),
        password: string({
            required_error: "Password is required",
        }),
    }),
});

export const logoutUserSchema = object({
    body: object({
        userId: string({
            required_error: "User ID is required",
        }),
    }),
});

export type RegisterUserInput = TypeOf<typeof registerUserSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type LogoutUserInput = TypeOf<typeof logoutUserSchema>;

