import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface GoogleButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export default function GoogleButton({
  onPress,
  isLoading,
}: GoogleButtonProps) {
  const { t } = useTranslation();

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
        {isLoading ? t("googleButton.loading") : t("googleButton.continue")}
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
