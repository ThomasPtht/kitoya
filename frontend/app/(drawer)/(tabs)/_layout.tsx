import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import React from "react";

import Header from "@/components/Header";
import { useColorScheme } from "@/components/useColorScheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

const KITROOM_EMERALD = "#0DFFAA";
const KITROOM_INACTIVE = "#6B7280";

function AddButton() {
  return (
    <View style={styles.addButtonContainer}>
      <AntDesign name="plus" size={30} color="#000" />
    </View>
  );
}

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
  const { t } = useTranslation();
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
            title: t("tabs.home"),
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
            title: "", // Vide le titre pour le look bouton seul
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => router.push("/add")}
                style={styles.floatingButtonWrapper}
              >
                <View style={styles.addButtonContainer}>
                  <AntDesign name="plus" size={28} color="#000" />
                </View>
              </Pressable>
            ),
          }}
        />

        {/* tab 3 : Dressing */}
        <Tabs.Screen
          name="dressing"
          options={{
            title: t("tabs.locker"),
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
  iconBase: { marginBottom: -3 },
  iconNeonGlow: {
    shadowColor: KITROOM_EMERALD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  floatingButtonWrapper: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  addButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: KITROOM_EMERALD,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: KITROOM_EMERALD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
