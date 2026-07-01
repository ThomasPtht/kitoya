import { apiClient } from "./api";

export const sportsService = {
  getSports: async () => {
    const { data } = await apiClient.get("/sports");
    return data;
  },
};
