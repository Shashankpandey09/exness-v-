"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceStoreManager = void 0;
class PriceStoreManager {
    constructor() {
        this.Prices = new Map();
        this.assetInDb = new Map();
    }
    static getInstance() {
        if (!PriceStoreManager._instance)
            return (PriceStoreManager._instance = new PriceStoreManager());
        return PriceStoreManager._instance;
    }
    set(assets) {
        //iterating through array
        assets.forEach((asset) => {
            //applying spreading of 1 percent
            const askPrice = (asset.price * (1 + 0.01)) / asset.decimals;
            const sellPrice = (asset.price * (1 - 0.01)) / asset.decimals;
            this.Prices.set(asset.asset, {
                symbol: asset.asset,
                askPrice,
                sellPrice,
                decimal: asset.decimals,
            });
        });
    }
    get(symbol) {
        return this.Prices.get(symbol);
    }
    setAsset(symbol, id) {
        if (!this.assetInDb.has(symbol)) {
            this.assetInDb.set(symbol, id);
        }
    }
    getAssetId(symbol) {
        if (this.assetInDb.has(symbol)) {
            return this.assetInDb.get(symbol);
        }
        return null;
    }
}
exports.PriceStoreManager = PriceStoreManager;
