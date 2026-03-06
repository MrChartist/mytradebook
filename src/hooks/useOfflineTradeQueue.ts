import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { TradeInsert } from "@/hooks/useTrades";

const QUEUE_KEY = "tb_offline_trade_queue";

function getQueue(): TradeInsert[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setQueue(q: TradeInsert[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function useOfflineTradeQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(() => getQueue().length);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const enqueue = useCallback((trade: TradeInsert) => {
    const q = getQueue();
    q.push(trade);
    setQueue(q);
    setQueuedCount(q.length);
    toast.info("Trade queued offline", {
      description: `${trade.symbol} will sync when you're back online.`,
    });
  }, []);

  const syncQueue = useCallback(async (createFn: (trade: TradeInsert) => Promise<unknown>) => {
    const q = getQueue();
    if (q.length === 0) return;

    let synced = 0;
    const failed: TradeInsert[] = [];

    for (const trade of q) {
      try {
        await createFn(trade);
        synced++;
      } catch {
        failed.push(trade);
      }
    }

    setQueue(failed);
    setQueuedCount(failed.length);

    if (synced > 0) {
      toast.success(`Synced ${synced} offline trade${synced > 1 ? "s" : ""}`, {
        description: failed.length > 0 ? `${failed.length} failed, will retry.` : undefined,
      });
    }
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queuedCount > 0) {
      // The actual sync will be triggered by the component that has access to createTrade
      // We just notify here
    }
  }, [isOnline, queuedCount]);

  return {
    isOnline,
    queuedCount,
    enqueue,
    syncQueue,
  };
}
