"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liquidation = liquidation;
const CalculateMargin_1 = require("../utils/CalculateMargin");
const PriceStore_1 = require("../utils/PriceStore");
const TradeStore_1 = require("../utils/TradeStore");
const UserBalanceStore_1 = require("../utils/UserBalanceStore");
function liquidation() {
    setInterval(() => {
        const OpenTrades = TradeStore_1.TradeStoreManager.getInstance().getAllOpenTrades();
        for (const [symbol, trades] of OpenTrades) {
            if (trades.length === 0)
                continue;
            const quote = PriceStore_1.PriceStoreManager.getInstance().get(symbol);
            if (!quote)
                continue;
            for (const trade of trades) {
                const { type, quantity, openPrice, leverage, tradeId, userId } = trade;
                const margin = (0, CalculateMargin_1.Calc)(quantity, type, leverage, openPrice);
                const sign = type === "buy" ? 1 : -1;
                const exit = type === "buy" ? quote.askPrice : quote.sellPrice;
                const pnl = sign * (exit - openPrice) * quantity * leverage;
                // Liquidation condition: loss >= 90% of margin
                if (pnl <= -0.9 * margin) {
                    // Close trade
                    TradeStore_1.TradeStoreManager.getInstance().closeTrade(symbol, tradeId, exit);
                    // Update balance
                    const balance = UserBalanceStore_1.User.getInstance().getBalance(userId);
                    const newBalance = balance + margin + pnl;
                    UserBalanceStore_1.User.getInstance().updateBalance(userId, newBalance);
                    console.log(`Liquidated trade ${tradeId} (user ${userId}) at ${exit}, PnL=${pnl}, new balance=${newBalance}`);
                }
            }
        }
    }, 50);
}
