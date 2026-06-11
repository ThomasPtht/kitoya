import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

import Header from "@/components/Header";
import { useColorScheme } from "@/components/useColorScheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";

const KITROOM_EMERALD = "#0DFFAA";
const KITROOM_INACTIVE = "#6B7280";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean; // focused to know when to apply the neon glow effect
}) {
  return (
    <FontAwesome
      size={26}
      style={[
        styles.iconBase,
        props.focused ? styles.iconNeonGlow : null,
        { color: props.color },
      ]}
      name={props.name}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: KITROOM_EMERALD,
          tabBarInactiveTintColor: KITROOM_INACTIVE,
          headerShown: false,
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
              <TabBarIcon name="home" color={color} focused={focused} />
            ),
          }}
        />

        {/* tab 2 : Add */}
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ color, focused }) => (
              <AntDesign
                name="plus-circle"
                size={24}
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
              <Ionicons
                name="shirt-outline"
                size={24}
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
