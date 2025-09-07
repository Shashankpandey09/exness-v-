import { createClient } from "redis";
import { PriceStoreManager } from "./utils/PriceStore";
import { TradeStoreManager } from "./utils/TradeStore";
import { User } from "./utils/UserBalanceStore";
import { Calc, calculatePnl } from "./utils/CalculateMargin";

const EngineClient = createClient();
let lastProcessedId = "0-0";

// --- Utility: parse message safely ---
function parseMessage(msg: any) {
  try {
    return JSON.parse(msg.message.data);
  } catch (e) {
    console.error("Invalid JSON:", e);
    return null;
  }
}

// --- Handler: price updates ---
function handlePriceUpdate(data: any) {
  if (!data.price_updates) return;
  PriceStoreManager.getInstance().set(data.price_updates);
}

// --- Handler: open order ---
function handleOpenOrder(data: any, id: string) {
  const { symbol, tradeId, type, quantity, userId, leverage } = data.payload;
  const currentPrice = PriceStoreManager.getInstance().get(symbol);
  if (!currentPrice) {
    console.log(`No price for symbol ${symbol}`);
    return;
  }

  const openPrice =
    type === "buy" ? currentPrice.askPrice : currentPrice.sellPrice;

  const balance = User.getInstance().getBalance(userId);
  const margin = Calc(quantity, type, leverage, openPrice);

  if (balance < margin) {
    console.log("Insufficient balance for", tradeId);
    return;
  }

  TradeStoreManager.getInstance().addOpenTrade(
    symbol,
    tradeId,
    type,
    quantity,
    openPrice,
    "open",
    leverage,
    userId
  );

  User.getInstance().updateBalance(userId, balance - margin);
}

// --- Handler: close order ---
function handleCloseOrder(data: any, id: string) {
  const { symbol, tradeId, userId, type } = data.payload;
  const currentPrice = PriceStoreManager.getInstance().get(symbol);
  if (!currentPrice) {
    console.log(`No price for symbol ${symbol}`);
    return;
  }

  const closePrice =
    type === "buy" ? currentPrice.sellPrice : currentPrice.askPrice;

  TradeStoreManager.getInstance().closeTrade(symbol, tradeId, closePrice);

  const balance = User.getInstance().getBalance(userId);
  const result = calculatePnl(type, balance, tradeId, userId, symbol);

  if (result) {
    const { pnl, newBalance } = result;
    console.log(`Trade ${tradeId} closed. PnL = ${pnl}`);
    User.getInstance().updateBalance(userId, newBalance);
  }
}

// --- Dispatcher ---
function handleMessage(data: any, id: string) {
  if (!data?.type) return;

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
async function StartEngine() {
  try {
    await EngineClient.connect();
    console.log("Engine Client connected");
    console.log("trades length:", await EngineClient.xLen("trades"));

    while (true) {
      const streamData = await EngineClient.xRead(
        { key: "trades", id: lastProcessedId },
        { BLOCK: 0, COUNT: 10 }
      );

      if (!streamData) continue;

      for (const stream of streamData) {
        for (const message of stream.messages) {
          const id = message.id;
          const data = parseMessage(message);
          if (!data) {
            lastProcessedId = id;
            continue;
          }

          handleMessage(data, id);
          lastProcessedId = id; // advance pointer
        }
      }
    }
  } catch (error) {
    console.error("Engine error:", error);
  }
}

StartEngine();
