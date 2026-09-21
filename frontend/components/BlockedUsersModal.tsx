import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/Colors";
import { moderationService } from "@/services/moderation.service";

interface BlockedUsersModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({
  visible,
  onClose,
}: BlockedUsersModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: moderationService.getBlockedUsers,
    enabled: visible,
  });

  const { mutate: unblock, isPending } = useMutation({
    mutationFn: (userId: string) => moderationService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["kotd"] });
      queryClient.invalidateQueries({ queryKey: ["locker"] });
      queryClient.invalidateQueries({ queryKey: ["jerseyLikes"] });
    },
    onError: () => {
      Alert.alert(t("moderation.errorTitle"), t("moderation.errorMessage"));
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("moderation.blockedUsersTitle")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              color={Colors.theme.primary}
              style={{ marginVertical: 20 }}
            />
          ) : (
            <FlatList
              data={blockedUsers ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.username}>@{item.username}</Text>
                  <TouchableOpacity
                    style={styles.unblockButton}
                    disabled={isPending}
                    onPress={() => unblock(item.id)}
                  >
                    <Text style={styles.unblockText}>
                      {t("moderation.unblock")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {t("moderation.blockedUsersEmpty")}
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  username: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
  },
  unblockText: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.theme.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
});
