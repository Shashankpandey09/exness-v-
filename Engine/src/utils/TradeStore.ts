type Trade = {
  tradeId: string;
  type: string; // buy/sell
  margin: number;
  openPrice: number;
  status: string; // open/closed
  leverage:number;
  userId:number
};

export class TradeStoreManager {
  private static trade_instance: TradeStoreManager;
  private OpenTrades = new Map<string, Trade[]>();
  private CloseTrades=new Map<string,Trade[]>()

  private constructor() {}

  public static getInstance() {
    if (!TradeStoreManager.trade_instance) {
      TradeStoreManager.trade_instance = new TradeStoreManager();
    }
    return TradeStoreManager.trade_instance;
  }

  public addOpenTrade(symbol: string, tradeId: string, type: string, margin: number, openPrice: number, status: string,leverage:number,userId:number) {
    const trades = this.OpenTrades.get(symbol) || [];
    trades.push({ tradeId, type, margin, openPrice, status,leverage,userId });
    this.OpenTrades.set(symbol, trades);
  }

 public closeTrade(symbol: string, tradeId: string) {
  const trades = this.OpenTrades.get(symbol) || [];
  if (trades.length === 0) return;

  // Find index of the trade
  const index = trades.findIndex((t) => t.tradeId === tradeId);
  if (index === -1) return; // trade not found

  // Remove from open trades
  const [closedTrade] = trades.splice(index, 1);
  this.OpenTrades.set(symbol, trades);

  // Add to close trades
  const existingCloseTrades = this.CloseTrades.get(symbol) || [];
  existingCloseTrades.push(closedTrade);
  this.CloseTrades.set(symbol, existingCloseTrades);
}


  public getTrades(symbol: string): Trade[] {
    return this.OpenTrades.get(symbol) || [];
  }
  public GetOpenTrades(){
    return this.OpenTrades
  }
}
