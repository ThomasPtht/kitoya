import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await authService.getToken();

      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        await authService.getUserInfo(); // vérifie que le token est VRAIMENT valide
        setIsAuthenticated(true);
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
