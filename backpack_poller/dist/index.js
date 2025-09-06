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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const redis_1 = require("redis");
const PollerManager_1 = require("./utils/PollerManager");
const decimals = {
    BTC_USDC: 1,
    ETH_USDC: 2,
    SOL_USDC_PERP: 2,
};
const Subscribe = [
    { method: "SUBSCRIBE", params: ["bookTicker.BTC_USDC"], id: 1 },
    { method: "SUBSCRIBE", params: ["bookTicker.ETH_USDC"], id: 2 },
    { method: "SUBSCRIBE", params: ["bookTicker.SOL_USDC_PERP"], id: 3 },
];
function startPoller() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisClient = (0, redis_1.createClient)();
        yield redisClient.connect();
        const ws = new ws_1.default("wss://ws.backpack.exchange/");
        ws.on("open", () => {
            console.log("Connected to Backpack Exchange WS");
            Subscribe.forEach((sub) => ws.send(JSON.stringify(sub)));
        });
        ws.on("message", (msg) => {
            const message = JSON.parse(msg.toString());
            if (!message.data)
                return;
            const sym = message.data.s;
            const dec = decimals[sym];
            const askPrice = Number(message.data.a);
            const intPrice = Math.round(askPrice * Math.pow(10, dec));
            PollerManager_1.PollerManager.getInstance().set(sym, intPrice, dec);
        });
        // publish every 100ms
        setInterval(() => {
            const payload = PollerManager_1.PollerManager.getInstance().get();
            const newPayload = {
                price_updates: payload,
                type: 'Price_updates'
            };
            if (payload.length > 0) {
                redisClient.xAdd("trades", "*", { 'data': JSON.stringify(newPayload) });
                console.log(" Published:", JSON.stringify(newPayload));
            }
        }, 200);
    });
}
startPoller().catch(console.error);
