import { number, object, string, TypeOf, z } from "zod";

export const assetTypeEnum = z.enum(["USDC"]);
export const userTypeEnum = z.enum(["USER", "ADMIN"]);

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
        role: userTypeEnum,
    }),
});

export const withdrawSchema = object({
    body: object({
        fromUserId: string({
            required_error: "Sender user ID is required",
        }),
        toAddress: string({
            required_error: "Recipient Solana address is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});

export const internalTransferSchema = object({
    body: object({
        from: string({
            required_error: "Sender user ID is required",
        }),
        to: string({
            required_error: "Recipient user ID is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});
export const refundSchema = object({
    body: object({
        from: string({
            required_error: "Sender user ID is required",
        }),
        to: string({
            required_error: "Recipient user ID is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});
export const disputeSchema = object({
    body: object({
        from: string({
            required_error: "Sender user ID is required",
        }),
        to: string({
            required_error: "Recipient user ID is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});
export const exportSchema = object({
    body: object({
        from: string({
            required_error: "Sender user ID is required",
        }),
        to: string({
            required_error: "Recipient user ID is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});
export const scheduleTransactionSchema = object({
    body: object({
        from: string({
            required_error: "Sender user ID is required",
        }),
        to: string({
            required_error: "Recipient user ID is required",
        }),
        amount: number({
            required_error: "Transfer amount is required",
        }).positive("Amount must be positive"),
        assetType: assetTypeEnum,
        memo: string().optional(),
    }),
});

export type WithdrawInput = TypeOf<typeof withdrawSchema>;
export type InternalTransferInput = TypeOf<typeof internalTransferSchema>;