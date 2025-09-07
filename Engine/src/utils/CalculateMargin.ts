import { TradeStoreManager } from "./TradeStore";

export const Calc = (
  quantity: number,
  type: string,
  leverage: number,
  openPrice: number
) => {
  const notional = quantity * openPrice;
  const margin = notional / leverage;
  return margin;
};

export const calculatePnl = (
  type: string,
  balance: number,
  tradeId: string,
  userId: number,
  symbol: string
) => {

  const closedTrades = TradeStoreManager.getInstance().GetCloseTrades(symbol);
  const trade = closedTrades?.find(
    (t) => t.tradeId === tradeId && t.userId === userId
  );

  if (!trade || trade.closedPrice === undefined) {
    console.warn("Trade not found or no closedPrice set");
    return null;
  }

  const { openPrice, closedPrice, quantity, leverage } = trade;


  const pnl =
    type === "buy"
      ? (closedPrice - openPrice) * quantity * leverage
      : (openPrice - closedPrice) * quantity * leverage;

  const margin = Calc(quantity, type, leverage, openPrice);

  const newBalance = balance + margin + pnl;

  return { pnl, newBalance };
};
