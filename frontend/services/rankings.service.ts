import { apiClient } from "./api";

export interface WeeklyRankingEntry {
  rank: number;
  likesCount: number;
  jersey: {
    id: string;
    frontImageUrl: string;
    backImageUrl?: string | null;
    season?: string | null;
    type: string;
    version: string;
    club: {
      name: string;
      logoUrl?: string | null;
    };
  };
  owner: {
    username: string;
    isPublic: boolean;
  };
}

export const rankingsService = {
  getWeeklyRankings: async (
    limit: number = 10,
  ): Promise<WeeklyRankingEntry[]> => {
    const { data } = await apiClient.get(`/rankings/weekly?limit=${limit}`);
    return data;
  },
};
