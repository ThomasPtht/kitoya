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
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsScreen() {
  const { data: userInfo } = useUserMe();
  const queryClient = useQueryClient();

  // États pour les préférences de l'application
  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicLocker, setPublicLocker] = useState(false);

  // États pour la modale de modification du username
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // États pour la modale de modification de la Bio
  const [isBioModalVisible, setIsBioModalVisible] = useState(false);
  const [newBioInput, setNewBioInput] = useState<string>("");
  const [isSubmittingBio, setIsSubmittingBio] = useState<boolean>(false);

  // Ouvrir la modale username
  const handleOpenUsernameModal = () => {
    setNewUsernameInput(userInfo?.username || "");
    setIsUsernameModalVisible(true);
  };

  // Ouvrir la modale bio
  const handleOpenBioModal = () => {
    setNewBioInput(userInfo?.bio || "");
    setIsBioModalVisible(true);
  };

  // Enregistrer le nouveau username
  const handleSaveUsername = async () => {
    if (!newUsernameInput || newUsernameInput.trim().length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changeUsername(newUsernameInput.trim());
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsUsernameModalVisible(false);
      Alert.alert("Success", "Username changed successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change username");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enregistrer la nouvelle bio
  const handleSaveBio = async () => {
    try {
      setIsSubmittingBio(true);
      await authService.updateBio(newBioInput.trim());
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsBioModalVisible(false);
      Alert.alert("Success", "Bio updated successfully.");
    }
  };

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
            {/* Username modifiable */}
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenUsernameModal}
            >
              <View style={styles.rowLeft}>
                <Feather name="user" size={18} color="#05C785" />
                <Text style={styles.label}>Username</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.value}>
                  {userInfo?.username || "Collector"}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Bio modifiable */}
            <TouchableOpacity style={styles.row} onPress={handleOpenBioModal}>
              <View style={styles.rowLeft}>
                <Feather name="file-text" size={18} color="#05C785" />
                <Text style={styles.label}>Bio</Text>
              </View>
              <View
                style={[
                  styles.rowRight,
                  { flex: 1, justifyContent: "flex-end", paddingLeft: 20 },
                ]}
              >
                <Text
                  style={[styles.value, { textAlign: "right" }]}
                  numberOfLines={1}
                >
                  {userInfo?.bio || "No bio yet"}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>

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
      </ScrollView>

      {/* Modal de modification du Username */}
      <Modal
        visible={isUsernameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsUsernameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <Text style={styles.modalSubtitle}>
              Enter your new unique username (min. 3 characters)
            </Text>

            <TextInput
              style={styles.modalInput}
              value={newUsernameInput}
              onChangeText={(text: string) => setNewUsernameInput(text)}
              placeholder="New username"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsUsernameModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveUsername}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#050806" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de modification de la Bio */}
      <Modal
        visible={isBioModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Bio</Text>
            <Text style={styles.modalSubtitle}>
              Write a short bio for your collector profile
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { height: 90, textAlignVertical: "top" },
              ]}
              value={newBioInput}
              onChangeText={(text: string) => setNewBioInput(text)}
              placeholder="Tell us about your collection..."
              placeholderTextColor="#555"
              multiline={true}
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsBioModalVisible(false)}
                disabled={isSubmittingBio}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBio}
                disabled={isSubmittingBio}
              >
                {isSubmittingBio ? (
                  <ActivityIndicator size="small" color="#050806" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.3)",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#0A0E0C",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#222222",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#05C785",
  },
  saveButtonText: {
    color: "#050806",
    fontWeight: "bold",
    fontSize: 14,
  },
});
