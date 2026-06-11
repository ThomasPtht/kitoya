import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>KITROOM</Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.avatar}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Account"
          >
            <Feather name="user" size={20} color={Colors.light.text} />
          </Pressable>
          <Feather name="bell" size={24} color="#FFFFFFBF" />
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
