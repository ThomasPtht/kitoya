import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface GoogleButtonProps {
  onPress: () => void;
  isLoading?: boolean; // to display a spinner later if needed
}

export default function GoogleButton({
  onPress,
  isLoading,
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.googleIconContainer}>
        <FontAwesome name="google" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.googleButtonText}>
        {isLoading ? "Connecting..." : "Continue with Google"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#333333",
    marginTop: 15,
    width: "100%",
  },
  googleIconContainer: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
