import { object, string, TypeOf } from "zod";

export const createAccountSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
    }),
    body: object({
        currencyCode: string({
            required_error: "Currency Code is required"
        })
    })
});

export const getVirtualAccountSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
    }),
});

export type CreateVirtualAccountInput = TypeOf<typeof createAccountSchema>;
export type GetVirtualAccountsInput = TypeOf<typeof getVirtualAccountSchema>;
