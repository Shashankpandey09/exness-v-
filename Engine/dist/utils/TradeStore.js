"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeStoreManager = void 0;
const ProcessedID_1 = require("./ProcessedID");
class TradeStoreManager {
    constructor() {
        this.OpenTrades = new Map();
        this.OpenIndex = new Map();
        this.CloseTrades = new Map();
    }
    static getInstance() {
        if (!TradeStoreManager.trade_instance) {
            TradeStoreManager.trade_instance = new TradeStoreManager();
        }
        return TradeStoreManager.trade_instance;
    }
    addOpenTrade(symbol, tradeId, type, quantity, openPrice, status, leverage, userId) {
        const idx = this.OpenIndex.get(symbol) || new Set();
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
    closeTrade(symbol, tradeId, closePrice) {
        const trades = this.OpenTrades.get(symbol) || [];
        if (trades.length === 0)
            return false;
        // Find index of the trade
        const index = trades.findIndex((t) => t.tradeId === tradeId);
        if (index === -1)
            return false; // trade not found
        const [closedTrade] = trades.splice(index, 1);
        this.OpenTrades.set(symbol, trades);
        closedTrade.status = "closed";
        closedTrade.closedPrice = closePrice;
        closedTrade.streamId = ProcessedID_1.lastProcessedId.getInstance().getLastProcessedId();
        const existingCloseTrades = this.CloseTrades.get(symbol) || [];
        existingCloseTrades.push(closedTrade);
        this.CloseTrades.set(symbol, existingCloseTrades);
        return true;
    }
    getOpenTrades(symbol) {
        return this.OpenTrades.get(symbol) || [];
    }
    GetCloseTrades(symbol) {
        return this.CloseTrades.get(symbol);
    }
    getAllOpenTrades() {
        return [...this.OpenTrades.entries()];
    }
    GetAllCloseTrades() {
        return [...this.CloseTrades.entries()];
    }
}
exports.TradeStoreManager = TradeStoreManager;
