const ACCOUNT_NUMBER_MAX_LENGTH = 10;

type Currency = {
    code: string;
    name: string;
    starter: string;
    prefix?: string;
}

type CurrencyMap = Record<string, Currency>;

export const CURRENCIES: CurrencyMap = {
    NGN: {
        code: "NGN",
        name: "Nigerian Naira",
        starter: "1",
        prefix: "NG"
    },
    GHS: {
        code: "GHS",
        name: "Ghanaian Cedi",
        starter: "2",
        prefix: "GH"
    },
    CFA: {
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
};

export function generateAccountNumber(id: string, currencyCode: keyof typeof CURRENCIES): string {
    const currency = CURRENCIES[currencyCode];
    const timestamp = Date.now().toString().slice(-6);
    const uniqueId = id.slice(-4);
    const accountNumber = `${currency.prefix}${currency.starter}${timestamp}${uniqueId}`;

    return accountNumber.slice(0, ACCOUNT_NUMBER_MAX_LENGTH);
}

export { ACCOUNT_NUMBER_MAX_LENGTH };
export type { Currency, CurrencyMap };
