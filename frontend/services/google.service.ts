import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

export const googleAuthService = {
  loginWithGoogle: async () => {
    // Backend URL for Google OAuth2 authentication
    const backendAuthUrl = "https://api.kitoya.com/auth/google";

    // Open the authentication session in a web browser and wait for the result
    const result = await WebBrowser.openAuthSessionAsync(
      backendAuthUrl,
      "kitoya://auth/callback",
    );

    if (result.type === "success" && result.url) {
      // Utilise directement l'objet URL pour un parsing plus fiable
      const [, queryString] = result.url.split("?");
      const cleanQueryString = queryString?.split("#")[0]; // retire le fragment avant de parser
      const urlParams = new URLSearchParams(cleanQueryString);

      const token = urlParams.get("token");
      const isNewUser = urlParams.get("isNewUser") === "true";

      if (token) {
        await SecureStore.setItemAsync("user_token", token);
        return { success: true, isNewUser };
      }
    }
    return { success: false, isNewUser: false };
  },
};
