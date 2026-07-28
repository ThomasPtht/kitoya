import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface KitOfTheDayModalProps {
  visible: boolean;
  onClose: () => void;
  jersey: any;
  onToggleLike: (id: string) => void;
}

export default function KitOfTheDayModal({
  visible,
  onClose,
  jersey,
  onToggleLike,
}: KitOfTheDayModalProps) {
  if (!jersey) return null;

  console.log("DONNÉES DU MAILLOT:", jersey);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Barre de fermeture */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KIT OF THE COMMUNITY</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Image grand format */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: jersey.frontImageUrl || jersey.frontImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Infos principales & Like */}
          <View style={styles.metaRow}>
            <View style={styles.metaInfo}>
              <Text style={styles.clubName}>{jersey.club.name}</Text>
              <Text style={styles.seasonType}>
                {jersey.season} • {jersey.type}
              </Text>

              {/* Propriétaire du maillot */}
              {jersey.user?.username && (
                <View style={styles.modalOwnerContainer}>
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={Colors.theme.primary}
                  />
                  <Text style={styles.modalOwnerText}>
                    Locker of{" "}
                    <Text style={styles.modalOwnerName}>
                      @{jersey.user.username}
                    </Text>
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => onToggleLike(jersey.id)}
            >
              <Ionicons
                name={jersey.hasLiked ? "heart" : "heart-outline"}
                size={22}
                color={jersey.hasLiked ? "#EF4444" : Colors.theme.textMuted}
              />
              <Text style={styles.likesCount}>{jersey.likesCount ?? 0}</Text>
            </TouchableOpacity>
          </View>

          {/* Story complète */}
          <View style={styles.storySection}>
            <Text style={styles.storyTitle}>THE STORY</Text>
            <Text style={styles.storyFullText}>{jersey.story}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background || "#050806",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  imageContainer: {
    width: "100%",
    height: 350,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  metaInfo: {
    flex: 1,
    paddingRight: 10,
  },
  clubName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  seasonType: {
    color: Colors.theme.textMuted,
    fontSize: 14,
    textTransform: "capitalize",
  },
  modalOwnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  modalOwnerText: {
    color: Colors.theme.textMuted,
    fontSize: 13,
  },
  modalOwnerName: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  likesCount: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  storySection: {
    backgroundColor: Colors.theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
  },
  storyTitle: {
    color: Colors.theme.primary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
  },
  storyFullText: {
    color: "#D1D5DB",
    fontSize: 15,
    lineHeight: 24,
  },
});
