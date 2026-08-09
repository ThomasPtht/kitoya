import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCollectionAnalytics } from "@/hooks/useJerseyHook";
import { useUserMe } from "@/hooks/useAuthHook";

interface AnalyticsProps {
  onClose?: () => void;
  stats?: {
    totalKits: number;
    uniqueClubs: number;
    erasCovered: number;
    brandsCount: number;
    totalInvested: number;
    avgPrice: number;
    topClubs: { name: string; count: number; maxCount: number }[];
    eras: { name: string; count: number; maxCount: number }[];
    brands: { name: string; count: number }[];
    variants: { name: string; count: number; maxCount: number }[];
    conditions: { name: string; count: number; maxCount: number }[];
  };
}

const formatLabel = (text: string) => {
  if (!text) return "";
  const cleaned = text.replace(/[_]/g, " ").replace(/[-]/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};

export default function AnalyticsScreen({ onClose }: AnalyticsProps) {
  const router = useRouter();
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const { data, isLoading, error } = useCollectionAnalytics();
  console.log("Collection Analytics Data:", data);

  const isAdmin = userMe?.role === "ADMIN";
  const isElite =
    (userMe?.subscription?.planType === "ELITE_MONTHLY" ||
      userMe?.subscription?.planType === "ELITE_YEARLY") &&
    userMe?.subscription?.status === "active";
  const hasEliteAccess = isAdmin || isElite;

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (isUserLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <Text style={{ color: "#888888" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!hasEliteAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Collection stats</Text>
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockIconContainer}>
            <Feather name="lock" size={32} color="#05C785" />
          </View>
          <Text style={styles.lockedTitle}>ELITE Feature</Text>
          <Text style={styles.lockedText}>
            Advanced collection analytics are reserved for Kitroom ELITE
            members.
          </Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => router.push("/subscription")}
            activeOpacity={0.8}
          >
            <Feather
              name="zap"
              size={18}
              color="#121212"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.exportButtonText}>Discover ELITE Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View>
          <Text style={styles.archiveSubtitle}>ANALYTICS</Text>
          <Text style={styles.headerTitle}>Collection stats</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="shopping-bag" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>TOTAL KITS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.totalKits ?? 0}</Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="shield" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>UNIQUE CLUBS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.uniqueClubs ?? 0}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="calendar" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>ERAS COVERED</Text>
            </View>
            <Text style={styles.cardValue}>{data?.erasCovered ?? 0}</Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="tag" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>BRANDS</Text>
            </View>
            <Text style={styles.cardValue}>{data?.brandsCount ?? 0}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="credit-card" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>TOTAL INVESTED</Text>
            </View>
            <Text style={styles.cardValueMoney}>
              {data?.totalInvested ?? 0} €
            </Text>
          </View>

          <View style={styles.smallCard}>
            <View style={styles.cardHeaderRow}>
              <Feather name="trending-up" size={13} color="#05C785" />
              <Text style={styles.cardLabel}>AVG. PRICE</Text>
            </View>
            <Text style={styles.cardValueMoney}>{data?.avgPrice ?? 0} €</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>TOP CLUBS</Text>
        <View style={styles.sectionCard}>
          {(data?.topClubs ?? []).map((club, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>{club.name}</Text>
                <Text style={styles.barItemCount}>{club.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        club.maxCount ? (club.count / club.maxCount) * 100 : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>KITS BY ERA</Text>
        <View style={styles.sectionCard}>
          {(data?.eras ?? []).map((era, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>{era.name}</Text>
                <Text style={styles.barItemCount}>{era.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        era.maxCount ? (era.count / era.maxCount) * 100 : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>BRAND MIX</Text>
        <View style={styles.pillsRow}>
          {(data?.brands ?? []).map((brand, index) => (
            <View key={index} style={styles.pill}>
              <Text style={styles.pillText}>
                {brand.name} <Text style={styles.pillCount}>{brand.count}</Text>
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>VARIANTS</Text>
        <View style={styles.sectionCard}>
          {(data?.variants ?? []).map((variant, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>
                  {formatLabel(variant.name)}
                </Text>
                <Text style={styles.barItemCount}>{variant.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        variant.maxCount
                          ? (variant.count / variant.maxCount) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>CONDITION MIX</Text>
        <View style={styles.sectionCard}>
          {(data?.conditions ?? []).map((condition, index, array) => (
            <View
              key={index}
              style={[
                styles.barItemContainer,
                index !== array.length - 1 && styles.itemSeparator,
              ]}
            >
              <View style={styles.barItemHeader}>
                <Text style={styles.barItemName}>
                  {formatLabel(condition.name)}
                </Text>
                <Text style={styles.barItemCount}>{condition.count}</Text>
              </View>
              <View style={styles.statBarTrack}>
                <View
                  style={[
                    styles.statBarFill,
                    {
                      width: `${
                        condition.maxCount
                          ? (condition.count / condition.maxCount) * 100
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: -40,
  },
  lockIconContainer: {
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
  lockedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  lockedText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: "#05C785",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  exportButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888888",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardValueMoney: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#05C785",
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
    padding: 16,
  },
  barItemContainer: {
    paddingVertical: 8,
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
    marginBottom: 8,
  },
  barItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  barItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  barItemCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#05C785",
  },
  statBarTrack: {
    height: 4,
    backgroundColor: "#222222",
    borderRadius: 2,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    backgroundColor: "#05C785",
    borderRadius: 2,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(127, 206, 175, 0.3)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  pillCount: {
    color: "#05C785",
    fontWeight: "bold",
  },
});
