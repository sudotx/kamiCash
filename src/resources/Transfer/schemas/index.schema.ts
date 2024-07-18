import { object, string, TypeOf, z } from "zod";

export const createUserSchema = object({
    body: object({
        firstName: string({
            required_error: "First Name is required",
        }),
        lastName: string({
            required_error: "Last Name is required",
        }),
        phoneNumber: string({
            required_error: "Phone number is required",
        }),
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

export type CreateUserInput = TypeOf<typeof createUserSchema>;
