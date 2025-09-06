"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeStoreManager = void 0;
class TradeStoreManager {
    constructor() {
        this.OpenTrades = new Map();
        this.CloseTrades = new Map();
    }
    static getInstance() {
        if (!TradeStoreManager.trade_instance) {
            TradeStoreManager.trade_instance = new TradeStoreManager();
        }
        return TradeStoreManager.trade_instance;
    }
    addOpenTrade(symbol, tradeId, type, margin, openPrice, status, leverage, userId) {
        const trades = this.OpenTrades.get(symbol) || [];
        trades.push({ tradeId, type, margin, openPrice, status, leverage, userId });
        this.OpenTrades.set(symbol, trades);
    }
    closeTrade(symbol, tradeId) {
        const trades = this.OpenTrades.get(symbol) || [];
        if (trades.length === 0)
            return;
        // Find index of the trade
        const index = trades.findIndex((t) => t.tradeId === tradeId);
        if (index === -1)
            return; // trade not found
        // Remove from open trades
        const [closedTrade] = trades.splice(index, 1);
        this.OpenTrades.set(symbol, trades);
        // Add to close trades
        const existingCloseTrades = this.CloseTrades.get(symbol) || [];
        existingCloseTrades.push(closedTrade);
        this.CloseTrades.set(symbol, existingCloseTrades);
    }
    getTrades(symbol) {
        return this.OpenTrades.get(symbol) || [];
    }
    GetOpenTrades() {
        return this.OpenTrades;
    }
}
exports.TradeStoreManager = TradeStoreManager;
