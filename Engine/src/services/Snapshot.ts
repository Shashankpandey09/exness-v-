import { PriceStoreManager } from "../utils/PriceStore";
import { prisma } from "../utils/prisma";
import { TradeStoreManager } from "../utils/TradeStore";
import { lastProcessedId } from "../utils/ProcessedID";
import type { Trade } from "../utils/TradeStore";

const CHUNK = 1000;

function compareStreamIds(a?: string | null, b?: string | null): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const [aTime, aSeq] = a.split("-").map((v) => Number(v || 0));
  const [bTime, bSeq] = b.split("-").map((v) => Number(v || 0));

  if (aTime > bTime) return 1;
  if (aTime < bTime) return -1;
  if (aSeq > bSeq) return 1;
  if (aSeq < bSeq) return -1;
  return 0;
}
function getHighestStreamId(batch: Trade[]): string {
  return batch.reduce((max, t) => {
    if (!t.streamId) return max;
    return compareStreamIds(t.streamId, max) > 0 ? t.streamId! : max;
  }, "0-0");
}

export async function snapshots() {
  const closedTrades = TradeStoreManager.getInstance().getAllClosedTrades(); // <- matches TradeStore.ts

  for (const [symbol, trades] of closedTrades) {
  
    while (trades.length > 0) {
      const batch = trades.splice(0, CHUNK);
      if (batch.length === 0) break;

      const assetId =
        PriceStoreManager.getInstance().getAssetId(symbol) ?? null;

  
      const payload = batch.map((t: Trade) => ({
        id: t.tradeId,
        symbol: t.symbol ?? symbol,
        openPrice: String(t.openPrice),
        closePrice: String(t.closedPrice ?? 0),
        leverage: t.leverage,
        pnl: String(t.pnl ?? 0),
        streamId: t.streamId ?? "0-0",
        userId: t.userId,
        assetId: assetId ?? "",
        liquidated: false,
      }));

      try {
        await prisma.existingTrade.createMany({
          data: payload,
          skipDuplicates: true,
        });

        const highest = getHighestStreamId(batch);
        if (highest && highest !== "0-0") {
          lastProcessedId.getInstance().setLastProcessedId(highest);
        }

        console.log(
          `Flushed ${batch.length} trades for ${symbol}, up to ${highest}`
        );
      } catch (err) {
        console.error(`Error persisting batch for ${symbol}:`, err);
        // put the batch back at the front so next run retries 
        trades.unshift(...batch);
     
        break;
      }
    }
  }
}
