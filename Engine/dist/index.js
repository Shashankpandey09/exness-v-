"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const PriceStore_1 = require("./utils/PriceStore");
const TradeStore_1 = require("./utils/TradeStore");
const UserBalanceStore_1 = require("./utils/UserBalanceStore");
const CalculateMargin_1 = require("./utils/CalculateMargin");
const ProcessedID_1 = require("./utils/ProcessedID");
const EngineClient = (0, redis_1.createClient)();
let lastProcessedid = ProcessedID_1.lastProcessedId.getInstance().getLastProcessedId();
// --- Utility: parse message safely ---
function parseMessage(msg) {
    try {
        return JSON.parse(msg.message.data);
    }
    catch (e) {
        console.error("Invalid JSON:", e);
        return null;
    }
}
// --- Handler: price updates ---
function handlePriceUpdate(data) {
    if (!data.price_updates)
        return;
    PriceStore_1.PriceStoreManager.getInstance().set(data.price_updates);
}
// --- Handler: open order ---
function handleOpenOrder(data, id) {
    const { symbol, tradeId, type, quantity, userId, leverage } = data.payload;
    const currentPrice = PriceStore_1.PriceStoreManager.getInstance().get(symbol);
    if (!currentPrice) {
        console.log(`No price for symbol ${symbol}`);
        return;
    }
    const openPrice = type === "buy" ? currentPrice.askPrice : currentPrice.sellPrice;
    const balance = UserBalanceStore_1.User.getInstance().getBalance(userId);
    const margin = (0, CalculateMargin_1.Calc)(quantity, type, leverage, openPrice);
    if (balance < margin) {
        console.log("Insufficient balance for", tradeId);
        return;
    }
    TradeStore_1.TradeStoreManager.getInstance().addOpenTrade(symbol, tradeId, type, quantity, openPrice, "open", leverage, userId);
    UserBalanceStore_1.User.getInstance().updateBalance(userId, balance - margin);
}
// --- Handler: close order ---
function handleCloseOrder(data, id) {
    const { symbol, tradeId, userId, type } = data.payload;
    const currentPrice = PriceStore_1.PriceStoreManager.getInstance().get(symbol);
    if (!currentPrice) {
        console.log(`No price for symbol ${symbol}`);
        return;
    }
    const closePrice = type === "buy" ? currentPrice.sellPrice : currentPrice.askPrice;
    TradeStore_1.TradeStoreManager.getInstance().closeTrade(symbol, tradeId, closePrice);
    const balance = UserBalanceStore_1.User.getInstance().getBalance(userId);
    const result = (0, CalculateMargin_1.calculatePnl)(type, balance, tradeId, userId, symbol);
    if (result) {
        const { pnl, newBalance } = result;
        console.log(`Trade ${tradeId} closed. PnL = ${pnl}`);
        UserBalanceStore_1.User.getInstance().updateBalance(userId, newBalance);
    }
}
// --- Dispatcher ---
function handleMessage(data, id) {
    if (!(data === null || data === void 0 ? void 0 : data.type))
        return;
    switch (data.type) {
        case "price_updates":
            handlePriceUpdate(data);
            break;
        case "open_ORDER":
            handleOpenOrder(data, id);
            break;
        case "close_ORDER":
            handleCloseOrder(data, id);
            break;
        default:
            console.warn("Unknown message type:", data.type);
    }
}
// --- Main loop ---
function StartEngine() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield EngineClient.connect();
            console.log("Engine Client connected");
            console.log("trades length:", yield EngineClient.xLen("trades"));
            while (true) {
                const streamData = yield EngineClient.xRead({ key: "trades", id: lastProcessedid }, { BLOCK: 0, COUNT: 10 });
                if (!streamData)
                    continue;
                for (const stream of streamData) {
                    for (const message of stream.messages) {
                        console.log(message);
                        const id = message.id;
                        const data = parseMessage(message);
                        if (!data) {
                            lastProcessedid = id;
                            ProcessedID_1.lastProcessedId.getInstance().setLastProcessedId(lastProcessedid);
                            continue;
                        }
                        handleMessage(data, id);
                        lastProcessedid = id; // advance pointer
                        ProcessedID_1.lastProcessedId.getInstance().setLastProcessedId(lastProcessedid);
                        console.log('done');
                    }
                }
            }
        }
        catch (error) {
            console.error("Engine error:", error);
        }
    });
}
StartEngine();
