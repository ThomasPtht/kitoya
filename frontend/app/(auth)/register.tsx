import GoogleButton from "@/components/GoogleButton";
import { Colors } from "@/constants/Colors";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import z from "zod";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { googleAuthService } from "@/services/google.service";

export default function RegisterScreen() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const { t } = useTranslation();

  const registerSchema = z.object({
    username: z
      .string()
      .min(3, { message: t("auth.register.validation.usernameMin") }),
    email: z
      .string()
      .email({ message: t("auth.register.validation.invalidEmail") }),
    password: z
      .string()
      .min(6, { message: t("auth.register.validation.passwordMin") }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: t("auth.register.validation.acceptPrivacy"),
    }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      acceptPrivacy: false,
    },
  });

  const handleCheckUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    try {
      setIsCheckingUsername(true);
      const result = await authService.checkUsername(username);
      setIsUsernameAvailable(result.available);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (isUsernameAvailable === false) {
      Toast.show({
        type: "error",
        text1: "Username already taken",
        text2: "Please choose a different username.",
      });
      return;
    }
    try {
      setIsUsernameAvailable(null);
      await authService.register(data.username, data.email, data.password);
      router.push("/(drawer)/(tabs)");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setIsUsernameAvailable(false);
        Toast.show({
          type: "error",
          text1: "Username already taken",
          text2: "Please choose a different username.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Registration failed",
          text2: "Please try again later.",
        });
      }
      console.error("Login error:", error);
    }
  };

  const passwordRef = useRef<TextInput>(null);

  const handleGoogleRegister = async () => {
    try {
      setIsGoogleLoading(true);
      const success = await googleAuthService.loginWithGoogle();
      if (success) {
        router.push("/(drawer)/(tabs)");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.logoContainer}>
            <Text style={styles.title}>KITROOM</Text>
            <Text style={styles.subtitle}>{t("auth.register.subtitle")}</Text>
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrapper,
                    (errors.username || isUsernameAvailable === false) &&
                      styles.inputErrorBorder,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder={t("auth.register.usernamePlaceholder")}
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onBlur={() => {
                      onBlur();
                      if (value && value.length >= 3) {
                        handleCheckUsername(value);
                      }
                    }}
                    onChangeText={(text) => {
                      onChange(text);
                      if (isUsernameAvailable !== null)
                        setIsUsernameAvailable(null);
                    }}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    editable={!isSubmitting}
                  />
                  {isCheckingUsername && (
                    <ActivityIndicator
                      size="small"
                      color="#8E8E93"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  {!isCheckingUsername && isUsernameAvailable === true && (
                    <Text
                      style={{
                        color: "#30D158",
                        fontWeight: "bold",
                        marginRight: 8,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                  {!isCheckingUsername && isUsernameAvailable === false && (
                    <Text
                      style={{
                        color: "#E5484D",
                        fontWeight: "bold",
                        marginRight: 8,
                      }}
                    >
                      ✕
                    </Text>
                  )}
                </View>
              )}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}
            {isUsernameAvailable === false && !errors.username && (
              <Text style={styles.errorText}>
                {t("auth.register.errors.usernameTaken")}
              </Text>
            )}

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
                    placeholder={t("auth.register.emailPlaceholder")}
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
                    style={styles.input}
                    placeholder={t("auth.register.passwordPlaceholder")}
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

            {/* 2. Checkbox Privacy Policy */}
            <Controller
              control={control}
              name="acceptPrivacy"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  activeOpacity={0.8}
                  onPress={() => onChange(!value)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      value && styles.checkboxChecked,
                      errors.acceptPrivacy && styles.inputErrorBorder,
                    ]}
                  >
                    {value && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.privacyText}>
                    {t("auth.register.acceptPrivacy")}{" "}
                    <Text
                      style={styles.privacyLink}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push("/(auth)/privacy-policy");
                      }}
                    >
                      {t("auth.register.privacyPolicyLink")}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
            />
            {errors.acceptPrivacy && (
              <Text style={styles.errorText}>
                {errors.acceptPrivacy.message}
              </Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#121214" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("auth.register.submit")}
                </Text>
              )}
            </TouchableOpacity>
            <GoogleButton
              onPress={handleGoogleRegister}
              isLoading={isGoogleLoading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              {t("auth.register.hasAccount")}{" "}
            </Text>
            <TouchableOpacity>
              <Text
                onPress={() => router.push("/(auth)/login")}
                style={styles.footerLink}
              >
                {t("auth.register.signInLink")}
              </Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
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
    marginVertical: 20,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.theme.surfaceBorder,
    backgroundColor: Colors.theme.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.theme.primary,
    borderColor: Colors.theme.primary,
  },
  checkmark: {
    color: Colors.theme.background,
    fontSize: 14,
    fontWeight: "bold",
  },
  privacyText: {
    color: Colors.theme.textMuted,
    fontSize: 14,
    flex: 1,
  },
  privacyLink: {
    color: Colors.theme.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
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
});
