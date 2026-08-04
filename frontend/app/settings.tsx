import { useUserMe } from "@/hooks/useAuthHook";
import { authService } from "@/services/auth.service";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
} from "react-native";

export default function SettingsScreen() {
  const { data: userInfo, isLoading, error } = useUserMe();

  // Nouvel état pour les préférences de l'application
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [publicLocker, setPublicLocker] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.deleteAccount();
              await authService.logout();
              router.replace("/(auth)/login");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "An error occurred while deleting the account",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="user" size={18} color="#05C785" />
                <Text style={styles.label}>Username</Text>
              </View>
              <Text style={styles.value}>
                {userInfo?.username || "Collector"}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="mail" size={18} color="#05C785" />
                <Text style={styles.label}>Email</Text>
              </View>
              <Text style={styles.value}>
                {userInfo?.email || "user@kitroom.app"}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="award" size={18} color="#05C785" />
                <Text style={styles.label}>Subscription Plan</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>
                  {userInfo?.planType
                    ? userInfo.planType.toUpperCase()
                    : "FREE"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences / Notifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences & Privacy</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="bell" size={18} color="#05C785" />
                <Text style={styles.label}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: "#222", true: "#05C785" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="globe" size={18} color="#05C785" />
                <Text style={styles.label}>Public Locker by Default</Text>
              </View>
              <Switch
                value={publicLocker}
                onValueChange={setPublicLocker}
                trackColor={{ false: "#222", true: "#05C785" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Account Security & Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(auth)/change-password")}
            >
              <View style={styles.rowLeft}>
                <Feather name="key" size={18} color="#FFFFFF" />
                <Text style={styles.text}>Change Password</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#555" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.rowLeft}>
                <Feather name="trash-2" size={18} color="#A66363" />
                <Text style={styles.deleteText}>Delete Account</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version Info */}
        {/* <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Kitroom v1.2.0 • Build 42</Text>
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050806",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#050806",
  },
  backButton: {
    marginRight: 15,
    backgroundColor: "#151515",
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#05C785",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  planBadge: {
    backgroundColor: "rgba(5, 199, 133, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.3)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  planBadgeText: {
    color: "#05C785",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: "#222222",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  deleteText: {
    color: "#A66363",
    fontSize: 15,
    fontWeight: "500",
  },
  footerInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    color: "#555555",
    fontSize: 12,
  },
});
