import { lastProcessedId } from "./ProcessedID";

export type Trade = {
  tradeId: string;
  type: "buy" | "sell";
  quantity: number;
  openPrice: number;
  status: "open" | "closed";
  leverage: number;
  userId: number;
  closedPrice?: number;
  streamId?: string;
  symbol: string;
  pnl?: number;
  margin?: number;
  liquidated?: boolean;
};

export class TradeStoreManager {
  private static instance: TradeStoreManager;
  private openTrades = new Map<string, Trade[]>();
  private openIndex = new Map<string, Set<string>>();
  private closedTrades = new Map<string, Trade[]>();

  private constructor() {}

  public static getInstance(): TradeStoreManager {
    if (!TradeStoreManager.instance) {
      TradeStoreManager.instance = new TradeStoreManager();
    }
    return TradeStoreManager.instance;
  }

  public addOpenTrade(
    symbol: string,
    tradeId: string,
    type: "buy" | "sell",
    quantity: number,
    openPrice: number,
    leverage: number,
    userId: number
  ): boolean {
    const idx = this.openIndex.get(symbol) || new Set<string>();
    if (idx.has(tradeId)) return false;

    const trades = this.openTrades.get(symbol) || [];
    const trade: Trade = {
      tradeId,
      type,
      quantity,
      openPrice,
      status: "open",
      leverage,
      userId,
      symbol,
    };

    trades.push(trade);
    this.openTrades.set(symbol, trades);

    idx.add(tradeId);
    this.openIndex.set(symbol, idx);

    return true;
  }

  public closeTrade(
    symbol: string,
    tradeId: string,
    closedPrice: number,
    liquidated: boolean = false
  ): boolean {
    const trades = this.openTrades.get(symbol) || [];
    if (trades.length === 0) return false;

    const index = trades.findIndex((t) => t.tradeId === tradeId);
    if (index === -1) return false;

    const [trade] = trades.splice(index, 1);
    // update open store
    this.openTrades.set(symbol, trades);

    // mark closed
    trade.status = "closed";
    trade.closedPrice = closedPrice;
    trade.streamId = lastProcessedId.getInstance().getLastProcessedId();
    trade.symbol = symbol;
    trade.liquidated = liquidated;

    // compute pnl & margin
    const notional = trade.quantity * trade.openPrice;
    const margin = notional / trade.leverage;
    const pnl =
      trade.type === "buy"
        ? (closedPrice - trade.openPrice) * trade.quantity * trade.leverage
        : (trade.openPrice - closedPrice) * trade.quantity * trade.leverage;

    trade.pnl = pnl;
    trade.margin = margin;

    // push to closed store
    const closed = this.closedTrades.get(symbol) || [];
    closed.push(trade);
    this.closedTrades.set(symbol, closed);

    // update index
    const idx = this.openIndex.get(symbol);
    if (idx) {
      idx.delete(tradeId);
      if (idx.size === 0) this.openIndex.delete(symbol);
      else this.openIndex.set(symbol, idx);
    }

    return true;
  }

  public getOpenTrades(symbol: string): Trade[] {
    return this.openTrades.get(symbol) || [];
  }

  public getClosedTrades(symbol: string): Trade[] {
    return this.closedTrades.get(symbol) || [];
  }

  public getAllOpenTrades(): [string, Trade[]][] {
    return [...this.openTrades.entries()];
  }

  public getAllClosedTrades(): [string, Trade[]][] {
    return [...this.closedTrades.entries()];
  }
}
