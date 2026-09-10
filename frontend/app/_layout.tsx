import "../lib/i18n";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/components/useColorScheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { authService } from "@/services/auth.service";
import { useNotificationResponseListener } from "@/services/notifications.service";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootLayoutNav />
        <Toast />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useNotificationResponseListener();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="locker/[username]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="analytics"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="exportCollection"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="help"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="subscription"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="upgrade"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
