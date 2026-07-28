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

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (code.length !== 6) {
      Alert.alert("Error", "The reset code must be 6 digits");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, code, newPassword });

      Alert.alert("Success", "Your password has been reset successfully.", [
        { text: "Login", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to reset password. The code may have expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code received by email and your new password.
      </Text>

      {/* Email field pre-filled and disabled */}
      <TextInput
        style={[styles.input, styles.disabledInput]}
        placeholder="Email address"
        placeholderTextColor="#666"
        value={email}
        editable={false}
      />

      <TextInput
        style={styles.codeInput}
        placeholder="123456"
        placeholderTextColor="#666"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TextInput
        style={styles.input}
        placeholder="New password"
        placeholderTextColor="#666"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
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
          {isLoading ? "Updating..." : "Reset Password"}
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
