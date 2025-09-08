"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePnl = exports.Calc = void 0;
const TradeStore_1 = require("./TradeStore");
const Calc = (quantity, type, leverage, openPrice) => {
    const notional = quantity * openPrice;
    const margin = notional / leverage;
    return margin;
};
exports.Calc = Calc;
const calculatePnl = (type, balance, tradeId, userId, symbol) => {
    const closedTrades = TradeStore_1.TradeStoreManager.getInstance().GetCloseTrades(symbol);
    const trade = closedTrades === null || closedTrades === void 0 ? void 0 : closedTrades.find((t) => t.tradeId === tradeId && t.userId === userId);
    if (!trade || trade.closedPrice === undefined) {
        console.warn("Trade not found or no closedPrice set");
        return null;
    }
    const { openPrice, closedPrice, quantity, leverage } = trade;
    const pnl = type === "buy"
        ? (closedPrice - openPrice) * quantity * leverage
        : (openPrice - closedPrice) * quantity * leverage;
    const margin = (0, exports.Calc)(quantity, type, leverage, openPrice);
    const newBalance = balance + margin + pnl;
    return { pnl, newBalance };
};
exports.calculatePnl = calculatePnl;
