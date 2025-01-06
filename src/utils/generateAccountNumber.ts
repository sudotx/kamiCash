const ACCOUNT_CONFIG = {
    MAX_LENGTH: 10,
    MIN_LENGTH: 8,
    TIMESTAMP_LENGTH: 6,
    ID_LENGTH: 4
} as const;

interface CurrencyConfig {
    readonly code: string;
    readonly name: string;
    readonly starter: string;
    readonly prefix: string;
    readonly format?: (accountNumber: string) => string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
    NGN: {
        code: "NGN",
        name: "Nigerian Naira",
        starter: "1",
        prefix: "NG",
        format: (num) => num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    },
    GHS: {
        code: "GHS",
        name: "Ghanaian Cedi",
        starter: "2",
        prefix: "GH",
        format: (num) => num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    },
    XOF: {
        code: "XOF",
        name: "West African CFA",
        starter: "3",
        prefix: "WA"
    },
    USD: {
        code: "USD",
        name: "US Dollar",
        starter: "4",
        prefix: "US"
    }
} as const;

function generateTimestamp(): string {
    return Date.now().toString().slice(-ACCOUNT_CONFIG.TIMESTAMP_LENGTH);
}

function formatAccountNumber(accountNumber: string, currency: CurrencyConfig): string {
    return currency.format ? currency.format(accountNumber) : accountNumber;
}

export function generateAccountNumber(id: string, currencyCode: keyof typeof CURRENCIES): string {
    const currency = CURRENCIES[currencyCode];
    const timestamp = generateTimestamp();
    const uniqueId = id.slice(-ACCOUNT_CONFIG.ID_LENGTH);

    const rawAccountNumber = `${currency.prefix}${currency.starter}${timestamp}${uniqueId}`;
    const accountNumber = rawAccountNumber.slice(0, ACCOUNT_CONFIG.MAX_LENGTH);

    return formatAccountNumber(accountNumber, currency);
}

export { ACCOUNT_CONFIG, CURRENCIES };
export type { CurrencyConfig };
