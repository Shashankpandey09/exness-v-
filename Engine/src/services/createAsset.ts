import { PriceStoreManager } from "../utils/PriceStore";
import { prisma } from "../utils/prisma";

export async function insertAsset(symbol:string){
   //getting id 
   try {
      const asset=await prisma.asset.create({
        data:{
            symbol:symbol
        },
        select:{id:true}
      })
    PriceStoreManager.getInstance().setAsset(symbol,asset.id)
   } catch (error) {
    console.error('error while inserting symbol',error)
   }

}