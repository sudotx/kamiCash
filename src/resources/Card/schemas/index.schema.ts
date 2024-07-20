import { object, string, TypeOf } from "zod";

export const linkCardSchema = object({
    body: object({
        userId: string({
            required_error: "User ID is required",
        }),
        cardNumber: string({
            required_error: "Card number is required",
        }).length(16, "Card number must be 16 digits"),
        expiryMonth: string({
            required_error: "Expiry month is required",
        }).length(2, "Expiry month must be 2 digits"),
        expiryYear: string({
            required_error: "Expiry year is required",
        }).length(2, "Expiry year must be 2 digits"),
        cvv: string({
            required_error: "CVV is required",
        }).length(3, "CVV must be 3 digits"),
        cardHolderName: string({
            required_error: "Card holder name is required",
        }),
    }),
});

// Schema for getting card details
export const getCardDetailsSchema = object({
    query: object({
        userId: string({
            required_error: "User ID is required",
        }),
    }),
});

// Schema for removing a card
export const removeCardSchema = object({
    body: object({
        userId: string({
            required_error: "User ID is required",
        }),
        cardId: string({
            required_error: "Card ID is required",
        }),
    }),
});

// Types for the validated input
export type LinkCardInput = TypeOf<typeof linkCardSchema>;
export type GetCardDetailsInput = TypeOf<typeof getCardDetailsSchema>;
export type RemoveCardInput = TypeOf<typeof removeCardSchema>;
