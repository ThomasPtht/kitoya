import { apiClient } from "@/services/api";
import { JerseyData } from "@/services/jersey.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { Entypo, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";

interface JerseyDetailProps {
  jersey: JerseyData & { likesCount?: number };
  onClose: () => void;
}

export default function JerseyDetail({ jersey, onClose }: JerseyDetailProps) {
  const [showBackImage, setShowBackImage] = useState(false);
  const activeImageUrl = showBackImage
    ? jersey.backImageUrl || jersey.frontImageUrl || jersey.frontImageUri
    : jersey.frontImageUrl || jersey.frontImageUri;

  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/jerseys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jerseys"] });
      queryClient.invalidateQueries({ queryKey: ["jerseyCount"] });
      queryClient.invalidateQueries({ queryKey: ["mostRepresentedClub"] });
      onClose();
      Toast.show({
        type: "success",
        text1: "Jersey deleted",
        text2: "The jersey has been removed from your collection.",
        position: "bottom",
      });
    },
    onError: (error) => {
      console.error("Error deleting jersey:", error);
      Alert.alert(
        "Error",
        "There was an error deleting the jersey. Please try again.",
      );
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Jersey",
      "Are you sure you want to delete this jersey from your collection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => mutation.mutate(jersey.id as string),
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      setIsSharing(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
      });

      setIsSharing(false);

      const shareMessage = `Check out this kit from my collection! 👕✨ Join me on KITROOM to build and showcase your ultimate football locker: https://kitroom.app`;

      await Share.share({
        message: shareMessage,
        url: uri,
        title: "Check out this football kit!",
      });
    } catch (error) {
      console.error("Error sharing jersey card:", error);
      Alert.alert("Error", "Could not share the jersey image.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Back / Code */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Feather name="arrow-left" size={16} color="#FFFFFF" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        <View style={styles.topRightInfo}>
          {jersey.isOfficial !== null && jersey.isOfficial !== undefined && (
            <View
              style={[
                styles.officialBadge,
                jersey.isOfficial ? styles.officialTrue : styles.officialFalse,
              ]}
            >
              <Text
                style={[
                  styles.officialText,
                  { color: jersey.isOfficial ? "#05C785" : "#FFA500" },
                ]}
              >
                {jersey.isOfficial ? "OFFICIAL" : "REPLICA / FAN"}
              </Text>
            </View>
          )}
          {jersey.version && (
            <Text style={styles.topCode}>
              {String(jersey.version).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Container of the jersey image with gradient and watermark */}
        <View ref={cardRef} collapsable={false} style={styles.imageContainer}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.12)", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={styles.glowBackground}
          />

          {isSharing && (
            <View style={styles.cardHeaderContext}>
              <Text style={styles.cardContextSubtitle}>MY COLLECTION</Text>
              <Text style={styles.cardContextTitle}>
                {jersey.club?.name || "Football Kit"}{" "}
                {jersey.season ? `• ${jersey.season}` : ""}
              </Text>
            </View>
          )}

          {activeImageUrl ? (
            <Image
              source={{ uri: activeImageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholder}>No image available</Text>
          )}

          {jersey.backImageUrl && (
            <View style={styles.imageToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  !showBackImage && styles.toggleBtnActive,
                ]}
                onPress={() => setShowBackImage(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !showBackImage && styles.toggleTextActive,
                  ]}
                >
                  Front
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  showBackImage && styles.toggleBtnActive,
                ]}
                onPress={() => setShowBackImage(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    showBackImage && styles.toggleTextActive,
                  ]}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isSharing && (
            <View style={styles.watermarkContainer}>
              <Text style={styles.watermarkBrand}>KITROOM</Text>
              <Text style={styles.watermarkUrl}>kitroom.app</Text>
            </View>
          )}
        </View>

        {/* Header Info: Season, Club & Community Likes */}
        <View style={styles.headerInfoContainer}>
          <View style={styles.headerInfo}>
            <Text style={styles.season}>
              {jersey.season ? jersey.season.toUpperCase() : ""}
            </Text>
            <Text style={styles.clubName}>
              {jersey.club?.name || "Club Unknown"}
            </Text>
          </View>

          {/* Like badge*/}
          {(jersey.likesCount ?? 0) > 0 && (
            <View style={styles.likesBadge}>
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text style={styles.likesCountText}>
                {jersey.likesCount ?? 0}{" "}
                {jersey.likesCount === 1 ? "like" : "likes"}
              </Text>
            </View>
          )}
        </View>

        {/* Badges / Tags row */}
        <View style={styles.badgesRow}>
          {jersey.type && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{jersey.type}</Text>
            </View>
          )}
          {jersey.condition && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{jersey.condition}</Text>
            </View>
          )}
          {jersey.size && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Size {jersey.size}</Text>
            </View>
          )}
        </View>

        {/* Purchase History Card */}
        {jersey.purchasePrice !== null &&
          jersey.purchasePrice !== undefined && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Feather name="tag" size={13} color="#05C785" />
                <Text style={styles.cardSectionTitle}>PURCHASE INFO</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Purchase Price</Text>
                <Text style={styles.priceValue}>{jersey.purchasePrice} €</Text>
              </View>
            </View>
          )}

        {/* Story / Description Section */}
        {jersey.description && (
          <View style={styles.storySection}>
            <Text style={styles.storyTitle}>THE STORY & DETAILS</Text>
            <Text style={styles.storyText}>{jersey.description}</Text>
          </View>
        )}

        {/* Specifications Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>SPECIFICATIONS</Text>

          {jersey.playerName && (
            <View style={styles.row}>
              <Text style={styles.label}>Player</Text>
              <Text style={styles.value}>{jersey.playerName}</Text>
            </View>
          )}
          {jersey.number !== null && jersey.number !== undefined && (
            <View style={styles.row}>
              <Text style={styles.label}>Number</Text>
              <Text style={styles.value}>{jersey.number}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{jersey.brand}</Text>
          </View>
          {jersey.version && (
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>{jersey.version}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Condition</Text>
            <Text style={styles.value}>{jersey.condition}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Size</Text>
            <Text style={styles.value}>{jersey.size || "N/A"}</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          style={[styles.shareButton, isSharing && { opacity: 0.7 }]}
          onPress={handleShare}
          disabled={isSharing}
        >
          <EvilIcons name="share-google" size={22} color="#1E1A16" />
          <Text style={styles.shareButtonText}>
            {isSharing ? "Generating card..." : "Share this kit"}
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, mutation.isPending && { opacity: 0.5 }]}
          onPress={handleDelete}
          disabled={mutation.isPending}
        >
          <Feather name="trash-2" size={15} color="#A66363" />
          <Text style={styles.deleteButtonText}>Delete from collection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050806",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    zIndex: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  topRightInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  topCode: {
    color: "#05C785",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  officialBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  officialTrue: {
    borderColor: "#05C785",
    backgroundColor: "#161E1A",
  },
  officialFalse: {
    borderColor: "#FFA500",
    backgroundColor: "#1E1A16",
  },
  officialText: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    backgroundColor: "#050806",
    borderColor: "rgba(127, 206, 175, 0.45)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "rgba(127, 206, 175, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  glowBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: "100%",
    height: 300,
    zIndex: 1,
  },
  placeholder: {
    color: "#8E8E93",
    paddingVertical: 120,
    zIndex: 1,
  },
  imageToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#151515",
    borderRadius: 20,
    padding: 3,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    zIndex: 1,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: "#05C785",
  },
  toggleText: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "#121212",
  },
  watermarkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(127, 206, 175, 0.2)",
    zIndex: 1,
  },
  watermarkBrand: {
    color: "#05C785",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  watermarkUrl: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "500",
  },
  headerInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  season: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
    marginBottom: 4,
  },
  clubName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  likesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  likesCountText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.3)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  badgeText: {
    color: "#05C785",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  storySection: {
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
    marginBottom: 8,
  },
  storyText: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
    alignItems: "center",
  },
  label: {
    color: "#888888",
    fontSize: 14,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priceValue: {
    color: "#05C785",
    fontSize: 15,
    fontWeight: "bold",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05C785",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
    shadowColor: "rgba(5, 199, 133, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  shareButtonText: {
    color: "#1E1A16",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#261C1C",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 12,
  },
  deleteButtonText: {
    color: "#A66363",
    fontSize: 14,
    fontWeight: "500",
  },
  cardHeaderContext: {
    width: "100%",
    marginBottom: 12,
    zIndex: 1,
  },
  cardContextSubtitle: {
    color: "#05C785",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  cardContextTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
