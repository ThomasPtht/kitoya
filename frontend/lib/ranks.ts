const FAKE_JERSEY_WEIGHT = 0.1;

export interface JerseyRankItem {
  isOfficial: boolean;
}

export const calculateRank = (jersey: JerseyRankItem[] | null): string => {
    // if jersey is null, use an empty array to avoid errors
  const safeJerseys = jersey ?? [];
  const effectiveCount = safeJerseys.reduce(
    (count, item) => count + (item.isOfficial ? 1 : FAKE_JERSEY_WEIGHT),
    0,
  );

  if (effectiveCount >= 250) return "Hall of Famer";
  if (effectiveCount >= 150) return "Legend";
  if (effectiveCount >= 75) return "Purist";
  if (effectiveCount >= 30) return "Specialist";
  if (effectiveCount >= 10) return "Collector";
  return "Rookie";
};
