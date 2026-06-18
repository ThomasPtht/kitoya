// services/auth.service.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "./api";


export const authService = {
  register: async (username: string, email: string, password: string) => {
    try {
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
    } catch (error: any) {
      // Extract the error message from the response if available, otherwise use a generic error message
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during registration";
      throw new Error(errorMessage);
    }
  },

  /**
   * Send identifiants to the backend and store the JWT token in the Keychain/KeyStore of the phone if authentication is successful.
   */
  login: async (email: string, password: string) => {
    try {
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
    } catch (error: any) {
      // Extract the error message from the response if available, otherwise use a generic error message
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred during authentication";
      throw new Error(errorMessage);
    }
  },

  /**
   * Get the JWT token from the Keychain/KeyStore of the phone. Returns null if no token is found.
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync("user_token");
  },

  /**
   * Delete the token
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync("user_token");
  },
};
