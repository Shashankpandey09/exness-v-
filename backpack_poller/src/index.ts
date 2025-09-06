import WebSocket from "ws";
import { createClient } from "redis";
import { PollerManager } from "./utils/PollerManager";


type SymbolKey = "BTC_USDC" | "ETH_USDC" | "SOL_USDC_PERP";
const decimals: Record<SymbolKey, number> = {
  BTC_USDC: 1,
  ETH_USDC: 2,
  SOL_USDC_PERP: 2,
};

const Subscribe = [
  { method: "SUBSCRIBE", params: ["bookTicker.BTC_USDC"], id: 1 },
  { method: "SUBSCRIBE", params: ["bookTicker.ETH_USDC"], id: 2 },
  { method: "SUBSCRIBE", params: ["bookTicker.SOL_USDC_PERP"], id: 3 },
];

async function startPoller() {
  const redisClient = createClient();
  await redisClient.connect();

  const ws = new WebSocket("wss://ws.backpack.exchange/");

  ws.on("open", () => {
    console.log("Connected to Backpack Exchange WS");
    Subscribe.forEach((sub) => ws.send(JSON.stringify(sub)));
  });

  ws.on("message", (msg) => {
    const message = JSON.parse(msg.toString());
    if (!message.data) return;

    const sym = message.data.s as SymbolKey;
    const dec = decimals[sym];

    const askPrice = Number(message.data.a);

    const intPrice = Math.round(askPrice * Math.pow(10, dec));

    PollerManager.getInstance().set(sym, intPrice, dec);
  });

  // publish every 100ms
  setInterval(() => {
    const payload = PollerManager.getInstance().get();
    const newPayload = {
      price_updates: payload,
      type:'Price_updates'
    };
    if (payload.length > 0) {
      redisClient.xAdd("trades","*",{'data':JSON.stringify(newPayload)} );
      console.log(" Published:", JSON.stringify(newPayload));
    }
  }, 200);
}

startPoller().catch(console.error);
