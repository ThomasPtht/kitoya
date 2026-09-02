import GoogleButton from "@/components/GoogleButton";
import { Colors } from "@/constants/Colors";
import { authService } from "@/services/auth.service";
import { googleAuthService } from "@/services/google.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { KeyboardAvoidingView } from "react-native";
import Toast from "react-native-toast-message";
import z from "zod";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { t } = useTranslation();

  const loginSchema = z.object({
    email: z
      .string()
      .email({ message: t("auth.login.validation.invalidEmail") }),
    password: z
      .string()
      .min(6, { message: t("auth.login.validation.passwordMin") }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoggingIn(true);
      await authService.login(data.email, data.password);
      router.replace("/(drawer)/(tabs)");
    } catch (error) {
      Alert.alert("Authentification failed", "Invalid email or password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const passwordRef = useRef<TextInput>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const success = await googleAuthService.loginWithGoogle();
      if (success) {
        router.replace("/(drawer)/(tabs)");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Google login failed",
        text2: "Please try again later.",
      });
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.logoContainer}>
            <Text style={styles.title}>KITOYA</Text>
            <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputErrorBorder,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder={t("auth.login.emailPlaceholder")}
                    placeholderTextColor="#8E8E93"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!isSubmitting}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password && styles.inputErrorBorder,
                  ]}
                >
                  <TextInput
                    ref={passwordRef}
                    style={[styles.input, { letterSpacing: 0 }]}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    placeholderTextColor="#8E8E93"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    editable={!isSubmitting}
                  />
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>
                {t("auth.login.forgotPassword")}
              </Text>
            </TouchableOpacity>

            {/* Bouton de soumission */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.buttonText}>
                  {t("auth.login.connecting")}
                </Text>
              ) : (
                <Text style={styles.buttonText}>{t("auth.login.submit")}</Text>
              )}
            </TouchableOpacity>

            {/* google button */}
            <GoogleButton
              onPress={handleGoogleLogin}
              isLoading={isGoogleLoading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>{t("auth.login.noAccount")} </Text>
            <TouchableOpacity>
              <Text
                onPress={() => router.push("/(auth)/register")}
                style={styles.footerLink}
              >
                {t("auth.login.signUpLink")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.theme.primary,
    letterSpacing: 3,
    fontFamily: "Outfit_800ExtraBold",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.theme.textMuted,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    marginVertical: 10,
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
    marginTop: 16,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputErrorBorder: {
    borderColor: "#E5484D",
  },
  errorText: {
    color: "#E5484D",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: Colors.theme.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.theme.background,
    fontSize: 16,
    fontWeight: "700",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: Colors.theme.textDark,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.theme.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.theme.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});
