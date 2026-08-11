import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.row}>
        <Text onPress={() => router.push("/")} style={styles.title}>
          KITROOM
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
            <UserAvatar variant="icon" size={34} />
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    letterSpacing: 1.5,
  },
});
