import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        t("auth.changePassword.alerts.errorTitle"),
        t("auth.changePassword.alerts.fillAllFields"),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("auth.changePassword.alerts.errorTitle"),
        t("auth.changePassword.alerts.passwordsMismatch"),
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t("auth.changePassword.alerts.errorTitle"),
        t("auth.changePassword.alerts.passwordMinLength"),
      );
      return;
    }

    try {
      setIsLoading(true);
      await authService.changePassword({ oldPassword, newPassword });

      Alert.alert(
        t("auth.changePassword.alerts.successTitle"),
        t("auth.changePassword.alerts.successMessage"),
        [
          {
            text: t("auth.changePassword.alerts.ok"),
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        t("auth.changePassword.alerts.errorTitle"),
        error.response?.data?.message ||
          error.message ||
          t("auth.changePassword.alerts.defaultError"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.title}>{t("auth.changePassword.title")}</Text>
      <Text style={styles.subtitle}>{t("auth.changePassword.subtitle")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("auth.changePassword.currentPasswordPlaceholder")}
        placeholderTextColor="#666"
        secureTextEntry
        autoCapitalize="none"
        value={oldPassword}
        onChangeText={setOldPassword}
      />

      <TextInput
        style={[styles.input, { letterSpacing: 0 }]}
        placeholder={t("auth.changePassword.newPasswordPlaceholder")}
        placeholderTextColor="#666"
        secureTextEntry
        autoCapitalize="none"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={[styles.input, { letterSpacing: 0 }]}
        placeholder={t("auth.changePassword.confirmPasswordPlaceholder")}
        placeholderTextColor="#666"
        secureTextEntry
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading
            ? t("auth.changePassword.updating")
            : t("auth.changePassword.updateButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.theme?.surface || "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    zIndex: 10,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#888", marginBottom: 24 },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 16,
    color: "#fff",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#05C785",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16 },
});
