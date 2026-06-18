import { apiClient } from "./api";



export interface JerseyData {
  sportId: string;
  clubId: string;
  imageUrl: string;
  playerName?: string;
  number?: number;
  season?: string;
  type?: string;
  size?: string;
  condition?: string;
  version?: string;
  description?: string;
}


export const jerseyService = {

    getAll: async() => {
        const { data } = await apiClient.get("/jerseys");
        return data;
    },

    getById: async (id: string) => {
        const { data } = await apiClient.get(`/jerseys/${id}`);
        return data;
    },

    create: async (jerseyData: JerseyData) => {
        const { data } = await apiClient.post("/jerseys", jerseyData);
        return data;
    },

}