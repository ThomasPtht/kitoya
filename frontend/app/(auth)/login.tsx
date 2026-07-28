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
  Alert,
} from "react-native";
import { KeyboardAvoidingView, TouchableWithoutFeedback } from "react-native";
import z from "zod";

export default function LoginScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
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
      console.log("Logique Google déclenchée !");
      // Plus tard : await authService.loginWithGoogle()
    } catch (error) {
      console.error(error);
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
            <Text style={styles.subtitle}>
              Welcome back ! Please login to your account to add your kits and
              manage your locker.
            </Text>
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
                    placeholder="Email"
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
                    ref={passwordRef} // Allows the password input to be focused when the user presses "next" on the email input
                    style={styles.input}
                    placeholder="Password"
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

            {/* Bouton de soumission ajouté pour pouvoir déclencher le formulaire */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.buttonText}>Connecting ...</Text>
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* google button */}
            <GoogleButton
              onPress={handleGoogleLogin}
              isLoading={isSubmitting}
            />
          </View>

          {/* Footer inclus dans le flux principal */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't you have an account? </Text>
            <TouchableOpacity>
              <Text
                onPress={() => router.push("/(auth)/register")}
                style={styles.footerLink}
              >
                Sign up
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
  },
  subtitle: {
    fontSize: 14,
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
