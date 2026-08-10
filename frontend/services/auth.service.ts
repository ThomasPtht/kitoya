import * as SecureStore from "expo-secure-store";
import { apiClient } from "./api";

export const authService = {
  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post("/auth/register", {
      username,
      email,
      password,
    });

    const { access_token } = response.data;

    if (access_token) {
      // Store the token securely in the device's secure storage
      await SecureStore.setItemAsync("user_token", access_token);
    }
    return response.data;
  },

  checkUsername: async (username: string) => {
    const response = await apiClient.get(`/auth/check-username/${username}`);
    return response.data;
  },

  /**
   * Send identifiants to the backend and store the JWT token in the Keychain/KeyStore of the phone if authentication is successful.
   */
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    const { access_token } = response.data;

    if (access_token) {
      // Store the token securely in the device's secure storage
      await SecureStore.setItemAsync("user_token", access_token);
    }

    return response.data;
  },

  /**
   * Get the JWT token from the Keychain/KeyStore of the phone. Returns null if no token is found.
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync("user_token");
  },

  getUserInfo: async (): Promise<any> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Delete the token
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync("user_token");
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete("/auth/delete-account");
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    code: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post("/auth/change-password", data);
    return response.data;
  },

  changeUsername: async (newUsername: string) => {
    const response = await apiClient.post("/auth/change-username", {
      newUsername,
    });
    return response.data;
  },

  updateProfile: async (data: { isPublic?: boolean }) => {
    const response = await apiClient.post("/auth/update-profile", data);
    return response.data;
  },

  updateBio: async (bio: string) => {
    const response = await apiClient.post("/auth/update-bio", { bio });
    return response.data;
  },
};