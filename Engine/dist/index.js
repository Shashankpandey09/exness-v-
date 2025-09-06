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
const EngineClient = (0, redis_1.createClient)();
let lastProcessedId = '0';
function StartEngine() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield EngineClient.connect();
            console.log("Engine Client connected");
            // EngineClient.subscribe("ticks", (msg) => {
            //   const data = JSON.parse(msg);
            //   console.log(data);
            // });
            console.log(yield EngineClient.xLen("trades"));
            while (true) {
                const streamData = yield EngineClient.xRead({ key: "trades", id: "$" }, { BLOCK: 0, COUNT: 10 });
                console.log(streamData);
                if (streamData && Array.isArray(streamData)) {
                    //iterating through loop
                    for (const stream of streamData) {
                        for (const message of stream.messages) {
                            //need to set type of stream 
                            if (JSON.parse(message.message.data).type === 'price_updates') {
                                const assets = JSON.parse(message.message.data).price_updates;
                                lastProcessedId == message.id;
                                PriceStore_1.PriceStoreManager.getInstance().set(assets);
                            }
                            //type=orderPlacement 
                            //getting the current price 
                            const tradeValues = JSON.parse(message.message.data);
                            //sending the values to for calculating things 
                        }
                    }
                }
            }
            //creating object from reply
            // const result=ParseXrange(reply)
        }
        catch (error) {
            console.error(error);
        }
    });
}
StartEngine();
