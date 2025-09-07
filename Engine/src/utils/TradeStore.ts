type Trade = {
  tradeId: string;
  type: string; // buy/sell
  quantity: number;
  openPrice: number;
  status: string; // open/closed
  leverage: number;
  userId: number;
  closedPrice?:number
};

export class TradeStoreManager {
  private static trade_instance: TradeStoreManager;
  private OpenTrades = new Map<string, Trade[]>();
  private OpenIndex = new Map<string, Set<string>>();
  private CloseTrades = new Map<string, Trade[]>();

  private constructor() {}

  public static getInstance() {
    if (!TradeStoreManager.trade_instance) {
      TradeStoreManager.trade_instance = new TradeStoreManager();
    }
    return TradeStoreManager.trade_instance;
  }

  public addOpenTrade(
    symbol: string,
    tradeId: string,
    type: string,
    quantity: number,
    openPrice: number,
    status: string,
    leverage: number,
    userId: number
  ) {
    const idx = this.OpenIndex.get(symbol) || new Set<string>();
    if (idx.has(tradeId)) {
      return false;
    }
    const trades = this.OpenTrades.get(symbol) || [];
    trades.push({
      tradeId,
      type,
      quantity,
      openPrice,
      status,
      leverage,
      userId,
    });
    this.OpenTrades.set(symbol, trades);
    idx.add(tradeId);
    this.OpenIndex.set(symbol, idx);
  }

  public closeTrade(symbol: string, tradeId: string,closePrice:number) {
    const trades = this.OpenTrades.get(symbol) || [];
    if (trades.length === 0) return false;

    // Find index of the trade
    const index = trades.findIndex((t) => t.tradeId === tradeId);
    if (index === -1) return false; // trade not found

    const [closedTrade] = trades.splice(index, 1);
    this.OpenTrades.set(symbol, trades);
    closedTrade.status = "closed";
    closedTrade.closedPrice=closePrice
    const existingCloseTrades = this.CloseTrades.get(symbol) || [];
    existingCloseTrades.push(closedTrade);
    this.CloseTrades.set(symbol, existingCloseTrades);
    return true
  }

  public getOpenTrades(symbol: string): Trade[] {
    return this.OpenTrades.get(symbol) || [];
  }
  public GetCloseTrades(symbol:string) {
    return this.CloseTrades.get(symbol);
  }
}
