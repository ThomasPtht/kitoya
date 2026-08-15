import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authService } from "@/services/auth.service";
import { useTranslation } from "react-i18next";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      Alert.alert(
        t("auth.resetPassword.alerts.errorTitle"),
        t("auth.resetPassword.alerts.fillAllFields"),
      );
      return;
    }

    if (code.length !== 6) {
      Alert.alert(
        t("auth.resetPassword.alerts.errorTitle"),
        t("auth.resetPassword.alerts.codeLength"),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("auth.resetPassword.alerts.errorTitle"),
        t("auth.resetPassword.alerts.passwordsMismatch"),
      );
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, code, newPassword });

      Alert.alert(
        t("auth.resetPassword.alerts.successTitle"),
        t("auth.resetPassword.alerts.successMessage"),
        [
          {
            text: t("auth.resetPassword.alerts.login"),
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        t("auth.resetPassword.alerts.errorTitle"),
        error.message || t("auth.resetPassword.alerts.defaultError"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.resetPassword.title")}</Text>
      <Text style={styles.subtitle}>{t("auth.resetPassword.subtitle")}</Text>

      {/* Email field pre-filled and disabled */}
      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder={t("auth.resetPassword.emailPlaceholder")}
        placeholderTextColor="#666"
        value={email}
        editable={false}
      />

      <TextInput
        style={styles.codeInput}
        placeholder={t("auth.resetPassword.codePlaceholder")}
        placeholderTextColor="#666"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TextInput
        style={styles.input}
        placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
        placeholderTextColor="#666"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
        placeholderTextColor="#666"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading
            ? t("auth.resetPassword.updating")
            : t("auth.resetPassword.updateButton")}
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
  codeInput: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
    fontWeight: "bold",
    color: "#05C785",
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
  disabledInput: {
    opacity: 0.5,
    color: "#888",
  },
});
