import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useToggleLikeJersey } from "@/hooks/useJerseyHook";
import KitOfTheDayModal from "@/components/KitOfTheDayModal";
import { useLocker } from "@/hooks/useLocker";

export default function PublicLockerScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();

  const { data: profileData, isLoading } = useLocker(username);
  const { mutate: toggleLike } = useToggleLikeJersey();

  const [selectedJersey, setSelectedJersey] = useState<any>(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.theme.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors.theme.textMuted}
          />
          <Text style={styles.errorText}>Locker not found or private.</Text>
          <TouchableOpacity
            style={styles.backButtonSimple}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar : Bouton Retour & Badge Public Locker */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.publicBadge}>
          <Ionicons
            name="globe-outline"
            size={14}
            color={Colors.theme.primary}
          />
          <Text style={styles.publicBadgeText}>PUBLIC LOCKER</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="shirt-outline"
              size={36}
              color={Colors.theme.primary}
            />
          </View>

          <View style={styles.identityContainer}>
            <Text style={styles.name}>
              {profileData.fullName || profileData.username}
            </Text>
            <Text style={styles.handle}>@{profileData.username}</Text>
            {profileData.location && (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={Colors.theme.textMuted}
                />
                <Text style={styles.locationText}>{profileData.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio */}
        {profileData.bio && <Text style={styles.bio}>{profileData.bio}</Text>}

        {/* Stats Cards (Kits / Clubs) */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>KITS</Text>
            <Text style={styles.statValue}>{profileData.kitsCount ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CLUBS</Text>
            <Text style={styles.statValue}>{profileData.clubsCount ?? 0}</Text>
          </View>
        </View>

        {/* Collector Rank Badge */}
        <View style={styles.rankRow}>
          <Ionicons
            name="trophy-outline"
            size={14}
            color={Colors.theme.primary}
          />
          <Text style={styles.rankText}>
            <Text style={styles.rankHighlight}>
              {profileData.rank || "ENTHUSIAST"}
            </Text>{" "}
            COLLECTOR
          </Text>
        </View>

        {/* Section Shared Kits */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHARED KITS</Text>
          <Text style={styles.sectionCount}>
            {profileData.jerseys?.length || 0} EXHIBITS
          </Text>
        </View>

        {/* Grille des maillots */}
        <View style={styles.jerseysGrid}>
          {profileData.jerseys?.map((jersey: any) => (
            <TouchableOpacity
              key={jersey.id}
              style={styles.jerseyCard}
              activeOpacity={0.8}
              onPress={() => setSelectedJersey(jersey)}
            >
              <View style={styles.jerseyImageContainer}>
                <Image
                  source={{ uri: jersey.frontImageUrl || jersey.frontImage }}
                  style={styles.jerseyImage}
                  resizeMode="cover"
                />

                {/* Tag type en haut à droite de l'image */}
                <View style={styles.imageTagBadge}>
                  <Text style={styles.imageTagText}>
                    {jersey.club?.name
                      ? jersey.club.name.substring(0, 3).toUpperCase()
                      : "KIT"}
                    -{jersey.season?.slice(-2) || "XX"}-
                    {jersey.type?.charAt(0).toUpperCase() || "H"}
                  </Text>
                </View>

                {/* Bouton Like en bas à gauche de l'image */}
                <TouchableOpacity
                  style={[
                    styles.likeButtonMini,
                    jersey.hasLiked ? styles.likedBg : styles.unlikedBg,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleLike(jersey.id);
                  }}
                >
                  <Ionicons
                    name="heart"
                    size={14}
                    color={jersey.hasLiked ? "#05C785" : Colors.theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.likeCountMiniText,
                      jersey.hasLiked
                        ? styles.likedTextColor
                        : styles.unlikedTextColor,
                    ]}
                  >
                    {jersey.likesCount ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Infos textuelles sous la carte */}
              <View style={styles.jerseyInfo}>
                <Text style={styles.jerseyClubName} numberOfLines={1}>
                  {jersey.club?.name}
                </Text>
                <Text style={styles.jerseySeasonType}>
                  {jersey.season} {jersey.type ? `/ ${jersey.type}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modale de détail du maillot */}
      <KitOfTheDayModal
        visible={!!selectedJersey}
        onClose={() => setSelectedJersey(null)}
        jersey={selectedJersey}
        onToggleLike={(id) => toggleLike(id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme.background || "#050806",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050806",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  backButtonSimple: {
    backgroundColor: Colors.theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
  },
  backButtonText: {
    color: Colors.theme.primary,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.theme.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  publicBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(5, 199, 133, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.3)",
  },
  publicBadgeText: {
    color: Colors.theme.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.theme.surface,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  identityContainer: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  handle: {
    color: Colors.theme.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: Colors.theme.textMuted,
    fontSize: 12,
  },
  bio: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statLabel: {
    color: Colors.theme.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  rankText: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  rankHighlight: {
    color: Colors.theme.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sectionCount: {
    color: Colors.theme.textMuted,
    fontSize: 12,
  },
  jerseysGrid: {
    gap: 20,
  },
  jerseyCard: {
    backgroundColor: Colors.theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.theme.primary,
    padding: 12,
  },
  jerseyImageContainer: {
    width: "100%",
    height: 320,
    borderRadius: 14,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  jerseyImage: {
    width: "100%",
    height: "100%",
  },
  imageTagBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.4)",
  },
  imageTagText: {
    color: Colors.theme.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  likeButtonMini: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  unlikedBg: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  likedBg: {
    backgroundColor: "rgba(5, 199, 133, 0.2)",
    borderColor: "rgba(5, 199, 133, 0.4)",
  },
  likeCountMiniText: {
    fontSize: 12,
    fontWeight: "700",
  },
  unlikedTextColor: {
    color: "#FFFFFF",
  },
  likedTextColor: {
    color: "#05C785",
  },
  jerseyInfo: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  jerseyClubName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  jerseySeasonType: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    textTransform: "capitalize",
  },
});
