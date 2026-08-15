import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { authService } from "@/services/auth.service";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        t("auth.forgotPassword.alerts.errorTitle"),
        t("auth.forgotPassword.alerts.enterEmail"),
      );
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      Alert.alert(
        t("auth.forgotPassword.alerts.emailSentTitle"),
        t("auth.forgotPassword.alerts.emailSentMessage"),
      );
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email },
      });
    } catch (error) {
      Alert.alert(
        t("auth.forgotPassword.alerts.errorTitle"),
        t("auth.forgotPassword.alerts.sendError"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header avec retour */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t("auth.forgotPassword.title")}</Text>
            <Text style={styles.subtitle}>
              {t("auth.forgotPassword.subtitle")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? t("auth.forgotPassword.sending")
                  : t("auth.forgotPassword.sendButton")}
              </Text>
            </TouchableOpacity>
          </View>

          <View />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.theme.primary,
    letterSpacing: 2,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.theme.textMuted,
    marginTop: 10,
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    marginVertical: 80,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.theme.surface,
    borderWidth: 1,
    borderColor: Colors.theme.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.theme.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.theme.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
