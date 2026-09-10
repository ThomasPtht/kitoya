import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { usePostHog } from "posthog-react-native";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const posthog = usePostHog();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authService.getToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        const userInfo = await authService.getUserInfo(); // vérifie que le token est VRAIMENT valide
        setIsAuthenticated(true);

        // Identifie l'utilisateur dans PostHog si l'ID est disponible
        if (userInfo?.id) {
          posthog?.identify(userInfo.id, {
            email: userInfo.email,
            name: userInfo.name,
            planType: userInfo.subscription?.planType || "FREE",
          });
        }
      } catch {
        setIsAuthenticated(false);
        await authService.logout(); // nettoie le vieux token invalide
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking) return null;

  return isAuthenticated ? (
    <Redirect href="/(drawer)/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
