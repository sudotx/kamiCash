type Currency = {
    code: string;
    name: string;
    starter: string;
}

type CurrencyMap = {
    [key: string]: Currency;
}

const CURRENCIES: CurrencyMap = {
    NGN: { code: "NGN", name: "Nigerian Naira", starter: "1" },
    GHS: { code: "GHS", name: "Ghanaian Cedi", starter: "2" },
    XOF: { code: "XOF", name: "West African CFA", starter: "3" },
    USD: { code: "USD", name: "US Dollar", starter: "4" }
};

export default function generateAccountNumber(id: string, currencyCode: keyof typeof CURRENCIES): string {
    const currency = CURRENCIES[currencyCode];
    const dateUnix = Math.floor(Date.now() / 1000);
    return `${currency.starter}${dateUnix}${id}`;
}

export { CURRENCIES, Currency, CurrencyMap };
