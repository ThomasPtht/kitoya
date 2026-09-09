import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    authService.getToken().then((token) => {
      setHasToken(!!token);
      setIsChecking(false);
    });
  }, []);

  if (isChecking) return null;

  return hasToken ? (
    <Redirect href="/(drawer)/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
