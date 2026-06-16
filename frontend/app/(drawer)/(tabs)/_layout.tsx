import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React from "react";

import Header from "@/components/Header";
import { useColorScheme } from "@/components/useColorScheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";

const KITROOM_EMERALD = "#0DFFAA";
const KITROOM_INACTIVE = "#6B7280";

function StyledTabBarIcon({
  Component,
  name,
  color,
  focused,
}: {
  Component: any;
  name: string;
  color: string;
  focused: boolean;
}) {
  return (
    <Component
      size={24}
      name={name}
      style={[
        styles.iconBase,
        focused ? styles.iconNeonGlow : null,
        { color: color },
      ]}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          header: () => <Header />,
          tabBarActiveTintColor: KITROOM_EMERALD,
          tabBarInactiveTintColor: KITROOM_INACTIVE,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#1A1A1A",
            height: 74,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        {/* tab 1 : Accueil */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <StyledTabBarIcon
                Component={FontAwesome}
                name="home"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        {/* tab 2 : Add */}
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ color, focused }) => (
              <StyledTabBarIcon
                Component={AntDesign}
                name="plus-circle"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        {/* tab 3 : Dressing */}
        <Tabs.Screen
          name="dressing"
          options={{
            title: "My Locker",
            tabBarIcon: ({ color, focused }) => (
              <StyledTabBarIcon
                Component={Ionicons}
                name="shirt-outline"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  iconBase: {
    // align icon vertically with the label
    marginBottom: -3,
  },
  iconNeonGlow: {
    shadowColor: KITROOM_EMERALD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,

    // For android we add an elevation to create a similar glow effect, but it's not as precise as iOS shadows
    ...Platform.select({
      android: {
        elevation: 10,
      },
    }),
  },
});
