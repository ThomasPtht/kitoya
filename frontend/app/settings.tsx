import { useUserMe } from "@/hooks/useAuthHook";
import { authService } from "@/services/auth.service";
import { Feather, Fontisto, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../lib/i18n";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { data: userInfo } = useUserMe();
  const queryClient = useQueryClient();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [publicLocker, setPublicLocker] = useState(false);

  useEffect(() => {
    if (userInfo?.isPublic !== undefined) {
      setPublicLocker(userInfo.isPublic);
    }
  }, [userInfo]);

  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const [isBioModalVisible, setIsBioModalVisible] = useState(false);
  const [newBioInput, setNewBioInput] = useState<string>("");
  const [isSubmittingBio, setIsSubmittingBio] = useState<boolean>(false);

  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [newLocationInput, setNewLocationInput] = useState<string>("");
  const [isSubmittingLocation, setIsSubmittingLocation] =
    useState<boolean>(false);

  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
  const [isSubmittingCurrency, setIsSubmittingCurrency] =
    useState<boolean>(false);

  const CURRENCY_OPTIONS = [
    { code: "EUR", symbol: "€" },
    { code: "USD", symbol: "$" },
    { code: "GBP", symbol: "£" },
  ];

  const LANGUAGE_OPTIONS = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
  ];

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const handleChangeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem("userLanguage", code);
    setIsLanguageModalVisible(false);
  };

  const verifyUsername = async (username: string) => {
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
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  useEffect(() => {
    const trimmed = newUsernameInput.trim();
    const timer = setTimeout(() => {
      verifyUsername(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [newUsernameInput]);

  const handleOpenUsernameModal = () => {
    setNewUsernameInput(userInfo?.username || "");
    setIsUsernameModalVisible(true);
  };

  const handleOpenBioModal = () => {
    setNewBioInput(userInfo?.bio || "");
    setIsBioModalVisible(true);
  };

  const handleOpenLocationModal = () => {
    setNewLocationInput(userInfo?.location || "");
    setIsLocationModalVisible(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsernameInput || newUsernameInput.trim().length < 3) {
      Alert.alert(
        t("settings.alerts.error"),
        t("settings.alerts.usernameLength"),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.changeUsername(newUsernameInput.trim());
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsUsernameModalVisible(false);
      Alert.alert(
        t("settings.alerts.success"),
        t("settings.alerts.usernameSuccess"),
      );
    } catch (error: any) {
      Alert.alert(
        t("settings.alerts.error"),
        error.message || t("settings.alerts.usernameError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      setIsSubmittingBio(true);
      await authService.updateBio(newBioInput.trim());
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsBioModalVisible(false);
      Alert.alert(
        t("settings.alerts.success"),
        t("settings.alerts.bioSuccess"),
      );
    } catch (error: any) {
      Alert.alert(
        t("settings.alerts.error"),
        error.message || t("settings.alerts.bioError"),
      );
    } finally {
      setIsSubmittingBio(false);
    }
  };

  const handleSaveLocation = async () => {
    try {
      setIsSubmittingLocation(true);
      await authService.updateProfile({ location: newLocationInput.trim() });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsLocationModalVisible(false);
      Alert.alert(
        t("settings.alerts.success"),
        t("settings.alerts.locationSuccess"),
      );
    } catch (error: any) {
      Alert.alert(
        t("settings.alerts.error"),
        error.message || t("settings.alerts.locationError"),
      );
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  const handleChangeCurrency = async (code: string) => {
    try {
      setIsSubmittingCurrency(true);
      await authService.updateProfile({ currency: code });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setIsCurrencyModalVisible(false);
    } catch (error: any) {
      Alert.alert(
        t("settings.alerts.error"),
        error.message || t("settings.alerts.currencyError"),
      );
    } finally {
      setIsSubmittingCurrency(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t("settings.modals.delete.title"),
      t("settings.modals.delete.message"),
      [
        { text: t("settings.buttons.cancel"), style: "cancel" },
        {
          text: t("settings.buttons.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await authService.deleteAccount();
              queryClient.clear();
              await authService.logout();
              router.replace("/(auth)/login");
            } catch (error: any) {
              Alert.alert(
                t("settings.alerts.error"),
                error.message || t("settings.alerts.deleteError"),
              );
            }
          },
        },
      ],
    );
  };

  const handleTogglePublicLocker = async (newValue: boolean) => {
    try {
      setPublicLocker(newValue);
      await authService.updateProfile({ isPublic: newValue });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
    } catch (error: any) {
      setPublicLocker(!newValue);
      Alert.alert(
        t("settings.alerts.error"),
        error.message || t("settings.alerts.profileError"),
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("settings.headerTitle")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t("settings.sections.profile")}
          </Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenUsernameModal}
            >
              <View style={styles.rowLeft}>
                <Feather name="user" size={18} color="#05C785" />
                <Text style={styles.label}>
                  {t("settings.profile.username")}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.value}>
                  {userInfo?.username || t("settings.profile.defaultUsername")}
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
            <TouchableOpacity style={styles.row} onPress={handleOpenBioModal}>
              <View style={styles.rowLeft}>
                <Feather name="file-text" size={18} color="#05C785" />
                <Text style={styles.label}>{t("settings.profile.bio")}</Text>
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
                  {userInfo?.bio || t("settings.profile.noBio")}
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

            <TouchableOpacity
              style={styles.row}
              onPress={handleOpenLocationModal}
            >
              <View style={styles.rowLeft}>
                <Feather name="map-pin" size={18} color="#05C785" />
                <Text style={styles.label}>
                  {t("settings.profile.location")}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.value}>
                  {userInfo?.location || t("settings.profile.noLocation")}
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
                <Text style={styles.label}>{t("settings.profile.email")}</Text>
              </View>
              <Text style={styles.value}>
                {userInfo?.email || t("settings.profile.defaultEmail")}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="award" size={18} color="#05C785" />
                <Text style={styles.label}>
                  {t("settings.profile.subscription")}
                </Text>
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
          <Text style={styles.sectionTitle}>
            {t("settings.sections.preferences")}
          </Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Feather name="bell" size={18} color="#05C785" />
                <Text style={styles.label}>
                  {t("settings.preferences.pushNotifications")}
                </Text>
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
                <Feather
                  name={publicLocker ? "globe" : "lock"}
                  size={18}
                  color={publicLocker ? "#05C785" : "#888"}
                />
                <View>
                  <Text style={styles.label}>
                    {t("settings.preferences.publicLocker")}
                  </Text>
                  <Text style={styles.subLabel}>
                    {publicLocker
                      ? t("settings.preferences.publicDesc")
                      : t("settings.preferences.privateDesc")}
                  </Text>
                </View>
              </View>
              <Switch
                value={publicLocker}
                onValueChange={handleTogglePublicLocker}
                trackColor={{ false: "#222", true: "#05C785" }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => setIsCurrencyModalVisible(true)}
            >
              <View style={styles.rowLeft}>
                <Feather name="dollar-sign" size={18} color="#05C785" />
                <Text style={styles.label}>
                  {t("settings.preferences.currency")}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.value}>
                  {CURRENCY_OPTIONS.find((c) => c.code === userInfo?.currency)
                    ?.symbol ?? "€"}
                  {" — "}
                  {userInfo?.currency ?? "EUR"}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Public View / Preview Section */}
        {publicLocker && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              {t("settings.sections.publicView")}
            </Text>
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() =>
                router.push({
                  pathname: "/locker/[username]",
                  params: { username: userInfo?.username },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.previewLeft}>
                <View style={styles.previewIconBox}>
                  <Feather name="eye" size={18} color="#05C785" />
                </View>
                <View>
                  <Text style={styles.previewTitle}>
                    {t("settings.publicView.title")}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {t("settings.publicView.subtitle")}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* Account Security & Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {t("settings.sections.security")}
          </Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsLanguageModalVisible(true)}
            >
              <View style={styles.rowLeft}>
                <Fontisto name="world-o" size={18} color="#FFFFFF" />
                <Text style={styles.text}>
                  {t("settings.security.changeLanguage")}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.value}>
                  {LANGUAGE_OPTIONS.find((l) => l.code === i18n.language)
                    ?.label ?? "English"}
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>

            {userInfo?.hasPassword && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(auth)/change-password")}
              >
                <View style={styles.rowLeft}>
                  <Feather name="key" size={18} color="#FFFFFF" />
                  <Text style={styles.text}>
                    {t("settings.security.changePassword")}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#555" />
              </TouchableOpacity>
            )}

            {userInfo?.hasPassword && <View style={styles.separator} />}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAccount}
            >
              <View style={styles.rowLeft}>
                <Feather name="trash-2" size={18} color="#A66363" />
                <Text style={styles.deleteText}>
                  {t("settings.security.deleteAccount")}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Username Modal */}
      <Modal
        visible={isUsernameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsUsernameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.modals.username.title")}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t("settings.modals.username.subtitle")}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.modalInputWithIcon,
                  isUsernameAvailable === true && styles.inputValid,
                  isUsernameAvailable === false && styles.inputInvalid,
                ]}
                value={newUsernameInput}
                onChangeText={(text: string) => setNewUsernameInput(text)}
                placeholder={t("settings.modals.username.placeholder")}
                placeholderTextColor="#555"
                autoCapitalize="none"
                autoFocus={true}
              />

              <View style={styles.iconContainer}>
                {isCheckingUsername ? (
                  <ActivityIndicator size="small" color="#888" />
                ) : newUsernameInput.trim().length >= 3 &&
                  isUsernameAvailable !== null ? (
                  isUsernameAvailable ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4ade80"
                    />
                  ) : (
                    <Ionicons name="close-circle" size={24} color="#f87171" />
                  )
                ) : null}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsUsernameModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>
                  {t("settings.buttons.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  (!newUsernameInput ||
                    newUsernameInput.trim().length < 3 ||
                    !isUsernameAvailable) && { opacity: 0.5 },
                ]}
                onPress={handleSaveUsername}
                disabled={
                  isSubmitting ||
                  !newUsernameInput ||
                  newUsernameInput.trim().length < 3 ||
                  !isUsernameAvailable
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#050806" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t("settings.buttons.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bio Modal */}
      <Modal
        visible={isBioModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.modals.bio.title")}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t("settings.modals.bio.subtitle")}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { height: 90, textAlignVertical: "top" },
              ]}
              value={newBioInput}
              onChangeText={(text: string) => setNewBioInput(text)}
              placeholder={t("settings.modals.bio.placeholder")}
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
                <Text style={styles.cancelButtonText}>
                  {t("settings.buttons.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBio}
                disabled={isSubmittingBio}
              >
                {isSubmittingBio ? (
                  <ActivityIndicator size="small" color="#050806" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t("settings.buttons.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={isLocationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.modals.location.title")}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t("settings.modals.location.subtitle")}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={newLocationInput}
              onChangeText={(text: string) => setNewLocationInput(text)}
              placeholder={t("settings.modals.location.placeholder")}
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsLocationModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>
                  {t("settings.buttons.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveLocation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#050806" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t("settings.buttons.save")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.modals.currency.title")}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t("settings.modals.currency.subtitle")}
            </Text>

            {CURRENCY_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={styles.row}
                onPress={() => handleChangeCurrency(c.code)}
                disabled={isSubmittingCurrency}
              >
                <Text style={styles.label}>
                  {c.symbol} {c.code}
                </Text>
                {userInfo?.currency === c.code && (
                  <Feather name="check" size={18} color="#05C785" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cancelButton, styles.closeButtonStandalone]}
              onPress={() => setIsCurrencyModalVisible(false)}
              disabled={isSubmittingCurrency}
            >
              <Text style={styles.cancelButtonText}>
                {t("settings.buttons.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      {/* Language Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.security.languageModalTitle")}
            </Text>

            {LANGUAGE_OPTIONS.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.row}
                onPress={() => handleChangeLanguage(lang.code)}
              >
                <Text style={styles.label}>{lang.label}</Text>
                {i18n.language === lang.code && (
                  <Feather name="check" size={18} color="#05C785" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 12 },
              ]}
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t("settings.security.languageClose")}
              </Text>
            </TouchableOpacity>
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
  subLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
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
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  previewIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(5, 199, 133, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  previewSubtitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: 2,
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
  inputContainer: {
    position: "relative",
    justifyContent: "center",
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
  modalInputWithIcon: {
    backgroundColor: "#0A0E0C",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    color: "#FFFFFF",
    fontSize: 15,
  },
  inputValid: {
    borderColor: "#4ade80",
  },
  inputInvalid: {
    borderColor: "#f87171",
  },
  iconContainer: {
    position: "absolute",
    right: 15,
    justifyContent: "center",
    alignItems: "center",
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
  closeButtonStandalone: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
});
