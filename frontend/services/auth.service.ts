// services/auth.service.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Use the IP address of my computer instead of localhost, because the mobile app runs in a simulator or on a physical device, which cannot access localhost of the computer. And add the port number of the NestJS backend (default is 3000).
const API_URL = "http://192.168.1.15:3000";

interface AuthResponse {
  access_token: string;
}

export const authService = {
  register: async (
    username: string,
    email: string,
    password: string,
  ): Promise<{ access_token: string }> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/register`,
        {
          username,
          email,
          password,
        },
      );

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
  login: async (
    email: string,
    password: string,
  ): Promise<{ access_token: string }> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, {
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
