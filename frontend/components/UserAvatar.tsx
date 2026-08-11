// components/UserAvatar.tsx
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface UserAvatarProps {
  name?: string;
  size?: number;
  variant?: "initials" | "icon";
}

export function UserAvatar({
  name,
  size = 34,
  variant = "initials",
}: UserAvatarProps) {
  const getInitials = (n?: string) => {
    if (!n) return "U";
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const dynamicStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.avatar, dynamicStyle]}>
      {variant === "icon" ? (
        <Feather name="user" size={size * 0.5} color="#05C785" />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.35 }]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderWidth: 1.5,
    borderColor: "#05C785",
    backgroundColor: "#161E1A",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#05C785",
    fontWeight: "bold",
  },
});
