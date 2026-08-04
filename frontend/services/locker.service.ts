import { apiClient } from "./api";

export interface PublicLockerData {
  id: string;
  username: string;
  fullName: string | null;
  isPublic: boolean;
  rank: string | null;
  location: string | null;
  bio: string | null;
  kitsCount: number;
  clubsCount: number;
  jerseys: any[];
}

export const lockerService = {
  async getPublicLocker(username: string): Promise<PublicLockerData> {
    // Thanks to interceptor in apiClient, the token will be automatically added to the request if it exists
    const response = await apiClient.get(`/locker/${username}`);
    return response.data;
  },
};
