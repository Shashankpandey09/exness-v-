import { createClient } from "redis";
import { PriceStoreManager } from "./utils/PriceStore";
const EngineClient = createClient();

let lastProcessedId='0'
async function StartEngine() {
  try {
    await EngineClient.connect();
    console.log("Engine Client connected");
    // EngineClient.subscribe("ticks", (msg) => {
    //   const data = JSON.parse(msg);
    //   console.log(data);
    // });
    console.log(await EngineClient.xLen("trades"));
    while (true) {
      const streamData = await EngineClient.xRead(
        { key: "trades", id: "$" },
        { BLOCK: 0, COUNT: 10 }
      );
      console.log(streamData)
      if (streamData && Array.isArray(streamData)) {
        //iterating through loop
        for (const stream of streamData) {
          for (const message of stream.messages) {
            //need to set type of stream 
            if(JSON.parse(message.message.data).type==='price_updates'){
            const assets = JSON.parse(message.message.data).price_updates;
            lastProcessedId==message.id
            PriceStoreManager.getInstance().set(assets)
            }
            //type=orderPlacement 
            //getting the current price 
            const tradeValues=JSON.parse(message.message.data)
            //sending the values to for calculating things 
          }
         
        }
      }
    }

    //creating object from reply
    // const result=ParseXrange(reply)
  } catch (error) {
    console.error(error);
  }
}
StartEngine();
