import Colors from "@/constants/Colors";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserAvatar } from "./UserAvatar";
import { useUserMe } from "@/hooks/useAuthHook";

export default function Header() {
  const navigation = useNavigation();
  const { data: userMe } = useUserMe();

  const handleOpenMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* Subtle floodlight glow instead of a flat background, for separation from the content below */}
      <LinearGradient
        colors={["rgba(5, 199, 133, 0.1)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.row}>
        <Text onPress={() => router.push("/")} style={styles.title}>
          KITOYA
        </Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.avatar}
            onPress={() => {
              handleOpenMenu();
            }}
            accessibilityRole="button"
            accessibilityLabel="Account"
          >
            <UserAvatar
              name={userMe?.username}
              avatarUrl={userMe?.avatarUrl}
              size={34}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    marginLeft: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: 2.5,
    fontFamily: "Outfit_800ExtraBold",
  },
});
