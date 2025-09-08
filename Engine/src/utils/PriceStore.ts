interface assetData {
  asset: string;
  price: number;
  decimals: number;
}
interface assetMapType {
  symbol: string;
  askPrice: number;
  sellPrice: number;
  decimal: number;
}
export class PriceStoreManager {
  private static _instance: PriceStoreManager;
  private Prices = new Map<string, assetMapType>();
  private assetInDb = new Map<string, string>();

  private constructor() {}
  public static getInstance(): PriceStoreManager {
    if (!PriceStoreManager._instance)
      return (PriceStoreManager._instance = new PriceStoreManager());
    return PriceStoreManager._instance;
  }
  public set(assets: assetData[]) {
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
  public get(symbol: string) {
    return this.Prices.get(symbol);
  }
  public setAsset(symbol: string, id: string) {
    if (!this.assetInDb.has(symbol)) {
      this.assetInDb.set(symbol, id);
    }
  }
  public getAssetId(symbol: string) {
    if (this.assetInDb.has(symbol)) {
      return this.assetInDb.get(symbol);
    }
    return null;
  }
}
