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
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useNotificationResponseListener } from "@/services/notifications.service";
import { PostHogProvider, usePostHog } from "posthog-react-native";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

// The OS often kills the app while it's in the background, which wiped the
// in-memory cache and forced a full reload on resume. Persisting the cache to
// disk lets the app show the last known data instantly, then refresh silently.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_MAX_AGE, // must be >= maxAge or entries are dropped before being persisted
    },
  },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage });

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
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: "https://eu.i.posthog.com",
        disabled: __DEV__, // Disable PostHog in development mode
        captureAppLifecycleEvents: true, // Capture app lifecycle events
      }}
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: CACHE_MAX_AGE }}
      >
        <SafeAreaProvider>
          <RootLayoutNav />
          <Toast />
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </PostHogProvider>
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
