import { Calc } from "../utils/CalculateMargin";
import { PriceStoreManager } from "../utils/PriceStore";
import { TradeStoreManager } from "../utils/TradeStore";
import { User } from "../utils/UserBalanceStore";

export function liquidation() {
  setInterval(() => {
    const OpenTrades = TradeStoreManager.getInstance().getAllOpenTrades();

    for (const [symbol, trades] of OpenTrades) {
      if (trades.length === 0) continue;

      const quote = PriceStoreManager.getInstance().get(symbol);
      if (!quote) continue;

      for (const trade of trades) {
        const { type, quantity, openPrice, leverage, tradeId, userId } = trade;

 
        const margin = Calc(quantity, type, leverage, openPrice);

        const sign = type === "buy" ? 1 : -1;


        const exit = type === "buy" ? quote.askPrice : quote.sellPrice;

        
        const pnl = sign * (exit - openPrice) * quantity * leverage;

        // Liquidation condition: loss >= 90% of margin
        if (pnl <= -0.9 * margin) {
          // Close trade
          TradeStoreManager.getInstance().closeTrade(symbol, tradeId, exit,true);

          // Update balance
          const balance = User.getInstance().getBalance(userId);
          const newBalance = balance + margin + pnl;
          User.getInstance().updateBalance(userId, newBalance);

          console.log(
            `Liquidated trade ${tradeId} (user ${userId}) at ${exit}, PnL=${pnl}, new balance=${newBalance}`
          );
        }
      }
    }
  }, 50); 
}
