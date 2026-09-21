import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/Colors";
import {
  moderationService,
  REPORT_REASONS,
  ReportReason,
  ReportTargetType,
} from "@/services/moderation.service";

const DANGER_COLOR = "#FF5A5F";

interface ReportBlockMenuProps {
  targetType: ReportTargetType;
  targetId: string; // user id or jersey id, depending on targetType
  ownerId: string; // owner of the content, the one who gets blocked
  ownerUsername: string;
  onBlocked?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ReportBlockMenu({
  targetType,
  targetId,
  ownerId,
  ownerUsername,
  onBlocked,
  style,
}: ReportBlockMenuProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"menu" | "reasons">("menu");

  const close = () => {
    setVisible(false);
    setStep("menu");
  };

  const handleReport = async (reason: ReportReason) => {
    close();
    try {
      await moderationService.report({ targetType, targetId, reason });
      Alert.alert(
        t("moderation.reportSentTitle"),
        t("moderation.reportSentMessage"),
      );
    } catch {
      Alert.alert(t("moderation.errorTitle"), t("moderation.errorMessage"));
    }
  };

  const confirmBlock = () => {
    close();
    Alert.alert(
      t("moderation.blockConfirmTitle", { username: ownerUsername }),
      t("moderation.blockConfirmMessage"),
      [
        { text: t("moderation.cancel"), style: "cancel" },
        {
          text: t("moderation.block"),
          style: "destructive",
          onPress: async () => {
            try {
              await moderationService.blockUser(ownerId);
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["kotd"] }),
                queryClient.invalidateQueries({ queryKey: ["locker"] }),
                queryClient.invalidateQueries({ queryKey: ["jerseyLikes"] }),
              ]);
              onBlocked?.();
              Alert.alert(
                t("moderation.blockedTitle"),
                t("moderation.blockedMessage", { username: ownerUsername }),
              );
            } catch {
              Alert.alert(
                t("moderation.errorTitle"),
                t("moderation.errorMessage"),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, style]}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={t("moderation.menuLabel")}
      >
        <Ionicons name="ellipsis-horizontal" size={16} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={close}
        >
          {/* Inner touchable so taps on the sheet don't close it */}
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {step === "menu" ? (
              <>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setStep("reasons")}
                >
                  <Ionicons
                    name="flag-outline"
                    size={20}
                    color={DANGER_COLOR}
                  />
                  <Text style={styles.rowTextDanger}>
                    {t(
                      targetType === "USER"
                        ? "moderation.reportUser"
                        : "moderation.reportKit",
                    )}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.row} onPress={confirmBlock}>
                  <Ionicons
                    name="ban-outline"
                    size={20}
                    color={DANGER_COLOR}
                  />
                  <Text style={styles.rowTextDanger}>
                    {t("moderation.blockUser", { username: ownerUsername })}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>{t("moderation.reasonTitle")}</Text>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.row}
                    onPress={() => handleReport(reason)}
                  >
                    <Text style={styles.rowText}>
                      {t(`moderation.reasons.${reason}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity style={styles.cancelRow} onPress={close}>
              <Text style={styles.cancelText}>{t("moderation.cancel")}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  rowText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
  rowTextDanger: {
    color: DANGER_COLOR,
    fontSize: 15,
    fontWeight: "600",
  },
  cancelRow: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.theme.surface,
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
