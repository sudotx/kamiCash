export type AccountStatusType = "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";

export interface JwtPayload {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    account_status: AccountStatusType;
    avatar: string | null;
    created_at: Date;
    updated_at: Date;
    last_login: Date | null;
}
