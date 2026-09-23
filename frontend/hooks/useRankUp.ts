import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateRank, RANK_ORDER, JerseyRankItem } from "@/lib/ranks";

const STORAGE_KEY = "kitoya:lastSeenRank";

/**
 * Tracks the collector rank derived from `jerseys` and detects when it goes
 * up (e.g. right after adding enough jerseys to cross a threshold), so the
 * UI can celebrate it instead of just silently updating a badge's text.
 */
export function useRankUp(jerseys: JerseyRankItem[] | null | undefined) {
  const rank = calculateRank(jerseys ?? null);
  const [justRankedUp, setJustRankedUp] = useState(false);

  useEffect(() => {
    // Wait for real data before comparing, to avoid a false positive while
    // the jerseys query is still loading (jerseys === undefined).
    if (!jerseys) return;

    let cancelled = false;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored === null) {
          // First time this device sees a rank: just remember it silently.
          await AsyncStorage.setItem(STORAGE_KEY, rank);
          return;
        }

        if (stored !== rank) {
          const previousIndex = RANK_ORDER.indexOf(stored as any);
          const currentIndex = RANK_ORDER.indexOf(rank as any);

          if (currentIndex > previousIndex && !cancelled) {
            setJustRankedUp(true);
          }

          await AsyncStorage.setItem(STORAGE_KEY, rank);
        }
      } catch (error) {
        console.error("useRankUp: failed to read/write last seen rank", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rank, jerseys]);

  const dismiss = () => setJustRankedUp(false);

  return { rank, justRankedUp, dismiss };
}
