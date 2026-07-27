import { apiClient } from "./api";

export interface JerseyOfTheDay {
  id: string;
  frontImageUrl: string;
  backImageUrl?: string | null;
  playerName?: string | null;
  number?: number | null;
  season?: string | null;
  type: string;
  version: string;
  club: {
    name: string;
    logoUrl?: string | null;
  };
  story: string;
  likesCount: number;
  hasLiked: boolean;
}

export const kotdService = {
  getJerseyOfTheDay: async () => {
    const response = await apiClient.get("/kotd");
    return response.data;
  },

  toggleLike: async (jerseyId: string) => {
    const response = await apiClient.post(`/kotd/${jerseyId}/like`);
    return response.data;
  },
};
