import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

WebBrowser.maybeCompleteAuthSession();

export const googleAuthService = {
  loginWithGoogle: async () => {
    // Same backend as the rest of the app (apiClient) — hardcoding this to
    // production previously meant Google sign-in always authenticated
    // against prod even on dev/staging builds, issuing a token that the
    // locally/staging-configured backend couldn't validate (different
    // JWT_SECRET / database), breaking every authenticated call afterwards.
    const backendAuthUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google`;

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
