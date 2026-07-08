import { apiClient } from "./api";

export const searchClubs = async (query: string, sportId: string) => {
  const { data } = await apiClient.get("/jerseys/search-clubs", {
    params: { query: query, sportId: sportId },
  });
  return data;
};
