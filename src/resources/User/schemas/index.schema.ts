import { object, string, TypeOf } from "zod";

export const getUserProfileSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
    }),
});

export const getUserBalanceSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
        assetType: string().optional(),
    }),
});

export const getUserTransactionsSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
        startDate: string().optional(),
        endDate: string().optional(),
        limit: string().optional(),
        offset: string().optional(),
    }),
});

export type GetUserProfileInput = TypeOf<typeof getUserProfileSchema>;
export type GetUserBalanceInput = TypeOf<typeof getUserBalanceSchema>;
export type CreateUserInput = TypeOf<typeof getUserTransactionsSchema>;
