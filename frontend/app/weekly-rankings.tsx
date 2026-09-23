import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { usePostHog } from "posthog-react-native";
import { useWeeklyRankings } from "@/hooks/useJerseyHook";
import type { WeeklyRankingEntry } from "@/services/rankings.service";
import { Colors } from "@/constants/Colors";

const RANKINGS_LIMIT = 20;

const MEDAL_STYLES = {
  1: { color: "#FFD700", glow: "rgba(255, 215, 0, 0.35)", icon: "trophy" as const },
  2: { color: "#C0C0C0", glow: "rgba(192, 192, 192, 0.3)", icon: "medal" as const },
  3: { color: "#CD7F32", glow: "rgba(205, 127, 50, 0.3)", icon: "medal" as const },
};

export default function WeeklyRankingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const posthog = usePostHog();

  const { data, isLoading, error } = useWeeklyRankings(RANKINGS_LIMIT);

  useEffect(() => {
    posthog?.screen("WeeklyRankings");
  }, [posthog]);

  const handlePress = (entry: WeeklyRankingEntry) => {
    if (!entry.owner.isPublic) return;
    router.push(`/locker/${entry.owner.username}`);
  };

  const podium = (data ?? []).slice(0, 3);
  const rest = (data ?? []).slice(3);

  const podiumByRank = (rank: number) => podium.find((e) => e.rank === rank);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>
            {t("weeklyRankings.headerSubtitle")}
          </Text>
          <Text style={styles.headerTitle}>
            {t("weeklyRankings.headerTitle")}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.theme.primary} />
        </View>
      ) : error || !data || data.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="trophy-outline"
              size={32}
              color={Colors.theme.primary}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {t("weeklyRankings.emptyState.title")}
          </Text>
          <Text style={styles.emptyText}>
            {t("weeklyRankings.emptyState.subtitle")}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= PODIUM ================= */}
          <View style={styles.podiumRow}>
            <PodiumCard
              entry={podiumByRank(2)}
              rank={2}
              size="medium"
              onPress={handlePress}
              t={t}
            />
            <PodiumCard
              entry={podiumByRank(1)}
              rank={1}
              size="large"
              onPress={handlePress}
              t={t}
            />
            <PodiumCard
              entry={podiumByRank(3)}
              rank={3}
              size="medium"
              onPress={handlePress}
              t={t}
            />
          </View>

          {/* ================= FULL LIST ================= */}
          {rest.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>
                {t("weeklyRankings.listSectionTitle")}
              </Text>
              <View style={styles.sectionCard}>
                {rest.map((entry, index) => (
                  <RankingRow
                    key={entry.jersey.id}
                    entry={entry}
                    isLast={index === rest.length - 1}
                    onPress={handlePress}
                    t={t}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PodiumCard({
  entry,
  rank,
  size,
  onPress,
  t,
}: {
  entry: WeeklyRankingEntry | undefined;
  rank: 1 | 2 | 3;
  size: "large" | "medium";
  onPress: (entry: WeeklyRankingEntry) => void;
  t: (key: string, options?: any) => string;
}) {
  const medal = MEDAL_STYLES[rank];
  const isLarge = size === "large";
  const clickable = !!entry && entry.owner.isPublic;

  const content = (
    <View
      style={[
        styles.podiumCard,
        isLarge ? styles.podiumCardLarge : styles.podiumCardMedium,
        { borderColor: medal.color, shadowColor: medal.color },
        !entry && styles.podiumCardEmpty,
      ]}
    >
      <View style={[styles.medalBadge, { backgroundColor: medal.glow }]}>
        <Ionicons name={medal.icon} size={isLarge ? 18 : 14} color={medal.color} />
        <Text style={[styles.medalRank, { color: medal.color }]}>
          {t(`weeklyRankings.podium.rank${rank}`)}
        </Text>
      </View>

      {entry ? (
        <>
          <Image
            source={{ uri: entry.jersey.frontImageUrl }}
            style={[
              styles.podiumImage,
              isLarge ? styles.podiumImageLarge : styles.podiumImageMedium,
            ]}
            resizeMode="cover"
          />
          <Text style={styles.podiumClubName} numberOfLines={1}>
            {entry.jersey.club.name}
          </Text>
          <View style={styles.podiumLikesRow}>
            <Ionicons name="heart" size={12} color={Colors.theme.primary} />
            <Text style={styles.podiumLikesText}>{entry.likesCount}</Text>
          </View>
          {entry.owner.isPublic ? (
            <Text style={styles.podiumUsername} numberOfLines={1}>
              @{entry.owner.username}
            </Text>
          ) : (
            <View style={styles.podiumPrivateRow}>
              <Ionicons
                name="lock-closed"
                size={10}
                color={Colors.theme.textMuted}
              />
              <Text style={styles.podiumPrivateText}>
                {t("weeklyRankings.privateLockerNote")}
              </Text>
            </View>
          )}
        </>
      ) : (
        <View
          style={[
            styles.podiumImage,
            isLarge ? styles.podiumImageLarge : styles.podiumImageMedium,
            styles.podiumImagePlaceholder,
          ]}
        />
      )}
    </View>
  );

  if (!clickable) return content;

  return (
    <Pressable onPress={() => onPress(entry!)} style={{ flex: isLarge ? 1.15 : 1 }}>
      {content}
    </Pressable>
  );
}

function RankingRow({
  entry,
  isLast,
  onPress,
  t,
}: {
  entry: WeeklyRankingEntry;
  isLast: boolean;
  onPress: (entry: WeeklyRankingEntry) => void;
  t: (key: string, options?: any) => string;
}) {
  const clickable = entry.owner.isPublic;

  return (
    <Pressable
      disabled={!clickable}
      onPress={() => onPress(entry)}
      style={[styles.rankRow, !isLast && styles.rankRowSeparator]}
    >
      <Text style={styles.rankNumber}>{entry.rank}</Text>

      <Image
        source={{ uri: entry.jersey.frontImageUrl }}
        style={styles.rankThumbnail}
        resizeMode="cover"
      />

      <View style={styles.rankInfo}>
        <Text style={styles.rankClubName} numberOfLines={1}>
          {entry.jersey.club.name}
        </Text>
        <Text style={styles.rankMeta} numberOfLines={1}>
          {entry.owner.isPublic
            ? `@${entry.owner.username}`
            : t("weeklyRankings.privateLockerNote")}
        </Text>
      </View>

      <View style={styles.rankLikesBadge}>
        <Ionicons name="heart" size={13} color={Colors.theme.primary} />
        <Text style={styles.rankLikesText}>{entry.likesCount}</Text>
      </View>

      {clickable && (
        <Feather
          name="chevron-right"
          size={16}
          color={Colors.theme.textMuted}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 15,
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 50,
  },
  archiveSubtitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#05C785",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(5, 199, 133, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(5, 199, 133, 0.3)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    lineHeight: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 10,
  },
  podiumCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  podiumCardLarge: {
    paddingTop: 14,
    paddingBottom: 16,
  },
  podiumCardMedium: {
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 14,
  },
  podiumCardEmpty: {
    opacity: 0.4,
  },
  medalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  medalRank: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  podiumImage: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#0A0A0A",
    marginBottom: 10,
  },
  podiumImageLarge: {
    height: 130,
  },
  podiumImageMedium: {
    height: 95,
  },
  podiumImagePlaceholder: {
    borderWidth: 1,
    borderColor: "#262626",
    borderStyle: "dashed",
  },
  podiumClubName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  podiumLikesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  podiumLikesText: {
    color: Colors.theme.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  podiumUsername: {
    color: "#888888",
    fontSize: 11,
  },
  podiumPrivateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  podiumPrivateText: {
    color: "#888888",
    fontSize: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 15,
  },
  sectionCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 8,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  rankRowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  rankNumber: {
    width: 20,
    color: "#888888",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  rankThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0A0A0A",
  },
  rankInfo: {
    flex: 1,
  },
  rankClubName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  rankMeta: {
    color: "#888888",
    fontSize: 12,
  },
  rankLikesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rankLikesText: {
    color: Colors.theme.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
});
