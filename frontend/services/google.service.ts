import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

export const googleAuthService = {
  loginWithGoogle: async () => {
    // Backend URL for Google OAuth2 authentication
    const backendAuthUrl = "http://192.168.1.15:3000/auth/google";

    // Open the authentication session in a web browser and wait for the result
    const result = await WebBrowser.openAuthSessionAsync(
      backendAuthUrl,
      "http://192.168.1.15:3000/auth/google/callback",
    );

    if (result.type === "success" && result.url) {
      // Extract the token from the callback URL
      const urlParams = new URLSearchParams(result.url.split("?")[1]);
      const token = urlParams.get("token");

      if (token) {
        // Store the token securely using SecureStore
        await SecureStore.setItemAsync("user_token", token);
        return true;
      }
    }
    return false;
  },
};
