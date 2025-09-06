"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceStoreManager = void 0;
class PriceStoreManager {
    constructor() {
        this.Prices = new Map();
    }
    static getInstance() {
        if (!PriceStoreManager._instance)
            return PriceStoreManager._instance = new PriceStoreManager();
        return PriceStoreManager._instance;
    }
    set(assets) {
        //iterating through array
        assets.forEach((asset) => {
            //applying spreading of 1 percent
            const askPrice = asset.price * (1 + 0.01);
            const sellPrice = asset.price * (1 - 0.01);
            this.Prices.set(asset.asset, { symbol: asset.asset, askPrice, sellPrice, decimal: asset.decimals });
        });
    }
    get(symbol) {
        return this.Prices.get(symbol);
    }
}
exports.PriceStoreManager = PriceStoreManager;
