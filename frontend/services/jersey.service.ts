import { apiClient } from "./api";

export interface JerseyData {
  sportId: string;
  clubId: string;
  playerName?: string;
  number?: number;
  season?: string;
  type?: string;
  size?: string;
  condition?: string;
  version?: string;
  description?: string;
  frontImageUri: string;
  backImageUri?: string | null;
}

export const jerseyService = {
  getAll: async () => {
    const { data } = await apiClient.get("/jerseys");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/jerseys/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await apiClient.post("/jerseys", formData);
    return data;
  },
};
