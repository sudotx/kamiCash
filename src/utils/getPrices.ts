import axios from 'axios';

export async function getChainlinkPrices() {
    const CHAINLINK_API = 'https://api.chain.link/v1/prices';

    const pairs = [
        'SOL/USD',
        'USDC/USD'
    ];

    const prices = await Promise.all(
        pairs.map(async (pair) => {
            const response = await axios.get(`${CHAINLINK_API}/${pair}`);
            return {
                pair,
                price: response.data.price,
                timestamp: response.data.timestamp
            };
        })
    );

    return prices;
}

export async function getAssetPrice(asset: string) {
    const prices = await getChainlinkPrices();
    return prices.find(p => p.pair.startsWith(asset));
}
